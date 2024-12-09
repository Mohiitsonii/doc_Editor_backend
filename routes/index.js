import express from 'express';
import userRouter from './userRouter.js';
import documentRouter from './documentRouter.js';

const app = express();
const Router = express.Router();


Router.use('/users/', userRouter);
Router.use('/documents/', documentRouter);

export default Router;
