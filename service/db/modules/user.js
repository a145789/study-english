const mongoose = require('mongoose')

const SetEmailCodeModel = () => {
  const schema = new mongoose.Schema({
    email: { type: String, required: true },
    emailCode: { type: Number, required: true }
  })
  return mongoose.model('SetEmailCode', schema)
}

module.exports = { SetEmailCodeModel: SetEmailCodeModel() }
