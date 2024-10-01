# Dynamic GitHub Pages n°1 - Panel (pyodide-worker)

## Introduction
Depuis plusieurs année déjà, je rêvais d'avoir un joli portfolio pour présenter mes projets réalisés en temps que data scientist en herbe. Au bout de quasiment 1 an de réflexion, d'essais, d'échecs et de quelques réussites, j'ai réussi à un créer mon premier portfolio sur GitHub Pages. Content de cette belle réussite personnelle, j'en ai fait un article pour partager le fruit de mes recherches à la communauté, disponible ici ( https://towardsdatascience.com/full-guide-to-build-a-professionnal-portfolio-with-python-markdown-git-and-github-page-for-66d12f7859f0 ).
Ce portfolio a été réalisé grâce au package python mkdocs. Mkdocs est un merveilleux package pour ce genre de projet, mais avec quelques défaut, le principal à mes yeux étant l'absence total d'interactivité avec le lecteur. Plus j'avançais dans la création de mon portfolio, et plus l'absence d'interactivité me frustrait. Mes contraintes a l'époque (toujours vrai actuellement) était de tout faire exécuter gratuitement et coté client, la solution GitHub Pages était donc parfaitement adapté à mes besoin.

Plus j'avançais dans mon portfolio statique, et plus l'idée d'avoir un système de portfolio dynamique me trottait dans la tête. Mon objectif était clair : trouver une solution pour créer un portfolio interactif pour le lecteur, hébergé sur GitHub Pages. Lors de mes recherches, je n'ai trouvé quasiment aucun article qui traite de ce sujet. j'ai donc commencer à chercher des softwares, des packages, et des bouts de code pour répondre à ce problème.

La question de recherche qui guide cet article est donc la suivante : comment créer un site web dynamique full client-side ? Mes contraintes techniques sont les suivantes : Utiliser GitHub Pages.
Coté package de dashboarding, j'ai choisi de me limiter à Panel de la suite holoviz, car c'est un super package et que je souhaite monter en compétence dessus.

A l'occasion de cet article, j'ai cherché et j'ai trouvé pleins de solutions plus ou moins proches. Cet article est donc le premier d'une série d'articles, qui auront pour but de présenter les différentes solutions à cette même question de recherche.

Mais quel intérêt y a-t-il à avoir des pages Github dynamique ?
GitHub Pages est une solution très intéressante de présentation d'organisation/projet, 100% hébergée par GitHub, gratuite, avec un minimum de configuration au début et aucun entretien d'un quelconque server. Pouvoir y inclure du contenu dynamique permet de communiquer de façon percutante sur son organisation ou son projet. Pour les professionnels de la data, c'est une solution très utile pour générer rapidement un portfolio dynamique et intéressant.

Holoviz est une suite passionnante et extrêmement riche. C'est une solution complète de visualisation et de dashboarding, tout aussi puissante sur des données de taille raisonnable que de la big data. La suite prend en charge tous les grands packages de manipulation de données en entrée (polars, pandas, dask, X-ray, …), et offre une syntaxe haut niveau pour générer des visualisations interactives en un minimum de code. Ce package permet aussi de customiser la sortie et notamment de choisir son back-end de visualisation comme pandas (j'en ai fait un article si vous voulez en savoir plus
: https://medium.com/towards-data-science/the-power-of-pandas-plots-backends-6a08d52071d2 ). Pour en savoir plus sur cette super suite de packages, je vous suggère cet article ( https://towardsdatascience.com/3-ways-to-build-a-panel-visualization-dashboard-6e14148f529d ).

## Materials & Methods
Pour ce travail, mon bagage technique m'impose quelques contingences : 
- je ne sais pas encore coder assez bien en JavaScript pour en faire des scripts complet et écrire directement en JavaScript des morceaux de code,
- le package de dashboarding sera Panel par volonté de monter en compétence. Si la nécessité se présente à mes yeux, je n'exclus pas de renouveller l'exercice avec d'autres packages de dasbhoarding (type Dash, strealint, NiceGUI, …). Ce n'est cependant pas ma priorité.

Pour cet article, mon environnement technique est le suivant : 
- packages python : 
	- Panel
j'utilise conda et VSCode pour mes scripts et ma gestion des environneemnts. AUcun soucis si vous utilisez d'autres solutions, ça n'aura pas d'impact sur la suite.

