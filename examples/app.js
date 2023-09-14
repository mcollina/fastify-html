import fastify from 'fastify'
import fastifyHtml from '../index.js'
import formBody from '@fastify/formbody'

const app = fastify({ logger: true })
await app.register(formBody)
await app.register(fastifyHtml)

app.addLayout(function (inner, reply) {
  return app.tags.html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <script src="https://unpkg.com/htmx.org@1.9.5"></script>
      </head>
      <body>
        ${inner}
        bbb
      </body>
    </html>
  `
}, { skipOnHeader: 'hx-request' })

app.get('/', async (req, reply) => {
  const name = req.query.name || 'World'
  return reply.html`
    <h1>Hello ${name}</h1>
    <button hx-post="/clicked" hx-swap="outerHTML">
      Click Me
    </button>
  `
})

app.post('/clicked', async (req, reply) => {
  return reply.html`
    <h1>Clicked</h1>
  `
})

await app.listen({ port: 3000 })
