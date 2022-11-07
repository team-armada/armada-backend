import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import morganBody from 'morgan-body';

import cohortRouter from './routes/cohort';
import templateRouter from './routes/template';
import serviceRouter from './routes/service';
import userRouter from './routes/user';
import courseRouter from './routes/course';

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

// Routes
app.use('/cohort', cohortRouter);
app.use('/course', courseRouter);
app.use('/service', serviceRouter);
app.use('/template', templateRouter);
app.use('/user', userRouter);

// TODO: Add redirect route for refresh with React Router.
app.get('/*', (req, res) => {
  res.sendFile(
    // Specify route to entry point for front-end build.
    '',
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
