const mongoose = require('mongoose')

module.exports = () => {
  mongoose.connect('mongodb://127.0.0.1:27017/study_english', () => {
    console.log('数据库连接成功')
  })
}
