# Reshape Include

[![npm](https://img.shields.io/npm/v/reshape-include.svg?style=flat-square)](https://npmjs.com/package/reshape-include)
[![tests](https://img.shields.io/travis/reshape/include.svg?style=flat-square)](https://travis-ci.org/reshape/include?branch=master)
[![dependencies](https://img.shields.io/david/reshape/include.svg?style=flat-square)](https://david-dm.org/reshape/include)
[![coverage](https://img.shields.io/coveralls/reshape/include.svg?style=flat-square)](https://coveralls.io/r/reshape/include?branch=master)

Include other HTML files ("partials") into your HTML.

### Install

```sh
npm i reshape-include --save
```

### Usage

Given the following input files:

```html
<!-- index.html -->
<p>Here's my partial:</p>
<include src='_partial.html'></include>
<p>after the partial</p>
```

```html
<!-- _partial.html -->
<strong>hello from the partial!</strong>
```

Process them with reshape:

```js
const {readFileSync} = require('fs')
const reshape = require('reshape')
const include = require('reshape-include')

const html = readFileSync('index.html')

reshape({ plugins: include() })
  .process(html)
  .then((result) => console.log(result.output()))
```

Output:

```html
<p>Here's my partial:</p>
<strong>hello from the partial!</strong>
<p>after the partial</p>
```

### Options

All options are optional, none are required.

| Name | Description | Default |
| ---- | ----------- | ------- |
| **root** | Root path to resolve the include from | the file's path. |
| **alias**| Object with alias mappings, each key is your reference and the corresponding value is the relative path to your file. { button: './views/button.html } | |

### Reporting Dependencies

This plugin will report its dependencies in the standard format as dictated by [reshape-loader](https://github.com/reshape/loader) if you pass `dependencies: []` as an option to reshape when it runs. Dependencies will be available on the output object under the `dependencies` key. For example:

```js
const reshape = require('reshape')
const include = require('reshape-include')

reshape({ plugins: [include()], dependencies: []})
  .process(someHtml)
  .then((res) => {
    console.log(res.dependencies)
    console.log(res.output())
  })
```

If you are using this with webpack, reshape-loader takes care of the dependency reporting and you don't have to do anything 😁

### License

- Licensed under [MIT](LICENSE.md)
- See our [contributing guide](contributing.md)
