const fs = require('fs')
const {
  WordTypeCodeMong: { WordTypeCodeModel },
  WordMong: { WordModel }
} = require('../service/db/modules/word.js')
const mongodb = require('../service/db/index')

async function storage(path, type) {
  const text = fs.readFileSync(path, 'utf8')

  const obj = JSON.parse(Buffer.from(text, 'base64').toString())
  const wordList = Object.keys(obj).reduce((acc, cur) => {
    if (obj[cur].length) {
      acc.push(...obj[cur])
    }
    return acc
  }, [])

  const wordType = new WordTypeCodeModel(type)
  await wordType.save()

  const wordTypeId = wordType._id
  for (const iterator of wordList) {
    const word = await WordModel.findOne({ word: iterator })
    if (word) {
      await WordModel.updateOne(
        { word: iterator },
        { $addToSet: { type: wordTypeId } }
      )
    } else {
      const word = new WordModel({
        word: iterator,
        type: [wordTypeId]
      })
      await word.save()
    }
  }
}

async function save() {
  await storage('./resource/primary-2.txt', {
    name: '初级-2',
    type: 'junior_2'
  })
  await storage('./resource/four-level.txt', {
    name: '四级',
    type: 'four_level'
  })
  await storage('./resource/six-level.txt', {
    name: '六级',
    type: 'six_level'
  })
  await storage('./resource/kaoyan.txt', { name: '考研', type: 'kaoyan' })
  await storage('./resource/tuofu.txt', { name: '托福', type: 'tuofu' })
  console.log('存储完成')
}

mongodb(save)
