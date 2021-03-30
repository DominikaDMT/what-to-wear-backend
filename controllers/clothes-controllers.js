const HttpError = require('../models/http-error');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const mongodb = require('mongodb');

const Cloth = require('../models/cloth');
const User = require('../models/user');
const Set = require('../models/set');

const getItemById = async (req, res, next) => {
  const itemId = req.params.itemid;
  let item;
  try {
    item = await Cloth.findById(itemId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find an item',
      500
    );
    return next(error);
  }

  if (!item) {
    const error = new HttpError(
      'Could not find an item for the provided id',
      404
    );
    return next(error);
  }

  res.json({ item: item.toObject({ getters: true }) });
};

const getRandomItem = async (req, res, next) => {
  const { level, creatorId } = req.body;

  let item;
  try {
    const count = await Cloth.countDocuments({ level: level, creator: creatorId });
    const random = Math.floor(Math.random() * count);
    item = await Cloth.findOne({ level: level, creator: creatorId }, '-color -brand -creator -level -name').skip(random);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not get random item',
      404
    );
    return next(error);
  }
  res.json({ item: item.toObject({ getters: true }) });
};

const editItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      'Invalid inputs passed, please check your data',
      422
    );
    return next(error);
  }
  const itemId = req.params.itemid;
  const { name, color, level, brand } = req.body;

  let item;
  try {
    item = await Cloth.findById(itemId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find item',
      500
    );
    return next(error);
  }

  if (item.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to edit this place',
      403
    );
    return next(error);
  }

  item.name = name;
  item.color = color;
  item.level = +level;
  item.brand = brand;

  try {
    await item.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update an item',
      500
    );
    return next(error);
  }

  res.status(200).json({ item: item.toObject({ getters: true }) });
};

const deleteItem = async (req, res, next) => {
  const itemId = req.params.itemid;

  let item;
  try {
    item = await Cloth.findById(itemId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete an item',
      500
    );
    return next(error);
  }

  if (!item) {
    const error = new HttpError(
      'Could not find an item for the provided id',
      404
    );
    return next(error);
  }

  if (item.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this place',
      403
    );
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await item.remove({ session: session });
    item.creator.clothes.pull(item);
    await item.creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete an item',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Deleted item' });
};

const getAllItems = async (req, res, next) => {

  const searchParams = req.params.useridandlevel;
  const [creatorId, level] = searchParams.split('-');

  let allItems;
  try {
    allItems = await Cloth.find({ creator: creatorId, level: level });
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not load the items',
      500
    );
    return next(error);
  }
  if (!allItems || allItems.length === 0) {
    const error = new HttpError('Could not find items for that user', 404);
    return next(error);
  }

  res.json({
    allItems: allItems.map((item) => item.toObject({ getters: true })),
  });
};

const getAllSets = async (req, res, next) => {
  let sets;
  try {
    sets = await Set.find({ creator: req.userData.userId });
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not load sets',
      500
    );
    return next(error);
  }

  if (!sets || sets.length === 0) {
    const error = new HttpError('Could not find sets for that user', 404);
    return next(error);
  }

  res.json({
    sets: sets.map((set) => set.toObject({ getters: true })),
  });
};

const createSet = async (req, res, next) => {
  const { date, level1, level2, level3 } = req.body;

  const createdSet = new Set({
    date,
    level1,
    level2,
    level3,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Creating set failed, please try again', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      'Could not find a user for the provided id',
      404
    );
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdSet.save({ session: session });
    user.sets.push(createdSet);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError('Creating set failed, please try again', 500);
    return next(error);
  }

  res.status(201).json({ set: createdSet });
};

const createItem = async (req, res, next) => {
  const { name, image, imageURL, color, level, brand } = req.body;

  const createdItem = new Cloth({
    name,
    image: req.file ? new mongodb.Binary(req.file.buffer) : '',
    imageMimeType: req.file ? req.file.mimetype : '',
    imageURL,
    color,
    level: +level,
    brand,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Creating item failed, please try again', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      'Could not find a user for the provided id',
      404
    );
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdItem.save({ session: session });
    user.clothes.push(createdItem);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError('Creating item failed, please try again', 500);
    return next(error);
  }

  res.status(201).json({ item: createdItem });
};

exports.getItemById = getItemById;
exports.getRandomItem = getRandomItem;
exports.getAllItems = getAllItems;
exports.createItem = createItem;
exports.editItem = editItem;
exports.deleteItem = deleteItem;

exports.createSet = createSet;
exports.getAllSets = getAllSets;