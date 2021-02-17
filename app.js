const express = require('express');
const bodyParser = require('body-parser');

const clothesRoutes = require('./routes/clothesRoutes');
const userRoutes = require('./routes/userRoutes');

const HttpError = require('./models/http-error');

const port = process.env.PORT || 5000;

const app = express();

// zmienia na obiekt lub tablicę, i automatycznie wywołuje next
app.use(bodyParser.json());

// routy są dodane jako middleware
app.use('/api/clothes', clothesRoutes);

app.use('/api/user', userRoutes);

// pozostałe req
app.use((req, res, next) => {
  throw new HttpError('Could not find this route', 404);
});

// default error handler
app.use((error, req, res, next) => {
  if (res.headerSend) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An uknown error occurred!' });
});

app.listen(port);