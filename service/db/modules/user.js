const mongoose = require('mongoose')
const { Schema, model } = mongoose

const EmailCodeSchema = new Schema({
  email: { type: String, required: true },
  emailCode: { type: String, required: true }
})
const EmailCodeModel = model('email_code', EmailCodeSchema)

const UserSchema = Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now },
  unfamiliar: { type: [Schema.Types.ObjectId], default: [] },
  familiar: { type: [Schema.Types.ObjectId], default: [] },
  will: { type: [Schema.Types.ObjectId], default: [] },
  mastered: { type: [Schema.Types.ObjectId], default: [] },
  sessionId: { type: String },
  punchTime: { type: [Date], default: [] }
})

const UserModel = model('user', UserSchema)

module.exports = {
  EmailCodeMong: { EmailCodeSchema, EmailCodeModel },
  UserMong: { UserSchema, UserModel }
}
