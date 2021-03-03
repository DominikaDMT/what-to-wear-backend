const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwToken = require('jsonwebtoken');

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

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again later',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    // encrypt password!
    password: hashedPassword,
    image: image || '',
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

  let token;
  try {
    token = jwToken.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWTOKEN_PASSWORD,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later',
      422
    );
    return next(error);
  }

  // res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  res
    .status(201)
    .json({
      user: { id: existingUser.id, email: existingUser.email },
      token: token,
    });
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

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in',
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credencials and try again',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in',
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwToken.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWTOKEN_PASSWORD,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later',
      422
    );
    return next(error);
  }

  res.json({
    user: { id: existingUser.id, email: existingUser.email },
    token: token,
  });
};

exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;