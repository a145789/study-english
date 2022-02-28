const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const historyApiFallback = require('koa-history-api-fallback')
const conditional = require('koa-conditional-get')
const etag = require('koa-etag')

const mongodb = require('./db/index')

const index = require('./routes/index')
const user = require('./routes/user')
const word = require('./routes/word')

const imgExt = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']

// error handler
onerror(app)
mongodb()
// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  })
)
app.use(json())
app.use(logger())
app.use(
  historyApiFallback({
    verbose: true
  })
)
app.use(conditional())

// add etags
app.use(etag())
app.use(async (ctx, next) => {
  if (imgExt.some(img => ctx.url.includes(img))) {
    ctx.set('Cache-Control', 'max-age=600')
  }
  if (ctx.url.includes('favicon')) {
    ctx.set('Cache-Control', 'max-age=31536000')
  }

  await next()
})
app.use(require('koa-static')(__dirname + '/dist'))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(word.routes(), word.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
