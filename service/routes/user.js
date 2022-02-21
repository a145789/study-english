const router = require('koa-router')()
const { sendEmail } = require('../utils/index')
const {
  emailCodeMong: { EmailCodeModel },
  UserMong: { UserModel }
} = require('../db/modules/user')

const checkEmailCode = async (email, emailCode, ctx) => {
  const emailCodeDb = await EmailCodeModel.findOne({ email })
  if (emailCodeDb?.emailCode !== emailCode) {
    ctx.body = {
      code: 0,
      message: '验证码错误',
      data: null
    }
    return false
  }
  await EmailCodeModel.deleteOne({ email })
  return true
}

router.get('/api/getEmailCode', async (ctx, next) => {
  try {
    const { email, isUseCodeLogin } = ctx.query
    const user = await UserModel.findOne({ email })
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
  } catch (error) {
    console.log(error)
    ctx.body = {
      code: 0,
      message: '网络错误',
      data: null
    }
  }
})

router.post('/api/register', async (ctx, next) => {
  try {
    const { username, password, email, emailCode } = ctx.request.body

    const bol = await checkEmailCode(email, emailCode, ctx)
    if (!bol) return
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
  } catch (error) {
    console.log(error)
    ctx.body = {
      code: 0,
      message: '网络错误',
      data: null
    }
  }
})

router.post('/api/login', async (ctx, next) => {
  try {
    const { username, password, email, emailCode, isUseCodeLogin } =
      ctx.request.body
    if (!isUseCodeLogin) {
      const isEmail =
        /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(username)
      const user = await UserModel.findOne(
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
      const bol = await checkEmailCode(email, emailCode, ctx)
      if (!bol) return
    }
    ctx.body = {
      code: 200,
      data: null
    }
  } catch (error) {
    console.log(error)
    ctx.body = {
      code: 0,
      message: '网络错误',
      data: null
    }
  }
})

module.exports = router
