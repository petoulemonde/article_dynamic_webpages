# Script - Dynamic GitHub Pages n°1 - Panel (pyodide-worker)

## Introduction
- Lors de création de mon précédent portfolio ( https://towardsdatascience.com/full-guide-to-build-a-professionnal-portfolio-with-python-markdown-git-and-github-page-for-66d12f7859f0 ) réalisé avec mkdocs,: 
  Mkdocs : complètement statique, aucun moyen de faire du dynamique type dashboarding ou exécution de code directement sur le site. 
  --> frustration de ne pas pouvoir faire un site dynamique
- Mes contraintes de l'époque, toujours vrai : hébergement sur GitHub Pages (je n'ai pas de serveur à dispo).

- Idée a germé : identifier des solutions pour une Page GitHub dynmaique fully client-side : 
	- D'après mes recherches jamais fait
	- Monter en compétence technique : 
		- Quarto (https://quarto.org/) qu'on m'avait recommandé et dont j'avais entendu parlé, 
		- Panel (https://panel.holoviz.org/index.html) : partie dashboard de la suite Holoviz (https://holoviz.org/)
	- monter en compétence de communication : pouvoir communiquer d'une façon nouvelle = inhérent rôle Data scientist
	- Mettre une pied dans les 'nouvelles' technologies du web : WebAssembly (recommandation super article descriptif : https://developer.mozilla.org/fr/docs/WebAssembly ), PyScript (https://pyscript.com/), Pyodide (https://pyodide.org/en/stable/).

- Intérêt d'un tel travail ?
	- créer des pages web de projet ou d'orgnaisation dynamique, percutante et gratuitement grâce à GitHub Page
	- Créer son portfolio de dat parofessionnal dynamique et client-side, pour que le lecteur puisse intéragir avec les résultats --> communication plus intéressante et plus riche.

Rapide présentation de la suite Holoviz (pour les plus curieux) : 
- Solution complète, de la visualization au dashboarding de big data.
- Code haut niveau --> construction rapide
- Ultra polyvalent : 
	- n'importe quel package de manipulation de données en entrée (polars, pandas, RAy, Dask, ...) 
	- N'importe quel type package de visualisation en sortie (parmi les plus grnad packages) : MatPlotLib, Plotly, Bokeh.
Idée de plusieurs packages de sorties repris un peu partout en python, cf. article suivant : https://medium.com/towards-data-science/the-power-of-pandas-plots-backends-6a08d52071d2 .
Package créé et maintenu par les équipes de Anaconda, le gestionnaire de package.
Description plus détaillée : https://towardsdatascience.com/3-ways-to-build-a-panel-visualization-dashboard-6e14148f529d


### Question de recherche 
Site dynamique de dashboard (**écriture et exécution de code hors scope : autre article ?**), multipage, full client-side ?

SUjet colossal, avec des dizaine sinon des centaines de solutions --> série de plusieurs articles, à cahque fois une nouvelle solution.

## Matériel et méthodes
Contingence techniques : 
- Pas de JavaScript (maitrise pas suffisante)
- Dashboarding par package Panel : volonté de monter en compétence sur le package. Si la nécessité se présente à mes yeux ou forte demande de votre part, possibilité avec autres packages type Dahs, strealint, NiceGUI, ...

Prinipaux packages/solftwares : Panel (holoviz), mkdocs, 

3 scripts : 
- app.py 
==code==
- big_app
==code==
- material dashboard
==code==

2 tests : 
- test sur serveur html, via élulatin serveur html local avec `python -m htpp.server`
- github pages déploiement

## Résultats

### VIsualiser fonctionnement optimal que devrait avoir le dasbhoard
Fonction Panel de visualisation du dashboard, notamment utile lors de la construction de ce dernier : 
```python
panel serve simple_app.py --dev
```
Explication : 
- `panel serve simple_app.py` : visualiser le rendu du dashboard
- `--dev` : recharger le dashboard à chaque modification des sifhciers sous-jancets (peut nécessité l'installation d'un ou plusieurs autres pakcages, notammetn pour suivre si modification oui/non des ficheirs sous-jacents)

Cette visualisatin = référence pour les solutions de déploiement.

### Déploiement serveur
1. Transformer app python en app dynamique html : 
Coté Panel (exemple avec simple_app.py) : 
```python
panel convert simple_app.py --to pyodide-worker --out app
```
Dans le dossier app (partie '--to app' de la ligne de code), 2 fichiers, de même nom que le script python avec les extensions 'html' et 'js' devraient apparaitre = version transcrite pour le web dynamqiue du dashboard python. SOus le capot, utilisation de WebAssembly.
2. Emuler serveur `python -m http.server`
3. Cliquer sur l'app html à lancer
<u>NB</u> : pour lancer automatiquement le script python lorsque on ouvre son dosser, intituler les ficheirs html et javascript 'index'.
exemple : 
```markdown
app/
|- index.html
|- index.js
```
Lorsque ouverture de app/ dans le serveur html local, index.html se lancera automatiquement.

- Les 3 apps marchent parfaitements et rapidement, nickel chrome !

### GitHub Pages : 
Parti création du repo github et de la configuration pour créer une GitHub Pages pour un repor survolé ici, car description beaucoup plsu fine dans mon précédent article.

Transfoer le script python en une application Github pages grâce à : 
1. Mettre les convervsion en pyodide-worker dans un dossier 'docs/' à la racine du repo (nom important & emplacement !)
```python
panel convert simple_app.py --to pyodide-worker --out docs
```
2. Ajouter un fichier 'index.html' qui pointe vers le ficheir html de l'app pour renoyver vers la page (ou bien l'application en elle même, en nommant les ficheirs html et javascript de l'app 'index.html' et 'index.javascript').
ex : page github projet : https://petoulemonde.github.io/article-dynamic-webpages
Ajouter 'index.html' à la racine = home page de la page github projet. Lien vers les dashboards (ex : https://petoulemonde.github.io/article-dynamic-wabpages/docs/simple_app.html)
3. Pusher dans le remote repo
4. Dans le repo, activer la création d'un apge github projet.

### Problèmes rencontrés
Dasbhoards tel que testé = 1 seule page, sans lien vrs d'autres pages pour créer un site web riche.
Possibilité d'ajouter des liens vers d'autres pages du site dans les apps.
exemple avec Material template : 
==mettre le code==

## Discussions 
- Possibilité de créer un dashboard multipage facilement et hébergeable directement sur GitHub Pages grâce à la magie de WebAssembly.
- Solution idéal pour des dashboards dynamiques & percutants en un minimum d'effort

- Pas de possibilité d'éxécuter du code directement sur le site
- Visuel du dasbhoard paramétrable mais pas aussi aisément que l'ai la création