Lors de mes recherches, j'ai identifié 3 scripts différents par leur complexité et leur visuel, qui sera de bon étalons de test : 
- Une application à 1 paramètre que j'appelle 'application simple':
```python
import panel as pn

pn.extension(design="material")

slider = pn.widgets.IntSlider(name="Select a value", value=10, start=0, end=100)
pn.Column(
    "# Hello Panel + Quarto!",
    pn.rx("You selected: {}").format(slider),
).servable()
```
source : https://awesome-panel.github.io/holoviz-quarto/getting-started.html
- Une application à 3 paramètre que j'appelle 'big app':
```python
import io
import panel as pn
import pandas as pd
import hvplot.pandas

pn.extension(template='fast')

pn.state.template.title = 'hvPlot Explorer'

upload = pn.widgets.FileInput(name='Upload file', height=50)
select = pn.widgets.Select(options={
    'Penguins': 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv',
    'Diamonds': 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/diamonds.csv',
    'Titanic': 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv',
    'MPG': 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/mpg.csv'
})

def add_data(event):
    b = io.BytesIO()
    upload.save(b)
    b.seek(0)
    name = '.'.join(upload.filename.split('.')[:-1])
    select.options[name] = b
    select.param.trigger('options')
    select.value = b
    
upload.param.watch(add_data, 'filename')

def explore(csv):
    df = pd.read_csv(csv)
    explorer = hvplot.explorer(df)
    def plot_code(**kwargs):
        code = f'```python\n{explorer.plot_code()}\n```'
        return pn.pane.Markdown(code, sizing_mode='stretch_width')
    return pn.Column(
        explorer,
        '**Code**:',
        pn.bind(plot_code, **explorer.param.objects())
    )

widgets = pn.Column(
    "Select an existing dataset or upload one of your own CSV files and start exploring your data.",
    pn.Row(
        select,
        upload,
    )
).servable()  

output = pn.panel(pn.bind(explore, select)).servable()

pn.Column(widgets, output)
```
source : https://panel.holoviz.org/getting_started/build_app.html
- Un Dashboard utilisant le Template Panel 'Material', que j'appele 'material dasbhoard':
```python
import hvplot.pandas
import numpy as np
import pandas as pd
import panel as pn

PRIMARY_COLOR = "#0072B5"
SECONDARY_COLOR = "#B54300"
CSV_FILE = (
    "https://raw.githubusercontent.com/holoviz/panel/main/examples/assets/occupancy.csv"
)

pn.extension(design="material", sizing_mode="stretch_width")

@pn.cache
def get_data():
  return pd.read_csv(CSV_FILE, parse_dates=["date"], index_col="date")

data = get_data()

data.tail()

def transform_data(variable, window, sigma):
    """Calculates the rolling average and identifies outliers"""
    avg = data[variable].rolling(window=window).mean()
    residual = data[variable] - avg
    std = residual.rolling(window=window).std()
    outliers = np.abs(residual) > std * sigma
    return avg, avg[outliers]


def get_plot(variable="Temperature", window=30, sigma=10):
    """Plots the rolling average and the outliers"""
    avg, highlight = transform_data(variable, window, sigma)
    return avg.hvplot(
        height=300, legend=False, color=PRIMARY_COLOR
    ) * highlight.hvplot.scatter(color=SECONDARY_COLOR, padding=0.1, legend=False)

get_plot(variable='Temperature', window=20, sigma=10)

variable_widget = pn.widgets.Select(name="variable", value="Temperature", options=list(data.columns))
window_widget = pn.widgets.IntSlider(name="window", value=30, start=1, end=60)
sigma_widget = pn.widgets.IntSlider(name="sigma", value=10, start=0, end=20)

bound_plot = pn.bind(
    get_plot, variable=variable_widget, window=window_widget, sigma=sigma_widget
)

widgets = pn.Column(variable_widget, window_widget, sigma_widget, sizing_mode="fixed", width=300)
pn.Column(widgets, bound_plot)

pn.template.MaterialTemplate(
    site="Panel",
    title="Getting Started App",
    sidebar=[variable_widget, window_widget, sigma_widget],
    main=[bound_plot],
).servable();
```
source : https://panel.holoviz.org/getting_started/build_app.html

Pour répondre à mon objectif de déploiement autant web que GitHub Pages, je testerai le déploiement de chaque des app : 
- sur un serveur local python, généré grâce à `python -m http.server`
- GitHub Pages.

### Visualize the optimal operation that dasbhoard should have
Avant de me lancer dans les tests, je dois avoir un étalon de comment doit fonctionner chaque application dans un monde parfait. Pour celà, j'utilise la fonction du package Panel d'émulation locale de l'application : 
```python
panel serve simple_app.py --dev
```
Explication : 
- `panel serve simple_app.py` : visualiser le rendu du dashboard
- `--dev` : recharger le dashboard à chaque modification des fichiers sous-jacents (peut nécessité l'installation d'un ou plusieurs autres pakcages, notammetn pour suivre si modification oui/non des ficheirs sous-jacents)

Voici le rendu attendu :
- L'application à 1 paramètre : 
[Simple app]{simpla_app.gif} 

- L'application à 3 paramètres : 
[Big app]{big_app.gif} 

