const router = require('koa-router')()
const {
  sendEmail,
  responseCatch,
  getUserInfo,
  isLoginHandel,
  session_key
} = require('../utils/index')
const { userInfoFields } = require('../constants/index')
const {
  EmailCodeMong: { EmailCodeModel },
  UserMong: { UserModel }
} = require('../db/modules/user')
const crypto = require('crypto')
const { SEVEN_DAYS_LATER } = require('../constants/index')

const checkEmailCode = async (email, emailCode) => {
  const emailCodeDb = await EmailCodeModel.findOne({ email })
  if (emailCodeDb?.emailCode !== emailCode) {
    return {
      code: 0,
      message: '验证码错误',
      data: null
    }
  }
  EmailCodeModel.deleteOne({ email }, function () {})
}

router.post('/api/getEmailCode', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const { email, isUseCodeLogin, isUpdatePassword } = ctx.request.body
    const user = await UserModel.findOne({ email })
    if (!isUpdatePassword) {
      if (!isUseCodeLogin && user) {
        ctx.body = {
          code: 0,
          message: '邮箱已被注册'
        }
        return
      }
      if (isUseCodeLogin && !user) {
        ctx.body = {
          code: 0,
          message: '该邮箱未被注册'
        }
        return
      }
    }
    const emailCode = Math.random().toString().slice(2, 6)
    const setEmailCode = new EmailCodeModel({ email, emailCode })
    try {
      await sendEmail(email, emailCode)
    } catch (error) {
      console.log(error)
      ctx.body = {
        code: 0,
        message: '请检查邮箱是否正确',
        data: null
      }
      return
    }
    await setEmailCode.save()
    ctx.body = {
      code: 200,
      data: null
    }
  })
})

router.post('/api/register', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const { username, password, email, emailCode } = ctx.request.body

    const errBody = await checkEmailCode(email, emailCode)
    if (errBody) {
      ctx.body = errBody
      return
    }
    const userDb = await UserModel.findOne({ username })
    if (userDb) {
      ctx.body = {
        code: 0,
        message: '用户名已存在',
        data: null
      }
      return
    }
    const user = new UserModel({ username, password, email })
    await user.save()
    ctx.body = {
      code: 200,
      data: null
    }
  })
})

router.post('/api/login', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const { username, password, email, emailCode, isUseCodeLogin } =
      ctx.request.body
    let user
    if (!isUseCodeLogin) {
      const isEmail =
        /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(username)
      user = await UserModel.findOne(
        isEmail ? { $or: [{ username }, { email: username }] } : { username }
      )
      if (user?.password !== password) {
        ctx.body = {
          code: 0,
          message: '用户不存在或密码错误',
          data: null
        }
        return
      }
    } else {
      const errBody = await checkEmailCode(email, emailCode)
      if (errBody) {
        ctx.body = errBody
        return
      }
    }

    if (!user) {
      user = await UserModel.findOne({ email })
    }

    // 设置session
    const sessionId = crypto
      .createHash('sha256', user._id + session_key + new Date().getTime())
      .digest('hex')

    const { _doc } = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { sessionId, updateTime: Date.now() } },
      {
        new: true,
        fields: userInfoFields
      }
    )

    ctx.cookies.set('session', sessionId, {
      path: '/', // 有效范围
      httpOnly: true, // 只能在服务器修改
      maxAge: SEVEN_DAYS_LATER
    })

    ctx.body = {
      code: 200,
      data: getUserInfo(_doc)
    }
  })
})

router.post('/api/update_password', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const loginErrBody = await isLoginHandel(ctx)
    if (loginErrBody) {
      ctx.body = loginErrBody
      return
    }
    const { password, email, emailCode } = ctx.request.body
    const {
      userInfo: { userId }
    } = ctx

    const emailErrBody = await checkEmailCode(email, emailCode)
    if (emailErrBody) {
      ctx.body = emailErrBody
      return
    }
    await UserModel.updateOne(
      { _id: userId },
      { password, updateTime: Date.now() }
    )

    ctx.body = {
      code: 200,
      data: null
    }
  })
})

router.post('/api/update_username', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const loginErrBody = await isLoginHandel(ctx)
    if (loginErrBody) {
      ctx.body = loginErrBody
      return
    }
    const { username } = ctx.request.body
    const {
      userInfo: { userId }
    } = ctx

    const userDb = await UserModel.findOne({ username })
    if (userDb) {
      ctx.body = {
        code: 0,
        message: '用户名已存在',
        data: null
      }
      return
    }

    await UserModel.updateOne(
      { _id: userId },
      { $set: { username, updateTime: Date.now() } }
    )

    ctx.body = {
      code: 200,
      data: null
    }
  })
})

router.post('/api/user_info', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const loginErrBody = await isLoginHandel(ctx)
    if (loginErrBody) {
      console.log(loginErrBody);
      ctx.body = loginErrBody
      return
    }
    const {
      userInfo: { userId }
    } = ctx
    const { _doc } = await UserModel.findOne({ _id: userId })

    ctx.body = {
      code: 200,
      data: getUserInfo(_doc)
    }
  })
})

router.post('/api/logout', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const { userId } = ctx?.userInfo
    if (userId) {
      await UserModel.updateOne(
        { _id: userId },
        { sessionId: '', updateTime: Date.now() }
      )
    }
    ctx.cookies.set('session', '', {
      path: '/', // 有效范围
      httpOnly: true, // 只能在服务器修改
      maxAge: 0
    })
    ctx.body = {
      code: 200,
      data: null
    }
  })
})

module.exports = router
