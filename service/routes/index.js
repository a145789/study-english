const router = require('koa-router')()
const { sendEmail } = require('../utils/index')
const { SetEmailCodeModel } = require('../db/modules/user')

router.get('/', async (ctx, next) => {})

router.get('/api/getEmailCode', async (ctx, next) => {
  try {
    const { email } = ctx.query
    const emailCode = Math.random().toString().slice(2, 6)
    const setEmailCode = new SetEmailCodeModel({ email, emailCode })
    await sendEmail(email, emailCode)
    const db = await setEmailCode.save()
    ctx.body = {
      code: 200,
      data: {
        id: db._id,
        email,
        emailCode
      }
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
