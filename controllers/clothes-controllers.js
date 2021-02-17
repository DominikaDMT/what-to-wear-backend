const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');

const { validationResult } = require('express-validator');

let DUMMY_CLOTHES = [
  {
    id: 1,
    name: 'shirt',
    color: 'black',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4ZQPPICAGwol8jtic7wP8f_dh7Z5CK57jMtUCUT4_zpfHmPtZAvsam3pXhp9FWv1edVkDx3E&usqp=CAc',
    level: 1,
    creator: 'u1',
  },
  {
    id: 2,
    name: 'shirt',
    color: 'green',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4ZQPPICAGwol8jtic7wP8f_dh7Z5CK57jMtUCUT4_zpfHmPtZAvsam3pXhp9FWv1edVkDx3E&usqp=CAc',
    level: 1,
    creator: 'u1',
  },
  {
    id: 3,
    name: 'shirt',
    color: 'yellow',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4ZQPPICAGwol8jtic7wP8f_dh7Z5CK57jMtUCUT4_zpfHmPtZAvsam3pXhp9FWv1edVkDx3E&usqp=CAc',
    level: 1,
    creator: 'u1',
  },
  {
    id: 4,
    name: 'shirt',
    color: 'pink',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4ZQPPICAGwol8jtic7wP8f_dh7Z5CK57jMtUCUT4_zpfHmPtZAvsam3pXhp9FWv1edVkDx3E&usqp=CAc',
    level: 1,
    creator: 'u1',
  },
  {
    id: 5,
    name: 'shirt',
    color: 'geen',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4ZQPPICAGwol8jtic7wP8f_dh7Z5CK57jMtUCUT4_zpfHmPtZAvsam3pXhp9FWv1edVkDx3E&usqp=CAc',
    level: 1,
    creator: 'u1',
  },
];

const getItemById = (req, res, next) => {
  const itemId = req.params.itemid;
  const item = DUMMY_CLOTHES.find((item) => item.id === +itemId);

  if (!item) {
    // next(error) lub opcjonalnie throw an error, ale tylko w synchronicznym kodzie
    throw new HttpError('Could not find an item for the provided id', 404);
  }

  res.json({ item });
};

const editItem = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data', 422);
  }
  const itemId = req.params.itemid;
  const { color, level } = req.body;
  const item = DUMMY_CLOTHES.find((item) => item.id === +itemId);
  const index = DUMMY_CLOTHES.indexOf(item);
  const editedItem = { ...item, color, level };
  DUMMY_CLOTHES[index] = editedItem;
  res.status(200).json({ item: editedItem });
};

const deleteItem = (req, res, next) => {
  const itemId = req.params.itemid;
  if (!DUMMY_CLOTHES.find((item) => item.id === +itemId)) {
    throw new HttpError('Could not find an item for a provided id', 404);
  }
  DUMMY_CLOTHES = DUMMY_CLOTHES.filter((item) => item.id !== +itemId);
  res.status(200).json({ message: 'Deleted item' });
};

const getAllItems = (req, res, next) => {
  res.json({ DUMMY_CLOTHES });
};

const createItem = (req, res, next) => {
  // spr czy są jakieś errory
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data', 422);
  }
  const { color, level, image, creator } = req.body;
  const createdItem = {
    id: uuid(),
    color,
    level,
    image,
    creator,
  };
  DUMMY_CLOTHES.push(createdItem);
  res.status(201).json({ item: createdItem });
};

exports.getItemById = getItemById;
exports.getAllItems = getAllItems;
exports.createItem = createItem;
exports.editItem = editItem;
exports.deleteItem = deleteItem;