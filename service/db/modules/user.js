const mongoose = require('mongoose')
const { Schema, model } = mongoose

const EmailCodeSchema = new Schema({
  email: { type: String, required: true },
  emailCode: { type: String, required: true }
})
EmailCodeModel = model('email_code', EmailCodeSchema)

const UserSchema = Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now },
  unfamiliar: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  familiar: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  will: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  mastered: { type: [mongoose.Schema.Types.ObjectId], default: [] }
})

const UserModel = model('user', UserSchema)

module.exports = {
  emailCodeMong: { EmailCodeSchema, EmailCodeModel },
  UserMong: { UserSchema, UserModel }
}
