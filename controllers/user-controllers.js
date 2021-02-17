const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Uzytkownik1',
    email: 'user1@test.com',
    password: 'testowanie',
    image:
      'https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg',
    amountOfClothes: 5,
  },
  {
    id: 'u2',
    name: 'Uzytkownik2',
    email: 'user2@test.com',
    password: 'testowanie',
    image:
      'https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg',
    amountOfClothes: 7,
  },
];

const getUserById = (req, res, next) => {
  const userId = req.params.uid;
  const user = DUMMY_USERS.find((user) => user.id === userId);
  console.log(user);

  if (!user) {
    return next(
      new HttpError('Could not find an user for the provided id', 404)
    );
  }

  res.json({ user });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data', 422);
  }
  const { name, email, password, image } = req.body;
  const existingUser = DUMMY_USERS.find((user) => user.email === email);
  if (existingUser) {
    throw new HttpError('User with provided email already exists!', 422);
  }
  const createdUser = { id: uuid(), name, email, password, image };
  DUMMY_USERS.push(createdUser);
  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { name, password } = req.body;
  const identifiedUser = DUMMY_USERS.find((user) => user.name === name);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      'Could not identify user, credencials seem to be wrong',
      401
    );
  }
  res.json({ message: 'Logged in' });
};

exports.getUserById = getUserById;
exports.signup = signup;
exports.login = login;