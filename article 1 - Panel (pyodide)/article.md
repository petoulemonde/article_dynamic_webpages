# Dynamic GitHub Pages n°1 - Panel (pyodide-worker)

## Introduction
Depuis plusieurs année déjà, je rêvais d'avoir un joli portfolio pour présenter mes projets réalisés en temps que data scientist en herbe. Au bout de quasiment 1 an de réflexion, d'essais, d'échecs et de quelques réussites, j'ai réussi un créer mon premier portfolio sur GitHub Pages. Content de cette belle réussite personnelle, j'en ai fait un article pour partager le fruit de mes recherches à la communauté, disponible ici ( https://towardsdatascience.com/full-guide-to-build-a-professionnal-portfolio-with-python-markdown-git-and-github-page-for-66d12f7859f0 ).
Ce portfolio a été réalisé grâce au package python mkdocs. Mkdocs est un merveilleux package pour ce genre de projet, mais avec quelques défaut, le principal à mes yeux étant l'absence total d'interactivité avec le lecteur. Plus j'avançais dans la création de mon portfolio, et plus l'absence d'interactivité me frustrait. Mes contraintes a l'époque (toujours vrai actuellement) était de tout faire exécuter coté client et gratuitement, la solution GitHub Pages était donc parfaitement adapté à mes besoin.

Plus j'avançais dans mon portfolio statique, et plus l'idée d'avoir un système de portfolio dynamique me trottait dans la tête. Mon objectif était clair : trouver une solution pour créer un portfolio interactif pour le lecteur, hébergé sur GitHub Pages. Lors de mes recherches, je n'ai trouvé quasiment aucun article qui traite de ce sujet. j'ai donc commencer à chercher des softwares, des packages, et bout de code pour répondre à ce problème.

La question de recherche qui guide cet article est donc la suivante : comment créer un site web dynamique full client-side ? Mes contraintes techniques sont les suivantes : Utiliser GitHub Pages.
Coté package de dashboarding, j'ai choisi de me limiter à Panel de la suite holoviz, car c'est un super package et que je souhaite monter en compétence dessus.

A l'occasion de cet article, j'ai cherché et j'ai trouvé pleins de solutions plus ou moins proches. Cet article est donc le premier d'une série d'articles, qui auront pour but de présenter des solutions différents à cette même question de recherche.

Quel est l'intérêt d'un tel article ?
GitHub Pages est une solution très intéressante de présentation d'organisation/projet, 100% hébergée par GitHub. Pouvoir y inclure du contenu dynamique permet de communication de façon percutante sur son organisation ou son projet. Pour les professionnels de la data, c'est une solution très utile pour générer rapidement un portfolio dynamique et percutant.

Holoviz est une suite passionnante et extrêmement riche. C'est une solution complète de visualisation et de dashboarding, tout aussi puissante sur des données de taille raisonnable que de la big data. La suite prend en charge tous les grands packages de manipulation de données en entrée (polars, pandas, dask, X-ray, …), et offre une syntaxe haut niveau pour générer des visualisations interactives en un minimum de code. Ce package permet aussi de customiser la sortie et notamment de choisir son back-end de visualisation comme pandas (j'en ai fait un article si vous voulez en savoir plus
: https://medium.com/towards-data-science/the-power-of-pandas-plots-backends-6a08d52071d2 ). Pour en savoir plus sur cette super suite de packages, je vous suggère cet article ( https://towardsdatascience.com/3-ways-to-build-a-panel-visualization-dashboard-6e14148f529d ).

## Materials & Methods
Pour ce travail, mon bagage technique m'impose quelques contingences : 
- je ne sais pas encore coder assez  du JavaScript pour en faire des scripts pour ce travail,
- le package de dashboarding sera Panel par volonté de monter en compétence. Si la nécessité se présente à mes yeux, je n'exclus pas de renouveller l'exercice avec d'autres packages de dasbhoarding (type Dash, strealint, NiceGUI, …). Ce n'est cependant pas ma priorité.

Pour cet article, mon environnement technique est le suivant : 
- packages python : 
	- Panel

Lors de mes recherches, j'ai identifié 3 scripts différents par leur complexité et leur visuel, qui sera de bon étalons de test : 
- Une application à 1 paramètre que j'appelle 'application simple':
==code==
source : 
- Une application à 3 paramètre que j'appelle 'big app':
==code==
source : 
- Un Dashboard utilisant le Template Panel 'Material', que j'appele 'material dasbhoard':
==code==
source : 

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
- `--dev` : recharger le dashboard à chaque modification des fichiers sous-jancets (peut nécessité l'installation d'un ou plusieurs autres pakcages, notammetn pour suivre si modification oui/non des ficheirs sous-jacents)

Ces visualisations me permettront de voir si tout marche bien et dans des délais raisonnables lors de mes tests de déploiement.

------------------------

## Résults

### First step : transform python script to HTML interactive script
Le package Panel permet en 1 ligne de code de transformer un script python d'application panel en une application HTML :
```python
panel convert simple_app.py --to pyodide-worker --out app
```
Explication :
- `panel convert` : commange du package panel de conversion du script python
- `simple_app.py` : script python à convertir
- `--to pyodide-worker` : Panel peut transcrire l'application Python dans plusieurs types de support intégrable dans des productions HTML. Dans cet article, je me suis concentré sur la sortie `pyodide-worker`
- `--out app` : dossier de sortie des 2 ficheirs (HTML et JavaScript) généré
Dans le dossier app (partie '--to app' de la ligne de code), 2 fichiers, de même nom que le script python avec les extensions 'html' et 'js' devraient apparaitre. Ce sont grâce à ses scripts que nous pourrons intégrer notre application au sein de contenus web. 
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

Après avoir tester chacune des 3 applications énoncées précédement, cette solution fonctionne parfaitement avec chacune des applications, sans perte de vitesse dans le chargement et l'utilisation des applications.

-----------

### Second test: GitHub Pages deployment 
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
==C'est quoi pyodide ?==

- Possibilité de créer un dashboard multipage facilement et hébergeable directement sur GitHub Pages grâce à la magie de WebAssembly.
- Solution idéal pour des dashboards dynamiques & percutants en un minimum d'effort

- Pas de possibilité d'éxécuter du code directement sur le site
- Visuel du dasbhoard paramétrable mais pas aussi aisément que l'ai la création
