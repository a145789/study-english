const mongoose = require('mongoose')
const { responseCatch, isLoginHandel } = require('../utils/index')
const fetch = require('node-fetch')
const {
  WordTypeMong: { WordTypeModel },
  WordMong: { WordModel },
  WordInUserStatusMong: { WordInUserStatusModel }
} = require('../db/modules/word')

module.exports = router => {
  router.get('/api/word_type_list', async (ctx, next) => {
    await responseCatch(ctx, async () => {
      const wordTypeList = await WordTypeModel.find({}, { wordHandle: 0 })
      const data = wordTypeList || []
      ctx.body = {
        code: 200,
        data
      }
    })
  })

  router.get('/api/word_list', async (ctx, next) => {
    await responseCatch(ctx, async () => {
      let { wordTypeId, wordStatus, skip = 0, limit = 30 } = ctx.query
      skip = Number(skip)
      limit = Number(limit)
      const {
        userInfo: { userId }
      } = ctx
      let wordIdList = []
      if (userId) {
        const wordTypeStatus = await WordInUserStatusModel.findOne(
          {
            userId,
            wordTypeId
          },
          { _id: 0, familiar: 1, will: 1, mastered: 1 }
        )
        if (wordTypeStatus) {
          const { will, mastered, familiar } = wordTypeStatus._doc || {
            will: 0,
            mastered: 0,
            familiar: 0
          }
          wordIdList =
            wordStatus === 'unfamiliar'
              ? [...will, ...mastered, ...familiar]
              : wordTypeStatus[wordStatus]
        } else {
          const newWordTypeStatus = new WordInUserStatusModel({
            userId,
            wordTypeId
          })
          await newWordTypeStatus.save()
        }
      }

      if (!wordIdList.length && wordStatus !== 'unfamiliar') {
        ctx.body = {
          code: 200,
          data: {
            hasMore: false,
            skip: 0,
            count: 0,
            list: []
          }
        }
        return
      }

      const wordOptions = {
        type: { $in: [mongoose.Types.ObjectId(wordTypeId)] }
      }
      if (wordIdList.length) {
        wordOptions._id =
          wordStatus === 'unfamiliar'
            ? { $nin: wordIdList }
            : { $in: wordIdList }
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
          list,
          count
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
      const loginErrBody = await isLoginHandel(ctx)
      if (loginErrBody) {
        ctx.body = loginErrBody
        return
      }
      const { wordId, wordTypeId, wordStatus, moveWordStatus } =
        ctx.request.body
      const {
        userInfo: { userId }
      } = ctx

      const option = {
        updateTime: Date.now()
      }

      if (wordStatus !== 'unfamiliar') {
        option.$pull = {
          [wordStatus]: wordId
        }
      }
      if (moveWordStatus !== 'unfamiliar') {
        option.$addToSet = {
          [moveWordStatus]: wordId
        }
      }

      const {
        _doc: { familiar, mastered, will }
      } = await WordInUserStatusModel.findOneAndUpdate(
        { userId, wordTypeId },
        option,
        {
          new: true,
          fields: {
            _id: 0,
            familiar: 1,
            mastered: 1,
            will: 1
          }
        }
      )

      ctx.body = {
        code: 200,
        data: {
          familiarCount: familiar.length,
          masteredCount: mastered.length,
          willCount: will.length
        }
      }
    })
  })

  router.get('/api/word_dictation', async (ctx, next) => {
    await responseCatch(ctx, async () => {
      const loginErrBody = await isLoginHandel(ctx)
      if (loginErrBody) {
        ctx.body = loginErrBody
        return
      }

      const {
        userInfo: { userId }
      } = ctx
      const { count, wordBank, wordStatus } = ctx.query

      const { _doc } = await UserModel.findOne(
        { _id: userId },
        { familiar: 1, mastered: 1, will: 1 }
      )

      const wordList = Array.isArray(wordStatus)
        ? wordStatus.reduce((acc, cur) => {
            acc.push(..._doc[cur])
            return acc
          }, [])
        : _doc[wordStatus]

      const words = await WordModel.find(
        {
          _id: { $in: wordList },
          type: { $in: Array.isArray(wordBank) ? wordBank : [wordBank] }
        },
        { type: 0, __v: 0 }
      )

      if (words.length !== count) {
        const temp = {}
        const data = []
        let i = 0
        while (i < count) {
          const random = Math.floor(Math.random() * words.length)
          if (!temp[random]) {
            data.push(words[random])
            temp[random] = true
            i++
          }
        }

        ctx.body = {
          code: 200,
          data: words
        }
      } else {
        ctx.body = {
          code: 200,
          data
        }
      }
    })
  })

  router.get('/api/word_status_count', async (ctx, next) => {
    await responseCatch(ctx, async () => {
      const loginErrBody = await isLoginHandel(ctx)
      if (loginErrBody) {
        ctx.body = loginErrBody
        return
      }

      const {
        userInfo: { userId }
      } = ctx
      const { wordTypeId, mode = 'normal' } = ctx.query

      if (wordTypeId) {
        const {
          _doc: { familiar, mastered, will }
        } = await WordInUserStatusModel.findOne({ userId, wordTypeId })

        ctx.body = {
          code: 200,
          data: {
            familiarCount: familiar.length,
            masteredCount: mastered.length,
            willCount: will.length
          }
        }
      } else {
        const wordInUserStatus = await WordInUserStatusModel.find({ userId })
        const wordInUserStatusMerge = wordInUserStatus.reduce(
          (acc, cur) => {
            acc.familiar.push(...cur.familiar)
            acc.mastered.push(...cur.mastered)
            acc.will.push(...cur.will)
            return acc
          },
          { familiar: [], mastered: [], will: [] }
        )

        if (mode === 'deduplication') {
          wordInUserStatusMerge.familiar = [
            ...new Set(wordInUserStatusMerge.familiar)
          ]
          wordInUserStatusMerge.mastered = [
            ...new Set(wordInUserStatusMerge.mastered)
          ]
          wordInUserStatusMerge.will = [...new Set(wordInUserStatusMerge.will)]
        }

        ctx.body = {
          code: 200,
          data: {
            familiarCount: wordInUserStatusMerge.familiar.length,
            masteredCount: wordInUserStatusMerge.mastered.length,
            willCount: wordInUserStatusMerge.will.length
          }
        }
      }
    })
  })
}
