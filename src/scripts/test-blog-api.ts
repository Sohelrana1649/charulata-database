import app from '../app';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Blog } from '../models/blog.model';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { checkAndRevalidateScheduledBlogs } from '../jobs/scheduledBlogJob';
import { viewRateLimiter } from '../utils/viewLimiter';
import { config } from '../config';

const TEST_PORT = 5007;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

const runBlogTests = async () => {
  let server: any;
  const createdBlogIds: string[] = [];
  let testAdminUser: any;
  let testCustomerUser: any;
  let testProductId: string | undefined;

  try {
    console.log('[TEST] Starting Blog integration test server...');
    server = app.listen(TEST_PORT, () => {
      console.log(`[TEST] Blog test server listening on port ${TEST_PORT}`);
    });

    // Wait 2 seconds for server and DB connection
    await new Promise((resolve) => setTimeout(resolve, 2000));

    viewRateLimiter.reset();

    console.log('\n--- TEST 1: Setup Admin & Customer Test Users & Generate Tokens ---');
    testAdminUser = await User.findOne({ email: 'test_admin_blog@charulata.com' });
    if (!testAdminUser) {
      testAdminUser = await User.create({
        name: 'Test Admin User',
        email: 'test_admin_blog@charulata.com',
        phone: '01700000001',
        password: 'Password123!',
        role: 'admin',
        active: true,
        isVerified: true,
      });
    } else {
      testAdminUser.role = 'admin';
      testAdminUser.active = true;
      await testAdminUser.save();
    }

    testCustomerUser = await User.findOne({ email: 'test_customer_blog@charulata.com' });
    if (!testCustomerUser) {
      testCustomerUser = await User.create({
        name: 'Test Customer User',
        email: 'test_customer_blog@charulata.com',
        phone: '01700000002',
        password: 'Password123!',
        role: 'customer',
        active: true,
        isVerified: true,
      });
    }

    const adminToken = jwt.sign({ id: testAdminUser._id }, config.jwtSecret, { expiresIn: '1d' });
    const customerToken = jwt.sign({ id: testCustomerUser._id }, config.jwtSecret, { expiresIn: '1d' });
    console.log('Test tokens generated successfully.');

    // Fetch or create a test product for relatedProducts testing
    let sampleProduct = await Product.findOne().select('_id title').lean();
    if (!sampleProduct) {
      let sampleCategory = await Category.findOne().select('_id').lean();
      if (!sampleCategory) {
        sampleCategory = await Category.create({
          name: 'Test Saree Category',
          nameBn: 'টেস্ট শাড়ি ক্যাটাগরি',
          slug: 'test-saree-category',
        });
      }
      const createdProd = await Product.create({
        title: 'Crimson Red Handloom Silk Saree',
        slug: 'crimson-red-handloom-silk-saree',
        description: 'Pure handloom silk saree with authentic zari border.',
        price: 8500,
        salePrice: 7200,
        productImages: ['https://res.cloudinary.com/demo/image/upload/sample_saree.jpg'],
        sku: 'TEST-SAREE-001',
        stockQuantity: 15,
        category: sampleCategory._id,
      });
      sampleProduct = createdProd;
    }
    testProductId = sampleProduct._id.toString();
    console.log(`Found/Created Test Product ID: ${testProductId} (${(sampleProduct as any).title})`);

    console.log('\n--- TEST 2: Validation Failure on Publishing without SEO Meta ---');
    const invalidPublishRes = await fetch(`${BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Incomplete Post',
        content: 'This post is missing metaTitle and metaDescription',
        status: 'published',
      }),
    });
    const invalidPublishData: any = await invalidPublishRes.json();
    console.log('Publish validation status:', invalidPublishRes.status);
    if (invalidPublishRes.status !== 400) {
      throw new Error('Expected 400 validation error when publishing without SEO fields');
    }

    console.log('\n--- TEST 3: Validation Failure on Scheduled Blog without future scheduledAt date ---');
    const invalidScheduleRes = await fetch(`${BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Invalid Scheduled Post',
        content: 'Content here...',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() - 3600000).toISOString(),
      }),
    });
    if (invalidScheduleRes.status !== 400) {
      throw new Error('Expected 400 validation error when scheduled date is in the past');
    }

    console.log('\n--- TEST 4: Create Draft Blog & Preview Token Auto-Generation ---');
    const draftRes = await fetch(`${BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Modern Saree Styling Tips for Summer 2026',
        titleBn: 'গ্রীষ্ম ২০২৬ এর আধুনিক শাড়ি স্টাইলিং টিপস',
        content: '<p>Discover the top tips for wearing lightweight silk and cotton sarees this season.</p>',
        contentBn: '<p>এই মৌসুমে হালকা সিল্ক এবং সুতি শাড়ি পরার সেরা টিপস জানুন।</p>',
        category: 'Fashion',
        tags: ['saree', 'fashion', 'summer-style'],
        author: 'Charulata Editorial',
        status: 'draft',
      }),
    });
    const draftData: any = await draftRes.json();
    console.log('Draft creation status:', draftRes.status);
    console.log('Created blog slug:', draftData.data?.blog?.slug);
    console.log('Auto-generated previewToken:', draftData.data?.blog?.previewToken);
    if (draftRes.status !== 201 || !draftData.data?.blog?.previewToken) {
      throw new Error(`Draft creation failed to auto-generate previewToken: ${JSON.stringify(draftData)}`);
    }
    const draftBlog = draftData.data.blog;
    createdBlogIds.push(draftBlog._id);

    console.log('\n--- TEST 5: Fetch Draft Blog via Preview URL with Token ---');
    // Successful preview with valid token
    const validPreviewRes = await fetch(`${BASE_URL}/blogs/preview/${draftBlog.slug}?token=${draftBlog.previewToken}`);
    const validPreviewData: any = await validPreviewRes.json();
    console.log('Valid preview fetch status (expected 200):', validPreviewRes.status);
    console.log('Previewed blog title:', validPreviewData.data?.blog?.title);
    if (validPreviewRes.status !== 200 || validPreviewData.data?.blog?._id !== draftBlog._id) {
      throw new Error('Failed to fetch draft blog with valid preview token');
    }

    // Attempt preview with invalid token -> 403
    const invalidTokenPreviewRes = await fetch(`${BASE_URL}/blogs/preview/${draftBlog.slug}?token=wrongtoken12345678`);
    console.log('Invalid token preview status (expected 403):', invalidTokenPreviewRes.status);
    if (invalidTokenPreviewRes.status !== 403) {
      throw new Error('Invalid preview token was not rejected with 403 Forbidden');
    }

    // Attempt preview without token -> 401
    const noTokenPreviewRes = await fetch(`${BASE_URL}/blogs/preview/${draftBlog.slug}`);
    console.log('No token preview status (expected 401):', noTokenPreviewRes.status);
    if (noTokenPreviewRes.status !== 401) {
      throw new Error('Missing preview token was not rejected with 401 Unauthorized');
    }

    console.log('\n--- TEST 6: Regenerate Preview Token & Invalidate Old Link ---');
    const regenRes = await fetch(`${BASE_URL}/blogs/${draftBlog._id}/regenerate-preview-token`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const regenData: any = await regenRes.json();
    const newPreviewToken = regenData.data?.blog?.previewToken;
    console.log('Regenerate token status:', regenRes.status);
    console.log('New previewToken:', newPreviewToken);
    if (regenRes.status !== 200 || !newPreviewToken || newPreviewToken === draftBlog.previewToken) {
      throw new Error('Failed to regenerate new preview token');
    }

    // Old token should now be rejected (403)
    const oldTokenCheckRes = await fetch(`${BASE_URL}/blogs/preview/${draftBlog.slug}?token=${draftBlog.previewToken}`);
    console.log('Old token status after regeneration (expected 403):', oldTokenCheckRes.status);
    if (oldTokenCheckRes.status !== 403) {
      throw new Error('Old preview token was not invalidated after regeneration');
    }

    // New token should now succeed (200)
    const newTokenCheckRes = await fetch(`${BASE_URL}/blogs/preview/${draftBlog.slug}?token=${newPreviewToken}`);
    console.log('New token status after regeneration (expected 200):', newTokenCheckRes.status);
    if (newTokenCheckRes.status !== 200) {
      throw new Error('New preview token failed to fetch draft blog');
    }

    console.log('\n--- TEST 7: Create Published Blog with "Shop the Look", isFeatured=true & Revalidation Trigger ---');
    const publishedBlog1Res = await fetch(`${BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Traditional Bangladeshi Fabrics and Their Heritage',
        titleBn: 'ঐতিহ্যবাহী বাংলাদেশি কাপড় এবং তাদের ঐতিহ্য',
        excerpt: 'An in-depth look at Jamdani, Khadi, and Muslin heritage in modern times.',
        content: '<p>Jamdani weaving is a centuries-old Bengali craft celebrated globally.</p>',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        images: [
          { url: 'https://res.cloudinary.com/demo/image/upload/jamdani_detail1.jpg', caption: 'Loom Work', order: 0 },
          { url: 'https://res.cloudinary.com/demo/image/upload/jamdani_detail2.jpg', caption: 'Artisan Craft', order: 1 },
        ],
        relatedProducts: [testProductId],
        focusKeyword: 'Jamdani Heritage & Weaving',
        isFeatured: true,
        category: 'Heritage',
        tags: ['heritage', 'jamdani', 'lifestyle'],
        metaTitle: 'Bangladeshi Fabrics Heritage Guide | Charulata',
        metaDescription: 'Explore the royal history of Jamdani and traditional Bangladeshi textiles.',
        status: 'published',
      }),
    });
    const publishedBlog1Data: any = await publishedBlog1Res.json();
    console.log('Published Blog 1 status:', publishedBlog1Res.status);
    if (publishedBlog1Res.status !== 201 || !publishedBlog1Data.data?.blog?.isFeatured) {
      throw new Error(`Failed to create featured blog: ${JSON.stringify(publishedBlog1Data)}`);
    }
    const publishedBlog1 = publishedBlog1Data.data.blog;
    createdBlogIds.push(publishedBlog1._id);

    console.log('\n--- TEST 8: Verify Atomic Unset of Previous Featured Blog ---');
    const publishedBlog2Res = await fetch(`${BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Preserving Jamdani Art in Everyday Fashion',
        excerpt: 'How modern designers are incorporating Jamdani motifs in ready-to-wear.',
        content: '<p>Everyday elegance with authentic handcrafted Jamdani patterns.</p>',
        coverImage: 'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
        category: 'Heritage',
        tags: ['heritage', 'art', 'trends'],
        metaTitle: 'Preserving Jamdani Art | Charulata Lifestyle',
        metaDescription: 'Discover everyday wearable Jamdani designs crafted by rural artisans.',
        isFeatured: true,
        status: 'published',
      }),
    });
    const publishedBlog2Data: any = await publishedBlog2Res.json();
    const publishedBlog2 = publishedBlog2Data.data.blog;
    createdBlogIds.push(publishedBlog2._id);

    const blog1Refresh = await Blog.findById(publishedBlog1._id).lean();
    console.log('Blog 1 isFeatured after Blog 2 creation (expected false):', blog1Refresh?.isFeatured);
    console.log('Blog 2 isFeatured (expected true):', publishedBlog2.isFeatured);
    if (blog1Refresh?.isFeatured !== false || publishedBlog2.isFeatured !== true) {
      throw new Error('Atomic exclusivity for isFeatured failed');
    }

    console.log('\n--- TEST 9: Fetch GET /api/blogs/featured and Confirm Result ---');
    const featuredRes = await fetch(`${BASE_URL}/blogs/featured`);
    const featuredData: any = await featuredRes.json();
    console.log('Featured endpoint status:', featuredRes.status);
    if (featuredRes.status !== 200 || featuredData.data?.blog?._id !== publishedBlog2._id) {
      throw new Error('GET /api/blogs/featured did not return the latest featured blog');
    }

    console.log('\n--- TEST 10: Future Scheduled Blog Visibility Test ---');
    const futureDate = new Date(Date.now() + 86400000 * 7); // 7 days in future
    const scheduledBlogRes = await fetch(`${BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Upcoming Autumn Collection Sneak Peek 2026',
        content: '<p>Secret preview of autumn festival wear.</p>',
        status: 'scheduled',
        scheduledAt: futureDate.toISOString(),
      }),
    });
    const scheduledBlogData: any = await scheduledBlogRes.json();
    const scheduledBlog = scheduledBlogData.data.blog;
    createdBlogIds.push(scheduledBlog._id);

    const publicListRes = await fetch(`${BASE_URL}/blogs?search=Autumn`);
    const publicListData: any = await publicListRes.json();
    if (publicListData.data?.blogs?.length > 0) {
      throw new Error('Future scheduled blog was exposed in public endpoint!');
    }

    console.log('\n--- TEST 11: Scheduled Blog Background Auto-Publishing & ISR Job ---');
    const pastScheduledBlog = await Blog.create({
      title: 'Flash Festive Release 2026',
      slug: 'flash-festive-release-2026',
      content: '<p>Now available live.</p>',
      metaTitle: 'Flash Festive Release 2026 | Charulata',
      metaDescription: 'Discover newly launched festive apparel.',
      status: 'scheduled',
      scheduledAt: new Date(Date.now() - 5000),
    });
    createdBlogIds.push(pastScheduledBlog._id.toString());

    const revalidatedSlugs = await checkAndRevalidateScheduledBlogs();
    const updatedPastBlog = await Blog.findById(pastScheduledBlog._id).lean();
    if (updatedPastBlog?.status !== 'published' || !revalidatedSlugs.includes('flash-festive-release-2026')) {
      throw new Error('Scheduled blog background job failed to auto-publish and revalidate');
    }

    console.log('\n--- TEST 12: Rate-Limited View Increment (Single IP vs Multiple IPs) ---');
    const ip1 = '103.20.10.1';
    const firstHitRes = await fetch(`${BASE_URL}/blogs/${publishedBlog1.slug}`, {
      headers: { 'x-forwarded-for': ip1 },
    });
    const firstHitData: any = await firstHitRes.json();
    const viewsAfterFirstHit = firstHitData.data?.blog?.views;
    console.log(`Views after 1st visit from IP ${ip1}:`, viewsAfterFirstHit);

    const secondHitRes = await fetch(`${BASE_URL}/blogs/${publishedBlog1.slug}`, {
      headers: { 'x-forwarded-for': ip1 },
    });
    const secondHitData: any = await secondHitRes.json();
    const viewsAfterSecondHit = secondHitData.data?.blog?.views;
    console.log(`Views after 2nd visit from SAME IP ${ip1} (expected ${viewsAfterFirstHit}):`, viewsAfterSecondHit);
    if (secondHitRes.status !== 200 || viewsAfterSecondHit !== viewsAfterFirstHit) {
      throw new Error(`View rate limiting failed! Views inflated from ${viewsAfterFirstHit} to ${viewsAfterSecondHit}`);
    }

    const ip2 = '103.20.10.2';
    const thirdHitRes = await fetch(`${BASE_URL}/blogs/${publishedBlog1.slug}`, {
      headers: { 'x-forwarded-for': ip2 },
    });
    const thirdHitData: any = await thirdHitRes.json();
    const viewsAfterThirdHit = thirdHitData.data?.blog?.views;
    console.log(`Views after 3rd visit from DIFFERENT IP ${ip2} (expected ${viewsAfterFirstHit + 1}):`, viewsAfterThirdHit);
    if (thirdHitRes.status !== 200 || viewsAfterThirdHit !== viewsAfterFirstHit + 1) {
      throw new Error(`Distinct visitor view increment failed! Expected ${viewsAfterFirstHit + 1}, got ${viewsAfterThirdHit}`);
    }

    console.log('\n--- TEST 13: Gallery Images Reordering ---');
    const imageIds = publishedBlog1.images.map((img: any) => img._id);
    const reversedIds = [...imageIds].reverse();

    const reorderRes = await fetch(`${BASE_URL}/blogs/${publishedBlog1._id}/images/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ imageIds: reversedIds }),
    });
    if (reorderRes.status !== 200) {
      throw new Error('Gallery image reordering failed');
    }

    console.log('\n--- TEST 14: Delete Single Image from Gallery ---');
    const imageToDeleteId = publishedBlog1.images[0]._id;
    const deleteImageRes = await fetch(`${BASE_URL}/blogs/${publishedBlog1._id}/images/${imageToDeleteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (deleteImageRes.status !== 200) {
      throw new Error('Failed to delete image from gallery');
    }

    console.log('\n--- TEST 15: Admin All Blogs & Role Protection ---');
    const adminBlogsRes = await fetch(`${BASE_URL}/blogs/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (adminBlogsRes.status !== 200) {
      throw new Error('Admin failed to fetch all blogs');
    }

    const customerForbiddenRes = await fetch(`${BASE_URL}/blogs/admin/all`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (customerForbiddenRes.status !== 403) {
      throw new Error('Customer was not denied access to admin endpoint');
    }

    console.log('\n--- TEST 16: Delete Blog ---');
    const deleteRes = await fetch(`${BASE_URL}/blogs/${draftBlog._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteData: any = await deleteRes.json();
    if (deleteRes.status !== 200 || !deleteData.success) {
      throw new Error('Failed to delete blog');
    }
    const idx = createdBlogIds.indexOf(draftBlog._id);
    if (idx !== -1) createdBlogIds.splice(idx, 1);

    console.log('\n=====================================');
    console.log('🎉 ALL BLOG MODULE (PREVIEW TOKEN + VIEW RATE-LIMITING + ISR + SHOP THE LOOK + SCHEDULED) TESTS PASSED PERFECTLY!');
    console.log('=====================================');
  } catch (error) {
    console.error('\n❌ BLOG MODULE INTEGRATION TEST FAILED:', error);
    process.exit(1);
  } finally {
    if (createdBlogIds.length > 0) {
      try {
        await Blog.deleteMany({ _id: { $in: createdBlogIds } });
        console.log(`[TEST CLEANUP] Cleaned up ${createdBlogIds.length} test blogs.`);
      } catch (cleanupErr) {
        console.error('[TEST CLEANUP] Error cleaning up test blogs:', cleanupErr);
      }
    }

    try {
      await User.deleteMany({ email: { $in: ['test_admin_blog@charulata.com', 'test_customer_blog@charulata.com'] } });
      console.log('[TEST CLEANUP] Cleaned up test users.');
    } catch (userCleanupErr) {
      console.error('[TEST CLEANUP] Error cleaning up test users:', userCleanupErr);
    }

    if (server) {
      server.close();
      console.log('[TEST] Server closed.');
    }
    await mongoose.disconnect();
    console.log('[TEST] Database disconnected.');
  }
};

runBlogTests();