- L'application avec le template : 
[Material Dashboard]{material_dashboard.gif} 

Ces visualisations me permettront de voir si tout marche bien et dans des délais raisonnables lors de mes tests de déploiement. 

## Résults

### First step : transform python script to HTML interactive script
Le package Panel permet en 1 ligne de code de transformer un script python d'application panel en une application HTML :
```python
panel convert simple_app.py --to pyodide-worker --out docs
```
Explication :
- `panel convert` : commange du package panel de conversion du script python
- `simple_app.py` : script python à convertir
- `--to pyodide-worker` : Panel peut transcrire l'application Python dans plusieurs types de support intégrable dans des productions HTML. Dans cet article, je me suis concentré sur la sortie `pyodide-worker`
- `--out docs` : dossier de sortie des 2 ficheirs (HTML et JavaScript) généré
Dans le dossier docs (partie '--to docs' de la ligne de code), 2 fichiers, de même nom que le script python avec les extensions 'html' et 'js' devraient apparaitre. Ce sont grâce à ses scripts que nous pourrons intégrer notre application au sein de contenus web. 
Cette conversion de code (de python à html a javascript) est possible grâce à WebAssembly. Pyodide est un portage de CPython vers WebAssembly/Emscripte (plus d'infos ici : https://pyodide.org/en/stable/).
Si vous ne connaissez par WebAssembly, je vous invite à dévorer dès maintenant l'article de Mozilla sur le sujet : https://developer.mozilla.org/en-US/docs/WebAssembly. J'en ferai un article pour en décrire l'histoire, la portée et les impacts potentiels, WebAssmelby sera à mon avis un vrai gamer changer dans les années à venir. Pour en savoir, restez connecter!

### First test: local web server deployment
1. Emuler le serveur local web avec python : `python -m http.server`. Cette commande renverra une URL locale à laquelle vous connecter sur votre navigateur (de type 127.0.0.1:8000)

3. Cliquer sur le script HTML de notre application python
<u>NB</u> : lors de la navigation dans nos ficheirs via le serveur HTML, pour lancer automatiquement le l'application souahitée lorsque qu'on ouvre son dossier, intituler les ficheirs HTML et javascript 'index.html' et 'index.js.
exemple : 
```markdown
app/
|- index.html
|- index.js
```
Lors de l'ouverture de app/ dans le serveur local HTML, index.html se lancera automatiquement.

Rapport des tests : 
| | Deployment on local html server | 
| Simple app | ✅ | 
| Big app | ✅ | 
| Material Dashboard | ✅ | 

Après avoir tester chacune des 3 applications énoncées précédement, cette solution fonctionne parfaitement avec chacune des applications, sans perte de vitesse dans le chargement et l'utilisation des applications.

### Second test: GitHub Pages deployment 
Dans cet article, je wurvole rapidement la partie configuration de GitHub Pages sur GtHub, car je l'ai décrit en détail dans mon précédent article ( https://towardsdatascience.com/full-guide-to-build-a-professionnal-portfolio-with-python-markdown-git-and-github-page-for-66d12f7859f0 ).

1. Point d'alerte de l'étape 1 : le fichier 'docs' qui héberge les scripts html et JaVaScript soit s'appeler 'docs' et être placé à la récine du repo. Ce sont 2 conditions nécessaire pour pouvoir ensuite déployer les application sur GitHub Pages. Ni le nom du dossier ni sont emplacement ne peuvent être modifiés. 

2. 2 possiblités : 
2.a. Renommer les fichiers de l'app 'index.html' et 'index.js', et les mattant directement dans 'docs'. Cette solution ouvrira directemnt la GutHub Pages de votre repository sur l'app
2.b. Créez un fichier 'index.html' directement dans 'docs', et ajoutez-y un chemin vers le ficher html de votre application.
Voici le contenu de 'index.html' que je créé lors de mes tests de déploiement : 
```html
1. <a href="https://petoulemonde.github.io/article_dynamic_webpages/simple_app_pyodide/simple_app.html">Simple app</a>
<br/>
2. <a href="https://petoulemonde.github.io/article_dynamic_webpages/big_app_pyodide/big_app.html">Big app</a>
<br/>
3. <a href="https://petoulemonde.github.io/article_dynamic_webpages/material_dashboard_pyodide/material_dashboard.html">Material dashboard</a>
```
Explication : 
- `https://petoulemonde.github.io/` : URL de mon portfolio
- `article_dynamic_webpages/` : mon repo de travail pour cet article
- `simple_app_pyodide/simple_app.html` : dossier/application html à ouvrir. !! Dans le repo, le fichier est rangé dans **docs**/simple_app_pyodide/simple_app.html, mais il ne faut pas mentionner 'docs' dans le chemin absolu. POurquoi cette différence entre l'exploreur de ficheir et le lien ? GitHub déploie depuis le dossier docs, 'docs' est sa racine de travail.

3. Pusher dans le remote repo (dans mon exemple précédent, le repo 'article_dynamic_webpages')

4. Dans le repo, activer la création d'un page github projet. Dans la page de configuration, voici comment cofnigurer la page GitHub : 
[GitHub Pages configuration]{GitHub Pages configuration.jpg}
C'est ici que le dossier 'docs' est essentiel pour pouvoir déployer notre application, sinon nous ne pouvons pas saisir de branches de déployement dans 'master'.

Rapport des tests : 
| | Deployment on local html server | Deployment on GitHub Pages
| Simple app | ✅ | ✅ |
| Big app | ✅ |  ✅ |
| Material Dashboard | ✅ |  ✅ |

Concernant la solution 2.b. : C'est une solution particulièrement intéressante, car elle permet d'avoir une page d'accueil statique de notre site web ou portfolio, puis de distribuer vers des pages spéficiques de projets dynamiques. ELle ouvre la porte à des GutHub Pages statiqieus et dynamiques utilisant mkdocs pour l'aspect statique et ses jolis design, et à Panel pour les pages intéractives. Je ferai probablement mon prochaine article sur ceette solution de déploiement mkdocs + Panel (pyodide-worker), je serai ravi de vous compter parmi mes lecteurs une nouvelle fois.

### Problèmes rencontrés
Les dashboards testés jusqu'ici ne distribue pas vers d'autres pages du site/portfolio, la seule alternative identifié est de créer une page statiqute d'accueil, qui redistribue vers des dasbhoards au sein du site. Est-il possible d'avoir un site avec plusieurs pages sans utilser de page statique ? 
La réponse est oui, car les dasbhaords peuvent eux-même intégrer des liens, et notamment des liens vers d'autres dashboards du même site.
J'ai modifié le code de l'app Material pour y ajouter un lien (ajout de `pn.pane.HTML(...`)) : 
```python
pn.template.MaterialTemplate(
    site="Panel",
    title="Getting Started App",
    sidebar=[
       pn.pane.HTML('<a href="127.0.0.1:8000/docs/big_app_pyodide/big_app.html">Big app</a>'), # New line ! 
       variable_widget, 
       window_widget, 
       sigma_widget],
    main=[bound_plot],
).servable();
```
Ceci ajoute un lien dans la side bar de l'application : 
[Link in Material Dasbhaord]{link_material_dashboard.jpg}
Si la preuve ici n'est pas jolie, elle monte bien qu'un dashboard peut intégrer des liens vers d'autres pages, est donc qu'il est possible de faire un site avec plsieurs pages uniquement avec Panel, génial ! 
En réalité, je me concentre ici sur la partie dasbhoarding de Panel, mais Panel permet aussi de faire des pages statiques, et donc sans même maitriser mkdocs, de faire des sites avec plusieurs pages mélant statique et dynamique.

