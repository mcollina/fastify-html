import fp from 'fastify-plugin'
import tags from 'common-tags'

export default fp(async (fastify, opts) => {
  let layout = null
  fastify.decorate('tags', tags)

  fastify.decorate('addLayout', function (render) {
    layout = render
  })

  fastify.decorateReply('html', function (strings, ...values) {
    let html = tags.html.call(null, strings, ...values)

    if (layout) {
      html = layout(html)
    }

    this.header('Content-Type', 'text/html; charset=utf-8')
    this.send(html)
    return this
  })
}, {
  name: 'fastify-html'
})
