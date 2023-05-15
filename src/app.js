import express from 'express';
import cors from 'cors';
import compression from 'compression';
import createError from 'http-errors';

import productRoutes from './routes/product.js';
import globalErrorHandler from './utils/error.js';

const app = express();
const router = express.Router();

app.use(cors());
app.use(compression());
app.use(express.json());

app.use('/api/v1', router);

router.use('/products', productRoutes);

router.all('*', (req, res, next) => {
  next(new createError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

export default app;
