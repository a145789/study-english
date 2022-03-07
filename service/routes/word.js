const router = require('koa-router')()
const mongoose = require('mongoose')
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
    let { _id, wordStatus, skip = 0, limit = 30 } = ctx.query
    skip = Number(skip)
    limit = Number(limit)
    const {
      userInfo: { userId }
    } = ctx
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
      type: { $in: [mongoose.Types.ObjectId(_id)] }
    }
    if (wordIdList.length) {
      wordOptions._id =
        wordStatus === 'unfamiliar' ? { $nin: wordIdList } : { $in: wordIdList }
    } else if (wordStatus !== 'unfamiliar') {
      ctx.body = {
        code: 200,
        data: []
      }
      return
    }
    const wordList = await WordModel.aggregate([
      {
        $match: wordOptions
      },
      {
        $project: {
          word: 1
        }
      },
      {
        $facet: {
          stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],
          stage2: [{ $skip: skip }, { $limit: limit }]
        }
      },
      { $unwind: '$stage1' },
      {
        $project: {
          count: '$stage1.count',
          data: '$stage2'
        }
      }
    ])

    const [{ count, data: list }] = wordList
    const nextSkip = skip + limit

    ctx.body = {
      code: 200,
      data: {
        hasMore: nextSkip < count,
        skip: nextSkip,
        list
      }
    }
  })
})

router.get('/api/word', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const { _id } = ctx.query

    let word = await WordModel.findOne({ _id }, { type: 0 })

    if (!word.americanPhonetic || !word.sampleSentences.length) {
      try {
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
      } catch (error) {
        console.log(error)
      }
    }

    if (!word.translation_2) {
      try {
        {
          const data = await fetch(
            `https://dict.iciba.com/dictionary/word/suggestion?word=${word.word}&nums=5&ck=709a0db45332167b0e2ce1868b84773e&timestamp=1644479122751&client=6&uid=123123&key=1000006&is_need_mean=1&signature=16c1edde9369cbf38448b1a1acfe3191`
          )

          const { message, status = 0 } = await data.json()

          if (status !== 0) {
            const setOptions = {}
            const [{ paraphrase: translation_2 = '' }] =
              message.splice(0, 1) || []
            setOptions.translation_2 = translation_2
            if (message.length) {
              setOptions.association = message.map(({ key, paraphrase }) => {
                return {
                  word: key,
                  translation: paraphrase
                }
              })
            }
            word = await WordModel.findOneAndUpdate(
              { _id },
              { $set: setOptions },
              {
                new: true,
                fields: { type: 0 }
              }
            )
          }
        }
      } catch (error) {
        console.log(error)
      }
    }

    ctx.body = {
      code: 200,
      data: word
    }
  })
})

router.post('/api/word_handle', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const { _id, wordStatus, moveWordStatus } = ctx.request.body
    const {
      userInfo: { userId }
    } = ctx

    await UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          [moveWordStatus]: _id
        },
        $pull: {
          [wordStatus]: _id
        }
      }
    )

    ctx.body = {
      code: 200,
      data: null
    }
  })
})

module.exports = router
