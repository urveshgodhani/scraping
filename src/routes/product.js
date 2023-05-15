import express from 'express';

import { getProducts } from '../controllers/product.js';

const router = express.Router({ mergeParams: true });

router.route('/compare').get(getProducts);

export default router;
