const express = require('express');
const { check } = require('express-validator');
// check zwróci skonfigurowane middleware
const fileUploadMiddleware = require('../middleware/file-upload');

const router = express.Router();

const clothesControllers = require('../controllers/clothes-controllers');

router.get('/item/:itemid', clothesControllers.getItemById);

router.patch(
  '/item/:itemid',
  [check('level').not().isEmpty(), check('color').not().isEmpty()],
  clothesControllers.editItem
);

router.delete('/item/:itemid', clothesControllers.deleteItem);

router.get('/all/:userid', clothesControllers.getAllItems);

router.post(
  '/newitem',
  fileUploadMiddleware.single('image'),
  [
    check('level').not().isEmpty(),
    check('color').not().isEmpty(),
    // check('image').isLength({ min: 5 }),
  ],
  clothesControllers.createItem
);

module.exports = router;