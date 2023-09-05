# fastify-html

Generate html in the most natural Fastify way, using template tags,
layouts and the plugin system.

Based on top of [common-tags](https://github.com/zspecza/common-tags/).

## Install

```bash
npm i fastify fastify-html
```

## Usage

```js
import fastify from 'fastify'
import fastifyHtml from 'fastify-html'

const app = fastify()
await app.register(fastifyHtml)

app.addLayout(function (inner, reply) {
  return app.tags.html`
    <!DOCTYPE html>
    <html lang="en">
      <body>
        ${inner}
      </body>
    </html>
  `
})

app.get('/', async (req, reply) => {
  const name = req.query.name || 'World'
  strictEqual(reply.html`<h1>Hello ${name}</h1>`, reply)
  return reply
})

await app.listen({ port: 3000 })
```

### Plugins

Encapsulation is supported and respected for layouts, meaning that `addLayout`
calls will be not exposed to the parent plugin, like the following:

```js
import fastify from 'fastify'
import fastifyHtml from 'fastify-html'

const app = fastify()
await app.register(fastifyHtml)

app.addLayout(function (inner, reply) {
  return app.tags.html`
    <!DOCTYPE html>
    <html lang="en">
      <body>
        ${inner}
      </body>
    </html>
  `
})

app.get('/', async (req, reply) => {
  const name = req.query.name || 'World'
  strictEqual(reply.html`<h1>Hello ${name}</h1>`, reply)
  return reply
})

app.register(async function (app) {
  app.addLayout(function (inner) {
    return app.tags.html`
      <i>
        ${inner}
      </i>
    `
  })

  app.get('/nested', async (req, reply) => {
    const name = req.query.name || 'World'
    strictEqual(reply.html`<h1>Nested ${name}</h1>`, reply)
    return reply
  })
})

await app.listen({ port: 3000 })
```

## License

MIT
