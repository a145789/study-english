const nodemailer = require('nodemailer')
const fs = require('fs')

const {
  UserMong: { UserModel }
} = require('../db/modules/user')

const [emilId, sessionKey] = fs.readFileSync('Config').toString().split('\r\n')
const [_1, emil_id] = emilId.trim().split('=')
const [_2, session_key] = sessionKey.trim().split('=')

const sendEmail = (email, emailCode) => {
  const transporter = nodemailer.createTransport({
    service: 'QQ', // 发送者的邮箱厂商，支持列表：https://nodemailer.com/smtp/well-known/
    port: 465, // SMTP 端口
    secureConnection: true, // SSL安全链接
    auth: {
      //发送者的账户密码
      user: '1484176425@qq.com', //账户
      pass: emil_id //smtp授权码，到邮箱设置下获取
    }
  })
  const mailOptions = {
    from: '"Study English 👻" <1484176425@qq.com>', // 发送者昵称和地址
    to: email, // 接收者的邮箱地址
    subject: '验证码', // 邮件主题
    html: `<h2>欢迎注册Study English</h2><div>您的邮箱验证码是：<b>${emailCode}</b></div>`
  }
  //发送邮件
  return transporter.sendMail(mailOptions)
}

const responseCatch = async (ctx, cb) => {
  try {
    await cb()
  } catch (error) {
    console.log(error)
    ctx.body = {
      code: 0,
      message: '后台错误',
      data: null
    }
  }
}

const isLoginHandel = async ctx => {
  if (!ctx.isLogin) {
    ctx.cookies.set('session', '', {
      path: '/', // 有效范围
      httpOnly: true, // 只能在服务器修改
      maxAge: 0
    })
    ctx.cookies.set('userInfo', '', {
      path: '/', // 有效范围
      httpOnly: true, // 只能在服务器修改
      maxAge: 0
    })

    if (ctx.userInfo?.userId) {
      await UserModel.updateOne(
        { _id: ctx.userInfo.userId },
        { sessionId: '', updateTime: Date.now() }
      )
    }

    return {
      code: 401,
      data: null
    }
  }
  return
}

const getUserInfo = _doc => {
  const { _id, ...arg } = _doc

  return {
    ...arg,
    userId: _id
  }
}
module.exports = {
  sendEmail,
  responseCatch,
  getUserInfo,
  isLoginHandel,
  session_key
}