## Discussions 
Panel est un package très intéressant et très puissant, qui permet de créer des site web dynamiques facilement et hébergée sur GitHub Pages, notamment grâce à la magie de WebAssembly. Le package permet vraimetn de se concentrer sur la partie création du dasbhoard, puis en seulement quelques lignes de convertir ce dasbhoard en contenu web. COuplé à la facilité d'utilisation de GitHub Pages, Panel permet de déployer très rapidement des dashboards de données.

Cette solution bien que géniale comprend plusieurs limites que j'ai rencontré au fur et à mesure de mes tests. La première est qu'il n'est pas possible d'intégrer du code éditable et exécutable par l'utilisateur. J'aurai aimer pouvoir laisser l'utilisateur explorer les données à sa façon, en partageant le code que j'ia écrit aux utilisateurs pour qu'ils puissent le modifier et explorer les données à leur façon.
La deuxième et dernière limite est que la personnalisation des dashboards n'est pas aussi aisément que leur création. Hvplot propose via l'outil *explorer* une solution visuel pour explorer ses données et créer des graphiques. Mais une fois dans le code, je trouve la personnalisation un peu difficile. Le packge est génial de puissance et de fonctionalité, et je manque probalbment encore un peu de compétence dessus, je penses donc que c'est avant tout dû à mon manque de pratique sur ce package plus qu'au package en lui-même.

Si vous êtes arrivé jusqu'à là, merci pour votre attention! Lors de mon précédent article, vos commentaires m'ont été très utile. Grâce à vous, j'ai découvert Quarto et j'ai obtenu des pistes d'améliorations pour rendre mes articles plus intéressants pour vous lecteur. Laissez moi un petit commentairep our me dire comment je pourrais améliorer mon article autant techniquement que visualement, pour me permettre de vous écrire un article plus intéressant encore la prche fois.

Bonne continuation dans votre aventure pythonic!