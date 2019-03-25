'use strict'

const t = require('tap')

t.test('Using a secret without salt', function (childTest) {
  const fastify = require('fastify')({
    logger: false
  })

  fastify.register(require('../'), {
    secret: 'averylogphrasebiggerthanthirtytwochars'
  })

  fastify.post('/', (request, reply) => {
    request.session.set('data', request.body)
    reply.send('hello world')
  })

  childTest.tearDown(fastify.close.bind(fastify))
  childTest.plan(5)

  fastify.get('/', (request, reply) => {
    const data = request.session.get('data')
    if (!data) {
      reply.code(404).send()
      return
    }
    reply.send(data)
  })

  fastify.inject({
    method: 'POST',
    url: '/',
    payload: {
      some: 'data'
    }
  }, (error, response) => {
    debugger;
    childTest.error(error)
    childTest.equal(response.statusCode, 200)
    childTest.ok(response.headers['set-cookie'])

    fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        cookie: response.headers['set-cookie']
      }
    }, (error, response) => {
      childTest.error(error)
      childTest.deepEqual(JSON.parse(response.payload), {
        some: 'data'
      })
    })
  })
})

// t.test('Using a secret without salt', function (childTest) {
//   const fastify = require('fastify')({
//     logger: false
//   })

//   fastify.register(require('../'), {
//     secret: 'averylogphrasebiggerthanthirtytwochars',
//     salt: 'mq9hDxBVDbspDR6n'
//   })

//   fastify.post('/', (request, reply) => {
//     request.session.set('data', request.body)
//     reply.send('hello world')
//   })

//   childTest.tearDown(fastify.close.bind(fastify))
//   childTest.plan(5)

//   fastify.get('/', (request, reply) => {
//     const data = request.session.get('data')
//     if (!data) {
//       reply.code(404).send()
//       return
//     }
//     reply.send(data)
//   })

//   fastify.inject({
//     method: 'POST',
//     url: '/',
//     payload: {
//       some: 'data'
//     }
//   }, (error, response) => {
//     childTest.error(error)
//     childTest.equal(response.statusCode, 200)
//     childTest.ok(response.headers['set-cookie'])

//     fastify.inject({
//       method: 'GET',
//       url: '/',
//       headers: {
//         cookie: response.headers['set-cookie']
//       }
//     }, (error, response) => {
//       childTest.error(error)
//       childTest.deepEqual(JSON.parse(response.payload), {
//         some: 'data'
//       })
//     })
//   })
// })
