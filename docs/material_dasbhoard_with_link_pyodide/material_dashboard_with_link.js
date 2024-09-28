importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: 'patch',
    patch: patch,
    buffers: buffers
  })
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({type: 'status', msg: 'Loading pyodide'})
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = ['https://cdn.holoviz.org/panel/wheels/bokeh-3.6.0-py3-none-any.whl', 'https://cdn.holoviz.org/panel/1.5.1/dist/wheels/panel-1.5.1-py3-none-any.whl', 'pyodide-http==0.2.1', 'hvplot', 'numpy', 'pandas']
  for (const pkg of env_spec) {
    let pkg_name;
    if (pkg.endsWith('.whl')) {
      pkg_name = pkg.split('/').slice(-1)[0].split('-')[0]
    } else {
      pkg_name = pkg
    }
    self.postMessage({type: 'status', msg: `Installing ${pkg_name}`})
    try {
      await self.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}');
      `);
    } catch(e) {
      console.log(e)
      self.postMessage({
	type: 'status',
	msg: `Error while installing ${pkg_name}`
      });
    }
  }
  console.log("Packages loaded!");
  self.postMessage({type: 'status', msg: 'Executing code'})
  const code = `
  \nimport asyncio\n\nfrom panel.io.pyodide import init_doc, write_doc\n\ninit_doc()\n\nimport hvplot.pandas\nimport numpy as np\nimport pandas as pd\nimport panel as pn\n\nPRIMARY_COLOR = "#0072B5"\nSECONDARY_COLOR = "#B54300"\nCSV_FILE = (\n    "https://raw.githubusercontent.com/holoviz/panel/main/examples/assets/occupancy.csv"\n)\n\npn.extension(design="material", sizing_mode="stretch_width")\n\n@pn.cache\ndef get_data():\n  return pd.read_csv(CSV_FILE, parse_dates=["date"], index_col="date")\n\ndata = get_data()\n\ndata.tail()\n\ndef transform_data(variable, window, sigma):\n    """Calculates the rolling average and identifies outliers"""\n    avg = data[variable].rolling(window=window).mean()\n    residual = data[variable] - avg\n    std = residual.rolling(window=window).std()\n    outliers = np.abs(residual) > std * sigma\n    return avg, avg[outliers]\n\n\ndef get_plot(variable="Temperature", window=30, sigma=10):\n    """Plots the rolling average and the outliers"""\n    avg, highlight = transform_data(variable, window, sigma)\n    return avg.hvplot(\n        height=300, legend=False, color=PRIMARY_COLOR\n    ) * highlight.hvplot.scatter(color=SECONDARY_COLOR, padding=0.1, legend=False)\n\nget_plot(variable='Temperature', window=20, sigma=10)\n\nvariable_widget = pn.widgets.Select(name="variable", value="Temperature", options=list(data.columns))\nwindow_widget = pn.widgets.IntSlider(name="window", value=30, start=1, end=60)\nsigma_widget = pn.widgets.IntSlider(name="sigma", value=10, start=0, end=20)\n\nbound_plot = pn.bind(\n    get_plot, variable=variable_widget, window=window_widget, sigma=sigma_widget\n)\n\nwidgets = pn.Column(variable_widget, window_widget, sigma_widget, sizing_mode="fixed", width=300)\npn.Column(widgets, bound_plot)\n\npn.template.MaterialTemplate(\n    site="Panel",\n    title="Getting Started App",\n    sidebar=[\n       pn.pane.HTML('<a href="127.0.0.1:8000/docs/big_app_pyodide/big_app.html">Big app</a>'),\n       variable_widget, \n       window_widget, \n       sigma_widget],\n    main=[bound_plot],\n).servable(); # The ; is needed in the notebook to not display the template. Its not needed in a script\n\n# Source : https://panel.holoviz.org/getting_started/build_app.html\n\nawait write_doc()
  `

  try {
    const [docs_json, render_items, root_ids] = await self.pyodide.runPythonAsync(code)
    self.postMessage({
      type: 'render',
      docs_json: docs_json,
      render_items: render_items,
      root_ids: root_ids
    })
  } catch(e) {
    const traceback = `${e}`
    const tblines = traceback.split('\n')
    self.postMessage({
      type: 'status',
      msg: tblines[tblines.length-2]
    });
    throw e
  }
}

self.onmessage = async (event) => {
  const msg = event.data
  if (msg.type === 'rendered') {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `)
  } else if (msg.type === 'patch') {
    self.pyodide.globals.set('patch', msg.patch)
    self.pyodide.runPythonAsync(`
    from panel.io.pyodide import _convert_json_patch
    state.curdoc.apply_json_patch(_convert_json_patch(patch), setter='js')
    `)
    self.postMessage({type: 'idle'})
  } else if (msg.type === 'location') {
    self.pyodide.globals.set('location', msg.location)
    self.pyodide.runPythonAsync(`
    import json
    from panel.io.state import state
    from panel.util import edit_readonly
    if state.location:
        loc_data = json.loads(location)
        with edit_readonly(state.location):
            state.location.param.update({
                k: v for k, v in loc_data.items() if k in state.location.param
            })
    `)
  }
}

startApplication()