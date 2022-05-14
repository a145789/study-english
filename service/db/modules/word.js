const mongoose = require('mongoose')
const { Schema, model } = mongoose

const WordTypeSchema = Schema({
  name: { type: String },
  type: { type: String, required: true }
})
const WordTypeModel = model('word_type', WordTypeSchema)

const WordSchema = Schema({
  type: { type: [Schema.Types.ObjectId], default: [] },
  word: { type: String, required: true },
  /** 美式发音 */
  americanPhonetic: { type: String },
  /** 英式发音 */
  britishPhonetic: { type: String },
  /** 例句 */
  sampleSentences: { type: [{ en: String, cn: String }], default: [] },
  /** 翻译1 */
  translation_1: { type: String },
  /** 翻译2 */
  translation_2: { type: String },
  /** 关联词 */
  association: { type: [{ word: String, translation: String }], default: [] }
})

const WordModel = model('word', WordSchema)

const WordInUserStatusSchema = Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  wordTypeId: { type: Schema.Types.ObjectId, required: true },
  familiar: { type: [Schema.Types.ObjectId], default: [] },
  will: { type: [Schema.Types.ObjectId], default: [] },
  mastered: { type: [Schema.Types.ObjectId], default: [] },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
})

const WordInUserStatusModel = model(
  'word_in_user_status',
  WordInUserStatusSchema
)

module.exports = {
  WordTypeMong: { WordTypeSchema, WordTypeModel },
  WordMong: { WordSchema, WordModel },
  WordInUserStatusMong: { WordInUserStatusSchema, WordInUserStatusModel }
}
