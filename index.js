import fp from 'fastify-plugin'
import tags from 'common-tags'

const kLayout = Symbol('fastifyHtmlLayout')

class Layout {
  constructor (render, parent) {
    this._render = render
    if (parent) {
      this.parent = parent
    }
  }

  render (inner) {
    const fn = this._render
    let res = fn(inner)
    if (this.parent) {
      res = this.parent.render(res)
    }
    return res
  }
}

export default fp(async (fastify, opts) => {
  fastify.decorate('tags', tags)
  fastify.decorate(kLayout, null)

  fastify.decorate('addLayout', function (render) {
    // Using a symbol attached to `this` and a stack allows us to
    // support nested layouts with encapsulated plugins.
    let layout = this[kLayout]
    layout = new Layout(render, layout)
    this[kLayout] = layout
  })

  fastify.decorateReply('html', function (strings, ...values) {
    let html = tags.html.call(null, strings, ...values)
    const layout = this.server[kLayout]

    if (layout) {
      html = layout.render(html)
    }

    this.header('Content-Type', 'text/html; charset=utf-8')
    this.send(html)
    return this
  })
}, {
  name: 'fastify-html'
})
