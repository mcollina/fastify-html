import fp from 'fastify-plugin'
import { html } from './lib/html.js'

const kLayout = Symbol('fastifyHtmlLayout')

export default fp(async (fastify, opts) => {
  fastify.decorate('html', html)
  fastify.decorate(kLayout, null)

  fastify.decorate('addLayout', function (render, { skipOnHeader } = {}) {
    // Using a symbol attached to `this` and a stack allows us to
    // support nested layouts with encapsulated plugins.
    const layout = {
      render,
      parent: this[kLayout],
      skipOnHeader
    }

    this[kLayout] = layout
  })

  fastify.decorateReply('html', function (strings, ...values) {
    let htmlString = html(strings, ...values)
    let layout = this.server[kLayout]

    // render each layout in the stack
    // using a while loop instead of recursion
    // to avoid stack overflows and reduce memory usage
    while (layout !== null) {
      if (layout.skipOnHeader && this.request.headers[layout.skipOnHeader]) {
        layout = layout.parent
        continue
      }
      const render = layout.render
      htmlString = render(htmlString, this)
      layout = layout.parent
    }

    this.header('Content-Type', 'text/html; charset=utf-8')
    this.send(htmlString)
    return this
  })
}, {
  name: 'fastify-html'
})
