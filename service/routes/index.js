const router = require('koa-router')()

router.get('*', async (ctx, next) => {
  ctx.userInfo = JSON.parse(
    decodeURIComponent(ctx.cookies.get('userInfo') || '{}', 'UTF-8')
  )
  const sessionId = ctx.cookies.get('session')
  if (sessionId) {
    ctx.cookies.set('session', sessionId, {
      path: '/', // 有效范围
      httpOnly: true, // 只能在服务器修改
      maxAge: 24 * 60 * 60 * 7
    })
  }
  await next()
})

module.exports = router
