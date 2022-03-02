const router = require('koa-router')()
const { responseCatch } = require('../utils/index')
const {
  WordTypeCodeMong: { WordTypeCodeModel },
  WordMong: { WordModel }
} = require('../db/modules/word')
const {
  UserMong: { UserModel }
} = require('../db/modules/user')

router.get('/api/word_type_list', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const wordTypeList = await WordTypeCodeModel.find({})
    const data = wordTypeList || []
    ctx.body = {
      code: 200,
      data
    }
  })
})

router.get('/api/word_list', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const { _id, wordStatus } = ctx.query
    const { userId } = ctx.userInfo
    let wordIdList = []
    if (userId) {
      const showWordList =
        wordStatus === 'unfamiliar'
          ? { _id: 0, will: 1, mastered: 1, familiar: 1 }
          : { _id: 0, [wordStatus]: 1 }
      const user = await UserModel.findOne({ _id: userId }, showWordList)
      wordIdList = Object.keys(user._doc).reduce(
        (p, c) => p.concat(...user[c]),
        []
      )
    }
    const wordOptions = {
      type: { $in: [_id] }
    }
    if (wordIdList.length) {
      wordOptions._id =
        wordStatus === 'unfamiliar' ? { $nin: wordIdList } : { $in: wordIdList }
    } else if (wordStatus !== 'unfamiliar') {
      wordOptions._id = { $nin: [] }
      ctx.body = {
        code: 200,
        data: []
      }
      return
    }
    const data = await WordModel.find(wordOptions, { word: 1 })

    ctx.body = {
      code: 200,
      data
    }
  })
})

module.exports = router
