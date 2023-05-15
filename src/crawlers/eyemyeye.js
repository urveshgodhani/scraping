import cheerio from 'cheerio';

export default async function (searchQuery, context) {
  const products = []; // Array to store all the products

  /**
   * @type {import('playwright').Page}
   */
  const page = await context.newPage();

  let count = 0;

  try {
    await page.goto(`https://www.eyemyeye.com/search?q=${searchQuery}`);

    while (true) {
      await page.mouse.wheel(0, 15000);
      await page.waitForTimeout(1000);
      await page.waitForSelector('span[class="next-page"]', { timeout: 5000 });

      const productContainer = await page.$$('[class="product-item"]');

      for (let product of productContainer) {
        const containerHtml = await product.innerHTML();
        const $ = cheerio.load(containerHtml);

        const productUrl = $('div.short_description > a')?.get(0)?.attribs?.href;
        const productTitle = $('span[class="short_desc"]').text();
        const productRatingCount = $('span[class="rating"]').text();
        const productReviewCount = $('span[class="rating_count"]').text();
        const productPrice = $('span[class="offer-price"]').text();

        products.push({
          url: `https://www.eyemyeye.com${productUrl}`,
          title: productTitle,
          code: productTitle.toLowerCase().split(' ').join('_'),
          total_review_count: productReviewCount.slice(1, -1),
          rating: productRatingCount
            ? `${productRatingCount} out of 5 stars`
            : '0.0 out of 5 stars',
          price: productPrice.split('₹')[1],
          website: "www.eyemyeye.com"
        });
      }

      const nextButton = await page.$('span[class="next-page"]');

      if (count === 20) {
        break;
      }

      count++;

      await nextButton.click();

      console.log(
        `✅ ${products.length} products scrapped for category ${searchQuery} from eyemyeye.com`
      );
    }
  } catch (err) {
    console.error(err);
  }

  return { products, website: 'eyemyeye' };
}
