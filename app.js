const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const clothesRoutes = require('./routes/clothesRoutes');
const userRoutes = require('./routes/userRoutes');

const HttpError = require('./models/http-error');

const port = process.env.PORT || 5000;

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/clothes', clothesRoutes);

app.use('/api/user', userRoutes);

// the other requests
app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404);
});

// default error handler
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headerSend) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An uknown error occurred!' });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.mwtky.mongodb.net/what-to-wear?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => {
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
