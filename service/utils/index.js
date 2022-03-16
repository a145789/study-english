const nodemailer = require('nodemailer')

const sendEmail = (email, emailCode) => {
  const transporter = nodemailer.createTransport({
    service: 'QQ', // 发送者的邮箱厂商，支持列表：https://nodemailer.com/smtp/well-known/
    port: 465, // SMTP 端口
    secureConnection: true, // SSL安全链接
    auth: {
      //发送者的账户密码
      user: '1484176425@qq.com', //账户
      pass: 'yipcejqximobfffc' //smtp授权码，到邮箱设置下获取
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

const getUserInfo = _doc => {
  const { _id, familiar, will, mastered, ...arg } = _doc

  return {
    ...arg,
    userId: _id,
    familiarCount: familiar?.length || 0,
    willCount: will?.length || 0,
    masteredCount: mastered?.length || 0
  }
}
module.exports = { sendEmail, responseCatch, getUserInfo }
