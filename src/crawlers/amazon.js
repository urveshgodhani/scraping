import cheerio from 'cheerio';

export default async function (searchQuery, context) {
  let products = []; // Array to store all the products

  const page = await context.newPage();

  try {
    await page.goto(`https://www.amazon.in/s?k=${searchQuery}`);

    while (true) {
      await page.waitForSelector(
        '.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator'
      );

      let productContainer = await page.$$(
        '[class="sg-col sg-col-4-of-12 sg-col-8-of-16 sg-col-12-of-20 sg-col-12-of-24 s-list-col-right"]'
      );

      if (productContainer.length === 0) {
        productContainer = await page.$$(
          'div[class="sg-col-4-of-24 sg-col-4-of-12 s-result-item s-asin sg-col-4-of-16 sg-col s-widget-spacing-small sg-col-4-of-20"]'
        );
      }

      for (let product of productContainer) {
        const containerHtml = await product.innerHTML();
        const $ = cheerio.load(containerHtml);

        const isSponsored = $('span[class="puis-label-popover-default"]').text();

        if (isSponsored) {
          continue;
        }

        const productUrl = $(
          'a[class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal"]'
        ).get(0).attribs.href;

        const [zero, first, second, third] = productUrl.split('/');

        const productTitle = $(
          'a[class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal"]'
        ).text();
        const productRatingCount = +$('span[class="a-icon-alt"]').text().split(' ')[0];
        const productReviewCount = +$('span[class="a-size-base s-underline-text"]')
          .text()
          .split(',')
          .join('');
        let productPrice = typeof $('span[class="a-offscreen"]').text().split('₹')[1];
        if (productPrice === 'string') {
          productPrice = +$('span[class="a-offscreen"]').text().split('₹')[1].split(',').join('');
        } else {
          productPrice = +$('span[class="a-offscreen"]').text().split('₹')[1];
        }

        products.push({
          url: `www.amazon.in/${first}/${second}/${third}`,
          title: productTitle,
          total_review_count: productReviewCount,
          rating: productRatingCount,
          price: productPrice,
          website: 'www.amazon.in',
        });
      }

      await Promise.all([
        await page.waitForSelector(
          '.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator'
        ),
        await page.click(
          '.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator'
        ),
      ]);

      console.log(
        `-> ${products.length} products scraped for category ${searchQuery} from amazon.in`
      );
    }
  } catch (err) {
    console.error(err);
  }

  return { products, website: 'amazon' };
}
