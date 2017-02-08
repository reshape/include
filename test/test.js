const include = require('..')
const reshape = require('reshape')
const test = require('ava')
const path = require('path')
const sugarml = require('sugarml')
const {readFileSync} = require('fs')
const fixtures = path.join(__dirname, 'fixtures')

test('default include html', (t) => {
  return compare(t, 'basic')
})

test('nested includes', (t) => {
  return compare(t, 'nested')
})

test('root option', (t) => {
  return compare(t, 'rootOption', { root: path.join(fixtures, 'partials') })
})

test('alias option', (t) => {
  return process('alias', {
    alias: {
      button: 'partials/button.html'
    }
  })
})

test('include with no src errors', (t) => {
  return process('no_src')
    .catch((err) => {
      t.truthy(err.toString().match(/include tag has no "src" attribute/))
    })
})

test('correctly reports source filename', (t) => {
  const inputFile = path.join(fixtures, 'basic.html')
  const trackAst = (tree) => {
    t.truthy(tree[0].content[1].location.filename.match(/partials\/button\.html/))
    return tree
  }

  return reshape({
    plugins: [include(), trackAst],
    filename: inputFile
  }).process(readFileSync(inputFile, 'utf8'))
})

test('parserRules works correctly', (t) => {
  return compare(t, 'parserRules', {
    parserRules: [{ test: /\.sgr$/, parser: sugarml }]
  })
})

test('correctly reports dependencies', (t) => {
  process('basic', {}, { dependencies: [] }).then((res) => {
    t.truthy(res.dependencies)
    t.regex(res.dependencies[0].file, /partials\/button\.html/)
    t.regex(res.dependencies[0].parent, /fixtures\/basic\.html/)
  })
})

function process (name, options = {}, reshapeOptions = {}) {
  const inputFile = path.join(fixtures, `${name}.html`)
  return reshape(Object.assign({ plugins: include(options), filename: inputFile }, reshapeOptions))
    .process(readFileSync(inputFile, 'utf8'))
}

function compare (t, name, options = {}) {
  const inputFile = path.join(fixtures, `${name}.html`)
  const input = readFileSync(inputFile, 'utf8')
  const expected = readFileSync(path.join(fixtures, `${name}.expected.html`), 'utf8')

  return reshape({ plugins: include(options), filename: inputFile })
    .process(input)
    .then((res) => {
      t.truthy(expected === res.output())
    })
}
