const router = require('koa-router')()
const { sendEmail } = require('../utils/index')
const {
  emailCodeMong: { EmailCodeModel },
  UserMong: { UserModel }
} = require('../db/modules/user')

router.get('/api/getEmailCode', async (ctx, next) => {
  try {
    const { email } = ctx.query
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
    const emailCodeDb = await EmailCodeModel.findOne({ email })
    if (emailCodeDb?.emailCode !== emailCode) {
      ctx.body = {
        code: 0,
        message: '验证码错误',
        data: null
      }
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
    EmailCodeModel.deleteOne({ email })
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
