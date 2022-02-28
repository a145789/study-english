const router = require('koa-router')()
const { responseCatch } = require('../utils/index')
const {
  WordTypeCodeMong: { WordTypeCodeModel },
  WordMong: { WordModel }
} = require('../db/modules/word')

router.get('/api/word_type_list', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const wordTypeList = await WordTypeCodeModel.find({})
    const data =
      wordTypeList?.map(item => ({
        id: item._id,
        name: item.name,
        type: item.type
      })) || []
    ctx.body = {
      code: 200,
      data
    }
  })
})

router.get('/api/word_list', async (ctx, next) => {
  await responseCatch(ctx, async () => {
    const { id } = ctx.query
    console.log(id)
    const data = await WordModel.find({ _id: id }, { word: 1 })

    ctx.body = {
      code: 200,
      data
    }
  })
})

module.exports = router
