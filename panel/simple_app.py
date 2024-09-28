
import panel as pn

pn.extension(design="material")

slider = pn.widgets.IntSlider(name="Select a value", value=10, start=0, end=100)
pn.Column(
    "# Hello Panel + Quarto!",
    pn.rx("You selected: {}").format(slider),
).servable()

# Source : https://awesome-panel.github.io/holoviz-quarto/getting-started.html