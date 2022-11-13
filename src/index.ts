import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import morganBody from 'morgan-body';

import cohortRouter from './routes/cohort';
import templateRouter from './routes/template';
import serviceRouter from './routes/service';
import userRouter from './routes/user';
import courseRouter from './routes/course';
import authRouter from './routes/auth';
import path from 'path';

export interface TypedRequestBody<T> extends Express.Request {
  body: T;
}

dotenv.config();

const app = express();

morganBody(app);

const PORT = process.env.PORT;

// Cors
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static Files
app.use(express.static(path.join(__dirname, 'build')));

// Routes
app.use('/api/cohort', cohortRouter);
app.use('/api/course', courseRouter);
app.use('/api/service', serviceRouter);
app.use('/api/template', templateRouter);
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);

app.get('/*', (req, res) => {
  res.sendFile(
    // Specify route to entry point for front-end build.
    path.join(__dirname, 'build', 'index.html'),
    err => {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
