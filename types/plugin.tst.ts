import fastifyHtml from './plugin.js'
import { expect } from 'tstyche'
import * as fastifyHtmlStar from './plugin.js'
import fastify, { type FastifyInstance, type FastifyReply } from 'fastify'

const app: FastifyInstance = fastify()
app.register(fastifyHtml)

const server = fastify()

server.register(fastifyHtml, { async: false })

server.after(() => {
  // Testing the 'html' method on Fastify instance
  expect(server.html).type.toBe<(strings: TemplateStringsArray, ...values: any[]) => string>()

  // Testing the 'addLayout' method on Fastify instance
  expect(server.addLayout).type.toBe<(
    render: (htmlString: string, context: FastifyReply) => string,
    options?: { skipOnHeader?: string }
  ) => void>()

  // Testing the 'html' method on Fastify reply
  server.get('/', (request, reply) => {
    expect(reply.html).type.toBe<(strings: TemplateStringsArray, ...values: any[]) => FastifyReply>()

    reply.html`<p>Hello World</p>`
  })
})

const serverWithPlugin = fastify()

serverWithPlugin.register(fastifyHtml)

serverWithPlugin.after(() => {
  serverWithPlugin.get('/', (request, reply) => {
    reply.html`<p>Hello World</p>`
  })
})
