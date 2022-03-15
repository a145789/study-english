const router = require('koa-router')()
const { sendEmail, responseCatch } = require('../utils/index')
const {
  EmailCodeMong: { EmailCodeModel },
  UserMong: { UserModel }
} = require('../db/modules/user')
const crypto = require('crypto')
const shaKey = 'LoveAba'

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
      .createHash('sha256', user._id + shaKey + new Date().getTime())
      .digest('hex')

    const { _doc } = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { sessionId, updateTime: Date.now() } },
      {
        new: true,
        fields: {
          password: 0,
          sessionId: 0,
          createTime: 0,
          updateTime: 0,
          unfamiliar: 0,
          phone: 0
        }
      }
    )

    const { _id, familiar, will, mastered, ...arg } = _doc
    ctx.cookies.set('session', sessionId, {
      path: '/', // 有效范围
      httpOnly: true, // 只能在服务器修改
      maxAge: 24 * 60 * 60 * 7
    })
    ctx.body = {
      code: 200,
      data: {
        ...arg,
        userId: _id,
        familiarCount: familiar?.length || 0,
        willCount: will?.length || 0,
        masteredCount: mastered?.length || 0
      }
    }
  })
})

router.post('/api/update_password', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const { password, email, emailCode } = ctx.request.body
    const {
      userInfo: { userId }
    } = ctx

    const errBody = await checkEmailCode(email, emailCode)
    if (errBody) {
      ctx.body = errBody
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

router.post('/api/logout', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const { userId } = ctx.request.body
    await UserModel.updateOne(
      { _id: userId },
      { sessionId: '', updateTime: Date.now() }
    )
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
