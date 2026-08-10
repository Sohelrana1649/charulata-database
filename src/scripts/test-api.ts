import app from '../app';
import mongoose from 'mongoose';
import { config } from '../config';

const TEST_PORT = 5001;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api/v1`;

const runTests = async () => {
  let server: any;
  try {
    console.log('[TEST] Starting integration test server...');
    server = app.listen(TEST_PORT, () => {
      console.log(`[TEST] Test server listening on port ${TEST_PORT}`);
    });

    // Wait 1 second for server initialization
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('\n--- TEST 1: Check Server Health ---');
    const healthRes = await fetch(`http://127.0.0.1:${TEST_PORT}/`);
    const healthData = await healthRes.json();
    console.log('Health Status:', healthRes.status);
    console.log('Health Body:', healthData);
    if (healthRes.status !== 200) throw new Error('Health check failed');

    console.log('\n--- TEST 2: Customer Login ---');
    const customerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@gmail.com', password: 'customer123' })
    });
    const customerLoginData: any = await customerLoginRes.json();
    console.log('Customer Login Status:', customerLoginRes.status);
    console.log('Customer Name:', customerLoginData.user?.name);
    if (customerLoginRes.status !== 200) throw new Error('Customer login failed');
    const customerToken = customerLoginData.token;

    console.log('\n--- TEST 3: Admin Login ---');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@charulata.com', password: 'admin123' })
    });
    const adminLoginData: any = await adminLoginRes.json();
    console.log('Admin Login Status:', adminLoginRes.status);
    console.log('Admin Name:', adminLoginData.user?.name);
    if (adminLoginRes.status !== 200) throw new Error('Admin login failed');
    const adminToken = adminLoginData.token;

    console.log('\n--- TEST 4: Fetch Products ---');
    const productsRes = await fetch(`${BASE_URL}/products`);
    const productsData: any = await productsRes.json();
    console.log('Products Status:', productsRes.status);
    console.log('Total Products Loaded:', productsData.products?.length);
    if (productsRes.status !== 200) throw new Error('Fetch products failed');
    const sampleProduct = productsData.products[0];
    console.log('Sample Product:', { title: sampleProduct.title, price: sampleProduct.price, sku: sampleProduct.sku });

    console.log('\n--- TEST 5: Validate Promo Coupon ---');
    const couponRes = await fetch(`${BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({ code: 'CHARULATA10', orderAmount: 3000 })
    });
    const couponData: any = await couponRes.json();
    console.log('Coupon Status:', couponRes.status);
    console.log('Coupon Validation Result:', couponData.data);
    if (couponRes.status !== 200) throw new Error('Coupon validation failed');

    console.log('\n--- TEST 5.5: Add Product to Cart ---');
    const addToCartRes = await fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        product: sampleProduct._id,
        quantity: 2,
        color: 'Yellow',
        size: 'M'
      })
    });
    const addToCartData: any = await addToCartRes.json();
    console.log('Add to Cart Status:', addToCartRes.status);
    console.log('Cart Items Count:', addToCartData.data?.cart?.items?.length);
    if (addToCartRes.status !== 200) throw new Error('Add to cart failed');

    console.log('\n--- TEST 6: Checkout Cash On Delivery (COD) Order ---');
    const checkoutRes = await fetch(`${BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        shippingAddress: {
          recipientName: 'Rahim Ahmed',
          recipientPhone: '01811223344',
          district: 'Dhaka',
          addressLine: 'House 45, Road 12, Dhanmondi'
        },
        couponCode: 'CHARULATA10'
      })
    });
    const checkoutData: any = await checkoutRes.json();
    console.log('Checkout Status:', checkoutRes.status);
    console.log('Checkout Data:', checkoutData);
    if (checkoutRes.status !== 201) throw new Error('COD Checkout failed');
    const createdOrderId = checkoutData.data?.order?.orderId;
    console.log(`Placed Order Success! ID: ${createdOrderId}`);

    console.log('\n--- TEST 7: Track Order (Anonymous Tracking) ---');
    const trackRes = await fetch(`${BASE_URL}/orders/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: createdOrderId, email: 'customer@gmail.com' })
    });
    const trackData: any = await trackRes.json();
    console.log('Track Status:', trackRes.status);
    console.log('Track Timeline:', trackData.data?.timeline);
    if (trackRes.status !== 200) throw new Error('Order tracking failed');

    console.log('\n--- TEST 8: Fetch Dashboard Analytics (Admin Exclusive) ---');
    const analyticsRes = await fetch(`${BASE_URL}/analytics/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const analyticsData: any = await analyticsRes.json();
    console.log('Analytics Status:', analyticsRes.status);
    console.log('Dashboard Analytics Keys:', Object.keys(analyticsData.data || {}));
    if (analyticsRes.status !== 200) throw new Error('Analytics retrieval failed');

    console.log('\n=====================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED!');
    console.log('=====================================');
  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILED:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
      console.log('[TEST] Server stopped.');
    }
    await mongoose.disconnect();
    console.log('[TEST] Database disconnected.');
  }
};

runTests();
