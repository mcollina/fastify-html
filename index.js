import fp from 'fastify-plugin'
import tags from 'common-tags'

export default fp(async (fastify, opts) => {
  fastify.decorate('tags', tags)

  fastify.decorateReply('html', function (strings, ...values) {
    const html = tags.html.call(null, strings, ...values)

    this.header('Content-Type', 'text/html; charset=utf-8')
    this.send(html)
    return this
  })
}, {
  name: 'fastify-html'
})
