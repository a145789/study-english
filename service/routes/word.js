const router = require('koa-router')()
const { responseCatch } = require('../utils/index')
const fetch = require('node-fetch')
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
      .skip(0)
      .limit(15)

    ctx.body = {
      code: 200,
      data
    }
  })
})

router.get('/api/word', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const { _id } = ctx.query

    let word = await WordModel.findOne({ _id }, { type: 0 })

    if (!word.americanPhonetic || !word.sampleSentences.length) {
      await responseCatch(ctx, async () => {
        const data = await fetch(
          `https://static2.youzack.com/youzack/bdc2/word_detail/924fa861-4c26-4cca-b091-21ac08bb9ab0/${word.word}.json`
        )

        const {
          britishPhonetic,
          americanPhonetic,
          translation,
          sampleSentences
        } = await data.json()

        const translation_1 = translation[0]
          .slice(0, translation[0].indexOf('[\n'))
          .replace('\n', '')
          .replace(/\s+\[\s+/, '')
          .replace(/\s{4}/, '')

        word = await WordModel.findOneAndUpdate(
          { _id },
          {
            $set: {
              britishPhonetic,
              americanPhonetic,
              sampleSentences,
              translation_1
            }
          },
          {
            new: true,
            fields: { type: 0 }
          }
        )
      })
    }

    if (!word.translation_2) {
      await responseCatch(ctx, async () => {
        const data = await fetch(
          `https://dict.iciba.com/dictionary/word/suggestion?word=${word.word}&nums=5&ck=709a0db45332167b0e2ce1868b84773e&timestamp=1644479122751&client=6&uid=123123&key=1000006&is_need_mean=1&signature=16c1edde9369cbf38448b1a1acfe3191`
        )

        const { message, status = 0 } = await data.json()

        if (status !== 0) {
          const [{ paraphrase: translation_2 }] = message.splice(0, 1)
          if (message.length) {
            const association = message.map(({ key, paraphrase }) => {
              return {
                word: key,
                translation: paraphrase
              }
            })
            word = await WordModel.findOneAndUpdate(
              { _id },
              { $set: { translation_2, association } },
              {
                new: true,
                fields: { type: 0 }
              }
            )
          }
        }
      })
    }

    ctx.body = {
      code: 200,
      data: word
    }
  })
})

module.exports = router
