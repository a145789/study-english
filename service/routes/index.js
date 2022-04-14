const router = require('koa-router')()
const {
  UserMong: { UserModel }
} = require('../db/modules/user')
const { SEVEN_DAYS_LATER } = require('../constants/index')

router.all('*', async (ctx, next) => {
  const sessionId = ctx.cookies.get('session')
  const userInfoCookies = ctx.cookies.get('userInfo')
  ctx.isLogin = sessionId && userInfoCookies
  ctx.userInfo = JSON.parse(
    decodeURIComponent(userInfoCookies || '{}', 'UTF-8')
  )
  if (sessionId) {
    if (!ctx.userInfo?.userId) {
      ctx.cookies.set('session', '', {
        path: '/', // 有效范围
        httpOnly: true, // 只能在服务器修改
        maxAge: 0
      })
      ctx.body = {
        code: 401,
        data: null
      }
      return
    }
    const user = await UserModel.findOne({ _id: ctx.userInfo.userId })
    if (user.sessionId !== sessionId) {
      ctx.cookies.set('session', '', {
        path: '/', // 有效范围
        httpOnly: true, // 只能在服务器修改
        maxAge: 0
      })
      ctx.body = {
        code: 401,
        data: null
      }
      return
    }
    ctx.cookies.set('session', sessionId, {
      path: '/', // 有效范围
      httpOnly: true, // 只能在服务器修改
      maxAge: SEVEN_DAYS_LATER
    })
  } else {
    ctx.cookies.set('session', '', {
      path: '/', // 有效范围
      httpOnly: true, // 只能在服务器修改
      maxAge: 0
    })
  }
  await next()
})

module.exports = router
