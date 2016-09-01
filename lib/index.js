const {readFileSync} = require('fs')
const {modifyNodes} = require('reshape-plugin-util')
const path = require('path')

module.exports = function reshapeInclude (options = {}) {
  if (options.addDependencyTo && !(typeof options.addDependencyTo.addDependency === 'function')) {
    throw new Error('[reshape-include] "addDependencyTo" does not have an "addDependency" method')
  }

  return function includePlugin (tree, ctx) {
    return modifyNodes(tree, (node) => node.name === 'include', (node) => {
      // if there is no src, throw an error
      if (!(node.attrs && node.attrs.src)) {
        throw new ctx.PluginError({
          message: 'include tag has no "src" attribute',
          plugin: 'reshape-include',
          location: node.location
        })
      }

      // otherwise, replace the tag with the partial's contents
      const root = options.root || (ctx.filename && path.dirname(ctx.filename)) || ''
      let contentPath = node.attrs.src[0].content
      if (options.alias) {
        contentPath = options.alias[contentPath]
          ? options.alias[contentPath] : contentPath
      }
      const includePath = path.join(root, contentPath)
      const src = readFileSync(includePath, 'utf8')
      const includeAst = ctx.parser(src, { filename: includePath }, { filename: includePath })

      // add dependency if applicable
      if (options.addDependencyTo) {
        options.addDependencyTo.addDependency(includePath)
      }

      // Resolves nested includes and than return new nodes
      return includePlugin(includeAst, ctx)
    })
  }
}
