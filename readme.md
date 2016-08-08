# pd-assets

AngularJS SDK used internally at PokitDok. Contains commonly used components, design patterns, and general best practice guides for front end development at PokitDok. While `bower_components` are committed in this repo.

## Quick start
Run the following commands:
```bash
git clone https://gitlab.pokitdok.com/pokitdok/plmp.git
cd pd-assets
# install bower on machine if not previously installed
sudo npm install -g bower
# install gulp on machine if not previously installed
sudo npm install -g gulp
## install npm deps and bower deps
npm install
```
And you should be all set up!

Now run:
```bash
gulp serve:docs
```

And you should be running the documentation site locally. You can use this documentation site to view all available components, design patterns, and best practices.
```bash
gulp serve:docs
```
watches the component and style directories and refreshes on file change. This allows developers to work on components inside the documentation site before submitting a PR with their new component or component update.

## Directory structure

This repo has the following directory structure:
```
pd-assets
│   README.md
│   bower.json
|   package.json
|   gulpfile.js    
│
|─── vendor (third party dependencies)
|
|
|─── docs-content
|    |─── components
|    |─── style
|    |--- resources    
|
|─── fonts
|       Avenir.*
|       Muli.*
|       icon fonts (pokit, glyphicons)
|       
|─── images
|   
|
|─── styles
|       
|
|─── components
|       |─── pd-component
|               pd-component.less
|               pd-component.js
|               views --
|                   pd-component.html
|
```

### vendor

Inside of `bower_components` you will find all of the third party libraries and frameworks that we use at PokitDok. `bower_components` is not included in the `.gitignore` so that when you pull the submodule, no `bower install` is needed. To add a dependency, run the following command:

```
bower install jquery --save
```

This will install the dependency to the `bower_components` folder and save it as a dependency in the `bower.json` file located in the root of the project directory. If you want to see a list of the currently installed dependencies, check out the `bower.json` file in the root of this repo.

### images & fonts

At PokitDok, we use some common fonts and images across all projects.

In `images` folder, you will find a variety of `.PNG` and `.GIF` icons that are used in different applications.

In the `fonts` folder, you will find our font of choice, Muli  (https://www.google.com/fonts/specimen/Muli), as well as the Avenir font. The `fonts` folder also contains our various sets of icon fonts.

### styles

The `less` folder contains all core PokitDok styles. This folder contains a single `imports.less` file that imports only the `.less` files we require from Bootstrap as well as a `pd-variables.less` file that matches the Bootstrap `variables.less` to provide support for overriding the stock Bootstrap variables.

The remaining files are individual `.less` files that are split by component, eg. `pd-input.less`, `pd-nav.less`, `pd-buttons.less`, etc.

*Note*: Module specific styles should live in a `.less` inside of that individual module and *not* inside of the `./less` folder.

### docs

Documentation is important! That's why we have set up a documentation generation workflow à la ngDoc (https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation), a wonderful Dgeni (https://github.com/angular/dgeni) package developed by the Angular core team.

The documentation is generated using a Gulp task found in `gulpfile.js` which is in the root of the repo. To generate and serve your documentation site locally, you will first need to install the Gulp plugins that generate the documentation.

First run:

```bash
npm install
```

After that runs with no errors, you can now run:

```bash
gulp build:docs
```

And you should see a new browser tab open up with the PD Assets documentation site running locally.

### docs-content

The content folder houses some static content pages that are used when building the docs site. They follow the Dgeni documentation spec. These pages must be named `*.ngdoc` so that Gulp task that builds the documentation can parse them correctly.

These `*.ngdoc` files support both Markdown and HTML within the `@description` tag that is required at the top of these documents.