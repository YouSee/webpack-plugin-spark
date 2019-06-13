# webpack-plugin-spark
Webpack plugin for Spark UI development

## Description
This webpack plugin enables use of hot reloading when developing apps for the Spark UI browser: https://www.sparkui.org

## Demo
<img src="images/demo.gif" />

## Install

Using npm:

```console
npm install webpack-nano webpack-plugin-spark --save-dev
```

## Usage
Create a `webpack.config.js` file:

```js
const WebpackPluginSpark = require('webpack-plugin-spark');
const path = require('path');

module.exports = {
	// an example entry definition
	entry: [
		'app.js',
	]
  ...
  plugins: [
    new WebpackPluginSpark({
      progress: true,
      liveReload: true,
      static: path.join(__dirname, './dist')
    })
  ],
  watch: true, // Ensure webpack is running in watch mode
};

```