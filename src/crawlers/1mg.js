import cheerio from 'cheerio';

export default async function (searchQuery, context) {
  const products = [];

  const page = await context.newPage();

  let count = 0;

  try {
    await page.goto(`https://www.1mg.com/search/all?name=${searchQuery}`);

    while (true) {
      await page.mouse.wheel(0, 15000);
      await page.waitForTimeout(1000);
      await page.waitForSelector('div[class="style__product-box___3oEU6"]', { timeout: 5000 });

      const loginPopup = await page.$(`img[alt="clear input"]`);

      if (loginPopup) {
        loginPopup.click();
      }

      const productContainer = await page.$$('div[class="style__product-box___3oEU6"]');

      for (let product of productContainer) {
        const containerHtml = await product.innerHTML();
        const $ = cheerio.load(containerHtml);

        const productUrl = $('a')?.get(0)?.attribs?.href;

        const productTitle = $('div[class="style__pro-title___3G3rr"]').text();
        const productRatingCount = $('span[class="CardRatingDetail__weight-700___27w9q"]').text();
        const productReviewCount = $(
          'span[class="CardRatingDetail__ratings-header___2yyQW"]'
        ).text();
        const productPrice = $('div[class="style__price-tag___KzOkY"]').text();

        products.push({
          url: `https://www.1mg.com${productUrl}`,
          title: productTitle,
          reviewCount: parseInt(productReviewCount?.split(' ')?.[0] || 0, 10),
          rating: parseFloat(productRatingCount || 0.0),
          price: parseInt(productPrice?.split('₹')?.[1] || 0, 0),
          website: "www.1mg.com"
        });
      }

      const nextButton = await page.$('span:has-text("Next >")');

      if (count === 20) {
        break;
      }

      count++;

      await nextButton.click();

      console.log(
        `✅ ${products.length} products scrapped for category ${searchQuery} from 1mg.com`
      );
    }
  } catch (err) {
    console.error(err);
  }

  return { products, website: '1mg' };
}
