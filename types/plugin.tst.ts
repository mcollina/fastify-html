import fastifyHtml from './plugin.js'
import { describe, expect, test } from 'tstyche'
import * as fastifyHtmlStar from './plugin.js'
import fastify, { type FastifyInstance, type FastifyReply } from 'fastify'

describe('fastify-html', () => {
  describe('plugin registration', () => {
    test('registers via the default export', () => {
      const app: FastifyInstance = fastify()
      app.register(fastifyHtml)
    })

    test('accepts the async option', () => {
      const server = fastify()
      server.register(fastifyHtml, { async: false })
    })
  })

  describe('FastifyInstance decorator: html()', () => {
    test('returns a string for any template literal input', () => {
      const server = fastify()
      server.register(fastifyHtml, { async: false })

      server.after(() => {
        expect(server.html).type.toBe<(strings: TemplateStringsArray, ...values: any[]) => string>()
      })
    })
  })

  describe('FastifyInstance decorator: addLayout()', () => {
    test('accepts a render function and an optional skipOnHeader option', () => {
      const server = fastify()
      server.register(fastifyHtml, { async: false })

      server.after(() => {
        expect(server.addLayout).type.toBe<(
          render: (htmlString: string, context: FastifyReply) => string,
          options?: { skipOnHeader?: string }
        ) => void>()
      })
    })
  })

  describe('FastifyReply decorator: html()', () => {
    test('returns FastifyReply for any template literal input', () => {
      const server = fastify()
      server.register(fastifyHtml, { async: false })

      server.after(() => {
        server.get('/', (request, reply) => {
          expect(reply.html).type.toBe<(strings: TemplateStringsArray, ...values: any[]) => FastifyReply>()

          reply.html`<p>Hello World</p>`
        })
      })
    })

    test('can be used inside a route handler with default options', () => {
      const server = fastify()
      server.register(fastifyHtml)

      server.after(() => {
        server.get('/', (request, reply) => {
          reply.html`<p>Hello World</p>`
        })
      })
    })
  })
})
