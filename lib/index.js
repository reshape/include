const {readFileSync} = require('fs')
const {modifyNodes} = require('reshape-plugin-util')
const path = require('path')

module.exports = function reshapeInclude (options = {}) {
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

      // If there is a parserRule matching, use that parser. Otherwise, use the
      // default parser : )
      const parser = (options.parserRules || []).reduce((m, r) => {
        if (r.test.exec(contentPath)) m = r.parser
        return m
      }, ctx.parser)

      const includeAst = parser(src, { filename: includePath }, { filename: includePath })

      // add dependency if applicable
      if (ctx.dependencies) {
        ctx.dependencies.push({
          file: includePath,
          parent: ctx.filename
        })
      }

      // Resolves nested includes and than return new nodes
      return includePlugin(includeAst, ctx)
    })
  }
}
