import fastifyHtml from './plugin.js'
import { describe, expect, test } from 'tstyche'
import * as fastifyHtmlStar from './plugin.js'
import fastify, { type FastifyInstance, type FastifyReply } from 'fastify'

function withServer(
  runAssertions: (server: FastifyInstance) => void,
  options: fastifyHtml.FastifyHtmlOptions = {}
): void {
  const server = fastify()
  server.register(fastifyHtml, options)
  server.after(() => runAssertions(server))
}

describe('fastify-html', () => {
  describe('plugin registration', () => {
    test('registers via the default export', () => {
      withServer(() => {})
    })

    test('accepts the async option', () => {
      withServer(() => {}, { async: false })
    })
  })

  describe('FastifyInstance decorator: html()', () => {
    test('returns a string for any template literal input', () => {
      withServer((server) => {
        expect(server.html).type.toBe<(strings: TemplateStringsArray, ...values: any[]) => string>()
      }, { async: false })
    })
  })

  describe('FastifyInstance decorator: addLayout()', () => {
    test('accepts a render function and an optional skipOnHeader option', () => {
      withServer((server) => {
        expect(server.addLayout).type.toBe<(
          render: (htmlString: string, context: FastifyReply) => string,
          options?: { skipOnHeader?: string }
        ) => void>()
      }, { async: false })
    })
  })

  describe('FastifyReply decorator: html()', () => {
    test('returns FastifyReply for any template literal input', () => {
      withServer((server) => {
        server.get('/', (request, reply) => {
          expect(reply.html).type.toBe<(strings: TemplateStringsArray, ...values: any[]) => FastifyReply>()

          reply.html`<p>Hello World</p>`
        })
      }, { async: false })
    })

    test('can be used inside a route handler with default options', () => {
      withServer((server) => {
        server.get('/', (request, reply) => {
          reply.html`<p>Hello World</p>`
        })
      })
    })
  })
})
