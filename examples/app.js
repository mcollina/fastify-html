import fastify from 'fastify'
import fastifyHtml from '../index.js'
import formBody from '@fastify/formbody'
import cookies from '@fastify/cookie'

// const app = fastify({ logger: true })
const app = fastify()
await app.register(formBody)
await app.register(fastifyHtml)
await app.register(cookies)

app.addLayout(function (inner, reply) {
  return app.html`
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://unpkg.com/htmx.org@1.9.5"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.min.css">
  </head>
  <body>
    !${inner}
  </body>
</html>
  `
}, { skipOnHeader: 'hx-request' })

function status (html, counter) {
  return html`<h2 id="status">Status: ${counter}</h2>`
}

app.get('/', async (req, reply) => {
  const name = req.query.name || 'World'
  const counter = req.cookies.counter || 0
  return reply.html`
    <h1>Hello ${name}</h1>
    !${status(app.html, counter)}
    <button hx-post="/up" hx-swap="outerHTML" hx-target="#status">
      Up
    </button>
    <button hx-post="/down" hx-swap="outerHTML" hx-target="#status">
      Down
    </button>
  `
})

app.post('/up', async (req, reply) => {
  let counter = req.cookies.counter || 0
  reply.setCookie('counter', ++counter)
  return status(reply.html.bind(reply), counter)
})

app.post('/down', async (req, reply) => {
  let counter = req.cookies.counter || 0
  reply.setCookie('counter', --counter)
  return status(reply.html.bind(reply), counter)
})

await app.listen({ port: 3000 })
