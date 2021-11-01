const seeder = require('mongoose-seed')

const items = require('../data/data')

let data = [
  {
    'model': 'Handbook',
    'documents': items
  }
]
// const uri = 'mongodb+srv://luannv:luannv@brain-loss-db.bakke.mongodb.net/handbook?retryWrites=true&w=majority'
const uri = 'mongodb://localhost:27017/handbook'
seeder.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: false}, function() {
  seeder.loadModels([
    './models/Handbook.js',
  ])
  seeder.clearModels(['Handbook'], function() {
    seeder.populateModels(data, function() {
      seeder.disconnect()
    })
  })
})