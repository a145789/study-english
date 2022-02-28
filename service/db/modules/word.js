const mongoose = require('mongoose')
const { Schema, model } = mongoose

const WordTypeSchema = Schema({
  name: { type: String },
  type: { type: String, required: true }
})
const WordTypeCodeModel = model('word_type', WordTypeSchema)

const WordSchema = Schema({
  type: { type: [mongoose.Schema.Types.ObjectId], default: [] },
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

module.exports = {
  WordTypeCodeMong: { WordTypeSchema, WordTypeCodeModel },
  WordMong: { WordSchema, WordModel }
}
