const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');

const User = require('../models/user');

// const errorHandler = (message, code) => {
//   const error = new HttpError(message, code);
//   return next(error);
// }

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    // exclude password
    user = await User.findById(userId, '-password');
  } catch (err) {
    const error = new HttpError('Fetching user failed', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      'Could not find an user for the provided id',
      404
    );
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      'Invalid inputs passed, please check your data',
      422
    );
    return next(error);
  }
  const { name, email, password, image } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User for provided email exists already', 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    // encrypt password!
    password,
    image:
      image ||
      'https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg',
    clothes: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later',
      422
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later',
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      'Invalid credentials, could not log you in',
      401
    );
    return next(error);
  }

  res.json({ message: 'Logged in' });
};

exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;