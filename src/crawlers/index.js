import { chromium } from 'playwright';

import scrapeAmazon from './amazon.js';
import scrapeFlipkart from './flipkart.js';
import scrapeMeesho from './meesho.js';
import scrapeEyeMyEye from './eyemyeye.js';
import scrape1mg from './1mg.js';
import Product from '../models/product.js';

export default async function (searchQuery) {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  try {
    const products = await Promise.allSettled([
      scrapeAmazon(searchQuery, context),
      scrapeFlipkart(searchQuery, context),
      scrapeMeesho(searchQuery, context),
      scrapeEyeMyEye(searchQuery, context),
      scrape1mg(searchQuery, context),
    ]);

    await Promise.allSettled(
      products.map(async product => {
        if (product.status === 'fulfilled') {
          const { value } = product;
          console.log(value.products, ' : ', value.website);
          return Product.insertMany(value.products, { ordered: false });
        }
      })
    );
  } catch (err) {
    console.error(err);
  } finally {
    // await browser.close();
  }
}
