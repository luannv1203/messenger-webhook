const mongoose = require('mongoose')
const Schema = mongoose.Schema

let counter = 0;
let CountedId = {type: Number, default: () => counter++};

const HandbookSchema = new Schema({
  id: CountedId,
  title: {type: String, required: true},
  isParent: {type: Boolean},
  parentID: {type: Number},
  content: {type: String}
})

const handbookModel = mongoose.model('Handbook', HandbookSchema)

module.exports = handbookModel
