import fp from 'fastify-plugin'
import { html, htmlAsyncGenerator } from 'ghtml'
import { Readable } from 'node:stream'

const kLayout = Symbol('fastifyHtmlLayout')

export default fp(async (fastify, opts) => {
  fastify.decorate('html', opts.async ? htmlAsyncGenerator : html)
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
    let htmlString = fastify.html(strings, ...values)
    let layout = this.server[kLayout]

    // render each layout in the stack
    // using a while loop instead of recursion
    // to avoid stack overflows and reduce memory usage
    while (layout) {
      if (layout.skipOnHeader && this.request.headers[layout.skipOnHeader]) {
        layout = layout.parent
        continue
      }
      htmlString = layout.render(htmlString, this)
      layout = layout.parent
    }

    this.header('Content-Type', 'text/html; charset=utf-8')
    this.send(opts.async ? Readable.from(htmlString) : htmlString)
    return this
  })
}, {
  name: 'fastify-html'
})
