import cheerio from 'cheerio';

export default async function (searchQuery, context) {
  const products = []; // Array to store all the products

  /**
   * @type {import('playwright').Page}
   */
  const page = await context.newPage();

  let count = 0;

  try {
    await page.goto(`https://www.flipkart.com/search?q=${searchQuery}`);

    while (true) {
      await page.mouse.wheel(0, 15000);
      await page.waitForTimeout(1000);
      await page.waitForSelector('a[class="_1LKTO3"]', { timeout: 10000 });

      let productContainer = await page.$$('[class="_1xHGtK"]');

      if (productContainer.length === 0) {
        productContainer = await page.$$('[class="_2kHMtA"]');
      }

      if (productContainer.length === 0) {
        productContainer = await page.$$('[class="_1xHGtK _373qXS"]');
      }

      for (let product of productContainer) {
        const containerHtml = await product.innerHTML();
        const $ = cheerio.load(containerHtml);

        const productUrl =
          $('a[class="s1Q9rs"]')?.get(0)?.attribs?.href ||
          $('a[class="_1fQZEK"]')?.get(0)?.attribs?.href ||
          $('a[class="_2UzuFa"]')?.get(0)?.attribs?.href;

        const [zero, first, second, third] = productUrl.split('/');

        const productTitle =
          $('[class="_4rR01T"]')?.text() ||
          $('[class="s1Q9rs"]')?.text() ||
          $('[class="IRpwTa _2-ICcC"]')?.text() ||
          $('[class="IRpwTa"]')?.text();
        const productRatingCount = parseFloat($('[class="_3LWZlK"]')?.text()) || 0;
        const productReviewCount =
          +$('[class="_2_R_DZ"]')?.text()?.split('&')[1]?.split(' ')[0]?.replace(/[^\d]/g, '') || 0;
        const productPrice =
          +$('[class="_30jeq3"]').text()?.split('₹')[1]?.replace(/[^\d]/g, '') ||
          +$('[class="_30jeq3 _1_WHN1"]').text()?.split('₹')[1]?.replace(/[^\d]/g, '');

        products.push({
          url: `www.flipkart.com/${first}/${second}/${third.split('?')[0]}`,
          title: productTitle,
          total_review_count: productReviewCount,
          rating: productRatingCount,
          price: productPrice,
          website: 'www.flipkart.com',
        });
      }

      const nextButton = await page.$('span:has-text("Next")');

      if (count === 20) {
        break;
      }

      count++;

      await nextButton.click();

      console.log(
        `✅ ${products.length} products scrapped for category ${searchQuery} from Flipkart`
      );
    }
  } catch (err) {
    console.error(err);
  }

  return { products, website: 'flipkart' };
}
