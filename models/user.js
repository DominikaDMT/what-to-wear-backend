const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    image: { type: String },
    clothes: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Cloth' }],
    sets: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Set' }],
  },{ collection: 'users' }
);

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
