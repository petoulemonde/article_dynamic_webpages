# Dynamic & client-side website or portfolio (GitHub Pages) n°1 - Panel (pyodide-worker)

## Introduction

- Lors de création de mon précédent portfolio ( https://towardsdatascience.com/full-guide-to-build-a-professionnal-portfolio-with-python-markdown-git-and-github-page-for-66d12f7859f0 ) réalisé avec mkdocs,. 
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

Rapide présentation de la suite Holoviz (pour les plus curieux) : 
- Solution complète, de la visualization au dashboarding de big data.
- Code haut niveau --> construction rapide
- Ultra polyvalent : 
	- n'importe quel package de manipulation de données en entrée (polars, pandas, RAy, Dask, ...) 
	- N'importe quel type package de visualisation en sortie (parmi les plus grnad packages) : MatPlotLib, Plotly, Bokeh.
Idée de plusieurs packages de sorties repris un peu partout en python, cf. article suivant : https://medium.com/towards-data-science/the-power-of-pandas-plots-backends-6a08d52071d2 .
Package créé et maintenu par les équipes de Anaconda, le gestionnaire de package.

### Question de recherche 
Site dynamique de dashboard (**écriture et exécution de code hors scope : autre article ?**), multipage, full client-side ?

SUjet colossal, avec des dizaine sinon des centaines de solutions --> série de plusieurs articles, à cahque fois une nouvelle solution.


## Matériel et méthodes
Contingence techniques : 
- Pas de JavaScript (maitrise pas suffisante)
- Dashboarding par package Panel : volonté de monter en compétence sur le package. Si la nécessité se présente à mes yeux ou forte demande de votre part, possibilité avec autres packages type Dahs, strealint, NiceGUI, ...

Prinipaux packages/solftwares : Panel (holoviz)

3 scripts : 
- app.py 
==code==
- big_app
==code==
- material dashboard
==code==

2 tests : 
- pythonh tpp.server= émule un site web
- github pages déploiement

Déploiement python .http : 
Coté Panel : 
```python
panel convert simple_app.py --to pyodide-worker --out pyodide
```
Puis : `python -m http.server`
## Résultats
- python http : tout marche parfaitemnt et rapidement, nickel chrome !

- GitHub Pages : 
Parti création du repo github et de la configuration pour créer une GitHub Pages pour un repor non préicsé ici (voir mon précédent aritcle)

Transfoer le script python en une application GitHub Pages grâce à  
```python

```


## Discussions 
- Pas de possibilité de faire un site multipage
- pas de possibilité d'éxécuter du code directement sur le site

- Solution idéal pour des dashboards percutants en un minimum d'effort.