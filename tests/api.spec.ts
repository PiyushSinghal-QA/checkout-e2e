import { test, expect } from '@playwright/test';

// Black-box API tests — they only talk to the running app over HTTP.
// The seeded demo cart is Widget 1999x2 + Gadget 4999x1 = 8997 subtotal.
const VALID = { cartId: 'demo-cart', customer: { name: 'Ada Lovelace' } };

test.describe('checkout-service API', () => {
  test('GET /products returns the catalogue', async ({ request }) => {
    const res = await request.get('/products');
    expect(res.ok()).toBeTruthy();
    const products = await res.json();
    expect(products.length).toBeGreaterThanOrEqual(4);
  });

  test('completes a valid checkout', async ({ request }) => {
    const res = await request.post('/checkout', { data: VALID });
    expect(res.status()).toBe(201);
    const order = await res.json();
    expect(order.status).toBe('confirmed');
    expect(order.subtotal).toBe(8997);
  });

  // Guards bug/wrong-import (legacy 5% tax module).
  test('applies 20% VAT to the taxable total', async ({ request }) => {
    const order = await (await request.post('/checkout', { data: VALID })).json();
    expect(order.tax).toBe(1799);
    expect(order.total).toBe(10796);
  });

  // Guards bug/typo (misspelled response key).
  test('returns a human-readable formattedTotal', async ({ request }) => {
    const order = await (await request.post('/checkout', { data: VALID })).json();
    expect(typeof order.formattedTotal).toBe('string');
    expect(order.formattedTotal).toMatch(/^£\d+\.\d{2}$/);
  });

  // Guards bug/null-check (missing-cart must 404, not 500).
  test('returns 404 when the cart does not exist', async ({ request }) => {
    const res = await request.post('/checkout', { data: { cartId: 'ghost-cart', customer: { name: 'Ada' } } });
    expect(res.status()).toBe(404);
  });

  // Guards bug/missing-validation (empty customer name must be rejected).
  test('rejects checkout with an empty customer name (400)', async ({ request }) => {
    const res = await request.post('/checkout', { data: { cartId: 'demo-cart', customer: { name: '' } } });
    expect(res.status()).toBe(400);
  });

  // Guards bug/unhandled-error (declined payment must surface as 400, not 500).
  test('returns 400 when the payment is declined', async ({ request }) => {
    const res = await request.post('/checkout', { data: { cartId: 'demo-cart', customer: { name: 'DECLINE' } } });
    expect(res.status()).toBe(400);
  });
});
