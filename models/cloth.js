const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const clothSchema = new Schema({
    name: { type: String },
    image: { type: Buffer},
    imageURL: { type: String },
    color: { type: String, required: true },
    level: { type: Number, required: true },
    brand: { type: String },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  },{ collection: 'clothes' }
);

module.exports = mongoose.model('Cloth', clothSchema);
