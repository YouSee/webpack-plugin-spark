# webpack-plugin-spark
Spark UI plugin for webpack with hot reloading

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
    })
  ],
};

```