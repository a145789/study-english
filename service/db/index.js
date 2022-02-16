const mongoose = require('mongoose')

module.exports = () => async (ctx, next) => {
  mongoose.connect('mongodb://127.0.0.1:27017/study_english', () => {
    console.log('数据库连接成功')
  })
  await next()
}
