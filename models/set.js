const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const setSchema = new Schema({
    date: { type: Number },
    level1: { type: mongoose.Types.ObjectId, required: true, ref: 'Cloth' },
    level2: { type: mongoose.Types.ObjectId, required: true, ref: 'Cloth' },
    level3: { type: mongoose.Types.ObjectId, required: true, ref: 'Cloth' },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  },{ collection: 'sets' }
);

module.exports = mongoose.model('Set', setSchema);