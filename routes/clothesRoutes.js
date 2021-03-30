const express = require('express');
const { check } = require('express-validator');
const clothesControllers = require('../controllers/clothes-controllers');
const fileUploadMiddleware = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.post('/item/random', clothesControllers.getRandomItem);

router.get('/item/:itemid', clothesControllers.getItemById);

router.patch(
  '/item/:itemid',
  [check('level').not().isEmpty(), check('color').not().isEmpty()],
  clothesControllers.editItem
);

router.delete('/item/:itemid', clothesControllers.deleteItem);

router.get('/all/latestsets', clothesControllers.getAllSets);

router.get('/all/:useridandlevel', clothesControllers.getAllItems);

router.post(
  '/newitem',
  fileUploadMiddleware.single('image'),
  [check('level').not().isEmpty(), check('color').not().isEmpty()],
  clothesControllers.createItem
);

router.post('/newset', clothesControllers.createSet);

module.exports = router;