import HttpError from 'http-errors';

import Product from '../models/product.js';
import scrapeProducts from '../crawlers/index.js';

export async function getProducts(req, res, next) {
  try {
    if (!req.query.search) {
      throw new HttpError(400, 'Search query is required!');
    }

    const { search, number_of_results, is_second_hand, filter, websites } = req.query;

    const numberOfResults = number_of_results || 3;
    const isSecondHand = is_second_hand || false;
    const filterBy = ['highest_price', 'lowest_price', 'highest_review', 'highest_rating'].includes(
      filter
    )
      ? filter
      : 'default';
    const websitesToCrawl = !websites || websites === 'all' ? [] : websites.split(',');

    let sort;

    switch (filterBy) {
      case 'highest_price':
        sort = { price: -1 };
        break;
      case 'lowest_price':
        sort = { price: 1 };
        break;
      case 'highest_review':
        sort = { total_review_count: -1 };
        break;
      case 'highest_rating':
        sort = { rating: -1 };
        break;
      default:
        sort = {};
        break;
    }

    const [products, totalProductCount] = await Promise.all([
      Product.find({
        $text: { $search: search, $caseSensitive: false, $diacriticSensitive: false },
        ...(isSecondHand && { is_second_hand: isSecondHand }),
        ...(websitesToCrawl.length && { website: { $in: websitesToCrawl } }),
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      })
        .sort(sort)
        .limit(numberOfResults),
      Product.countDocuments({
        $text: { $search: search, $caseSensitive: false, $diacriticSensitive: false },
      }),
    ]);

    if (products.length === 0) {
      res.json({ message: 'Data not available yet. Please check back in 5 minutes.' });
      scrapeProducts(search);
    } else {
      res.json({ products, total_products_considered: totalProductCount });
    }
  } catch (error) {
    return next(error);
  }
}
