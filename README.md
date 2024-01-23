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
        <!-- Prefix inner with ! if it contains safe HTML -->
        !${inner}
      </body>
    </html>
  `
}, { skipOnHeader: 'hx-request' })

app.get('/', async (req, reply) => {
  const name = req.query.name || 'World'
  return reply.html`<h1>Hello ${name}</h1>`
})

app.get('/complex-response/:page', async (req, reply) => {
  const name = req.query.name || 'World'
  const userInfo = await getInfo(name) || {}
  const demand = req.query.demand
  
  return reply.html`
      <div>
        Welcome, ${name}.
        <br /><br />

        User information:
        <br />

        <!-- Don't forget to prefix expressions that contain other html tags -->
        !${Object.keys(userInfo).map(
          (key) => app.html`
            ${key}: <b>${userInfo[key]}</b>
            <br />
          `
        )}
        <br />

        !${
          demand
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
