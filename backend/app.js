import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { errors, celebrate, Joi } from 'celebrate';
import cardRouter from './routes/cards';
import userRouter from './routes/users';
import auth from './middlewares/auth';
import { login, createUser } from './controllers/users';
import NotFoundError from './errors/not-found-error';
import { URL_REGEX } from './constants';
import { requestLogger, errorLogger } from './middlewares/logger';

const { PORT = 3000 } = process.env;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use('/cards', auth, cardRouter);
app.use('/users', auth, userRouter);
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  }),
  login,
);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().pattern(URL_REGEX),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  }),
  createUser,
);

app.use((req, res, next) => {
  next(new NotFoundError('Страницы по запрошенному URL не существует'));
});

app.use(errorLogger);

app.use(errors());

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.statusCode).send({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
