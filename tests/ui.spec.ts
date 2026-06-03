import { test, expect } from '@playwright/test';

// Drives the actual storefront UI the way a shopper (or stakeholder) would.
test.describe('storefront UI', () => {
  test('shopper can browse, add to cart and check out', async ({ page }) => {
    await page.goto('/');

    // catalogue renders
    await expect(page.locator('.product')).toHaveCount(4);

    // add the first product to the cart
    await page.locator('.product button').first().click();
    await expect(page.locator('.cart-items .line')).toHaveCount(1);

    // place the order
    await page.fill('#customerName', 'Ada Lovelace');
    await page.click('#placeOrder');

    // order confirmation appears
    await expect(page.locator('.ok-badge')).toContainText('Order confirmed');
    await expect(page.locator('.receipt .order-id')).toContainText('pay_');
  });
});
