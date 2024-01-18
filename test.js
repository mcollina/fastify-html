import { test } from 'node:test'
import fastify from 'fastify'
import fastifyHtml from './index.js'
import { strictEqual } from 'node:assert'
import { escapeDictionary } from './lib/html.js'

test('render html', async t => {
  const app = fastify()
  app.register(fastifyHtml)

  app.get('/', async (req, reply) => {
    const name = req.query.name || 'World'
    strictEqual(reply.html`<h1>Hello ${name}</h1>`, reply)
    return reply
  })

  {
    const res = await app.inject({
      method: 'GET',
      url: '/'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, '<h1>Hello World</h1>')
  }

  {
    const res = await app.inject({
      method: 'GET',
      url: '/?name=Matteo'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, '<h1>Hello Matteo</h1>')
  }
})

test('one level layout', async t => {
  const app = fastify()
  await app.register(fastifyHtml)

  app.addLayout(function (inner) {
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

  {
    const res = await app.inject({
      method: 'GET',
      url: '/'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body.replaceAll(' ', '').replaceAll('\n', ''), `<!DOCTYPE html>
<html lang="en">
  <body>
    <h1>Hello World</h1>
  </body>
</html>`.replaceAll(' ', '').replaceAll('\n', ''))
  }

  {
    const res = await app.inject({
      method: 'GET',
      url: '/?name=Matteo'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body.replaceAll(' ', '').replaceAll('\n', ''), `<!DOCTYPE html>
<html lang="en">
  <body>
    <h1>Hello Matteo</h1>
  </body>
</html>`.replaceAll(' ', '').replaceAll('\n', ''))
  }
})

test('two levels layout', async t => {
  const app = fastify()
  await app.register(fastifyHtml)

  app.addLayout(function (inner) {
    return app.html`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          !${inner}
        </body>
      </html>
    `
  })

  app.addLayout(function (inner) {
    return app.html`
      <div>
        !${inner}
      </div>
    `
  })

  app.get('/', async (req, reply) => {
    const name = req.query.name || 'World'
    strictEqual(reply.html`<h1>Hello ${name}</h1>`, reply)
    return reply
  })

  {
    const res = await app.inject({
      method: 'GET',
      url: '/'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body.replaceAll(' ', '').replaceAll('\n', ''), `<!DOCTYPE html>
<html lang="en">
  <body>
    <div>
      <h1>Hello World</h1>
    </div>
  </body>
</html>`.replaceAll(' ', '').replaceAll('\n', ''))
  }

  {
    const res = await app.inject({
      method: 'GET',
      url: '/?name=Matteo'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body.replaceAll(' ', '').replaceAll('\n', ''), `<!DOCTYPE html>
<html lang="en">
  <body>
    <div>
      <h1>Hello Matteo</h1>
    </div>
  </body>
</html>`.replaceAll(' ', '').replaceAll('\n', ''))
  }
})

test('two levels layout with plugins', async t => {
  const app = fastify()
  await app.register(fastifyHtml)

  app.addLayout(function (inner) {
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
        <div>
          !${inner}
        </div>
      `
    })

    app.get('/inner', async (req, reply) => {
      const name = req.query.name || 'World'
      strictEqual(reply.html`<h1>Hello ${name}</h1>`, reply)
      return reply
    })
  })

  {
    const res = await app.inject({
      method: 'GET',
      url: '/'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body.replaceAll(' ', '').replaceAll('\n', ''), `<!DOCTYPE html>
<html lang="en">
  <body>
    <h1>Hello World</h1>
  </body>
</html>`.replaceAll(' ', '').replaceAll('\n', ''))
  }

  {
    const res = await app.inject({
      method: 'GET',
      url: '/inner?name=Matteo'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body.replaceAll(' ', '').replaceAll('\n', ''), `<!DOCTYPE html>
<html lang="en">
  <body>
    <div>
      <h1>Hello Matteo</h1>
    </div>
  </body>
</html>`.replaceAll(' ', '').replaceAll('\n', ''))
  }
})

test('use reply in the layout', async t => {
  const app = fastify()
  await app.register(fastifyHtml)

  let _reply

  app.addLayout(function (inner, reply) {
    strictEqual(reply, _reply)
    return app.html`<!DOCTYPE html>
      <html lang="en">
        <body>
          !${inner}
        </body>
      </html>`
  })

  app.get('/', async (req, reply) => {
    _reply = reply
    strictEqual(reply.html`<h1>Hello World</h1>`, reply)
    return reply
  })

  const res = await app.inject({
    method: 'GET',
    url: '/'
  })
  strictEqual(res.statusCode, 200)
  strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
  strictEqual(res.body.replaceAll(' ', '').replaceAll('\n', ''), `<!DOCTYPE html>
<html lang="en">
  <body>
    <h1>Hello World</h1>
  </body>
</html>`.replaceAll(' ', '').replaceAll('\n', ''))
})

test('skip layout with hx-request', async t => {
  const app = fastify()
  await app.register(fastifyHtml)

  app.addLayout(function (inner) {
    return app.html`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          ${inner}
        </body>
      </html>
    `
  }, { skipOnHeader: 'hx-request' })

  app.get('/', async (req, reply) => {
    const name = req.query.name || 'World'
    strictEqual(reply.html`<h1>Hello ${name}</h1>`, reply)
    return reply
  })

  const res = await app.inject({
    method: 'GET',
    url: '/',
    headers: {
      'hx-request': true
    }
  })
  strictEqual(res.statusCode, 200)
  strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
  strictEqual(res.body, '<h1>Hello World</h1>')
})

test('render arrays', async t => {
  const app = fastify()
  app.register(fastifyHtml)

  app.get('/', async (req, reply) => {
    const name = req.query.name || 'World'
    strictEqual(reply.html`<h1>${['Hello', ' ', name]}</h1>`, reply)
    return reply
  })

  {
    const res = await app.inject({
      method: 'GET',
      url: '/'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, '<h1>Hello World</h1>')
  }

  {
    const res = await app.inject({
      method: 'GET',
      url: '/?name=Matteo'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, '<h1>Hello Matteo</h1>')
  }
})

test('renders an empty tag', async t => {
  const app = fastify()
  app.register(fastifyHtml)

  app.get('/', async (_req, reply) => {
    strictEqual(reply.html``, reply)
    return reply
  })

  {
    const res = await app.inject({
      method: 'GET',
      url: '/'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, '')
  }
})

test('renders null', async t => {
  const app = fastify()
  app.register(fastifyHtml)

  app.get('/', async (_req, reply) => {
    strictEqual(reply.html`${null}`, reply)
    return reply
  })

  {
    const res = await app.inject({
      method: 'GET',
      url: '/'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, '')
  }
})

test('renders a number', async t => {
  const app = fastify()
  app.register(fastifyHtml)

  app.get('/', async (_req, reply) => {
    strictEqual(reply.html`${42}`, reply)
    return reply
  })

  {
    const res = await app.inject({
      method: 'GET',
      url: '/'
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, '42')
  }
})

test('escape', async t => {
  const app = fastify()
  app.register(fastifyHtml)

  app.post('/', async (req, reply) => {
    const char = req.body.char
    strictEqual(reply.html`<h1>Hello ${char}</h1>`, reply)
    return reply
  })

  for (const char of ['<', '>', '"', '\'', '&']) {
    const res = await app.inject({
      method: 'POST',
      url: '/',
      body: { char }
    })
    strictEqual(res.statusCode, 200)
    strictEqual(res.headers['content-type'], 'text/html; charset=utf-8')
    strictEqual(res.body, `<h1>Hello ${escapeDictionary[char]}</h1>`)
  }
})
