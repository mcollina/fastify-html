# fastify-html

Generate html in the most natural Fastify way, using template tags,
layouts and the plugin system.

Template expressions are escaped by default unless they are prefixed with `!`.

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
  return app.html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <script src="https://unpkg.com/htmx.org@1.9.5"></script>
      </head>
      <body>
        !${inner} <!-- Prefix inner with ! to render it raw -->
      </body>
    </html>
  `
}, { skipOnHeader: 'hx-request' })

app.get('/', async (req, reply) => {
  const name = req.query.name || 'World'
  return reply.html`<h1>Hello ${name}</h1>`, reply
})

app.get('/complex-response/:page', async (req, reply) => {
  const name = req.query.name || 'World'
  const userInfo = await getInfo(name)
  const demand = req.query.demand
  
  return reply.html`
      <div>
        Welcome, ${name} <!-- Will be auto escaped -->

        !${userInfo} <!-- Will not be auto escaped – warning: user inputs should generally be escaped -->

        <!-- Don't forget to prefix other html tags with ! to not escape the safe HTML -->
        !${
          demand !== undefined
            ? app.html`
              <p>Your demand: ${demand}</p>
            `
            : ""
        }
      </div>
  `
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
  return app.html`
    <!DOCTYPE html>
    <html lang="en">
      <body>
        !${inner}
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
    return app.html`
      <i>
        !${inner}
      </i>
    `
  })

  app.get('/nested', async (req, reply) => {
    const name = req.query.name || 'World'
    return reply.html`<h1>Nested ${name}</h1>`
  })
})

await app.listen({ port: 3000 })
```

## License

MIT
