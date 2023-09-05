import fp from 'fastify-plugin'
import tags from 'common-tags'

const kLayout = Symbol('fastifyHtmlLayout')

export default fp(async (fastify, opts) => {
  fastify.decorate('tags', tags)
  fastify.decorate(kLayout, undefined)

  fastify.decorate('addLayout', function (render) {
    // Using a symbol attached to `this` and a stack allows us to
    // support nested layouts with encapsulated plugins.
    let layout = this[kLayout]
    layout = {
      render,
      parent: layout
    }
    this[kLayout] = layout
  })

  fastify.decorateReply('html', function (strings, ...values) {
    let html = tags.html.call(null, strings, ...values)
    let layout = this.server[kLayout]

    // render each layout in the stack
    // using a while loop instead of recursion
    // to avoid stack overflows and reduce memory usage
    while (layout) {
      const render = layout.render
      html = render(html, this)
      layout = layout.parent
    }

    this.header('Content-Type', 'text/html; charset=utf-8')
    this.send(html)
    return this
  })
}, {
  name: 'fastify-html'
})
