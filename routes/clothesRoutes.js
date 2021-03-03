const express = require('express');
const { check } = require('express-validator');
// check zwróci skonfigurowane middleware
const clothesControllers = require('../controllers/clothes-controllers');
const fileUploadMiddleware = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// middleware, które sprawdza req czy ma token
router.use(checkAuth);


// router.get('item/photo/:itemid', clothesControllers.getPhotoById);

router.post('/item/random', clothesControllers.getRandomItem);

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