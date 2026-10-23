import crypto from 'crypto';

/**
 * Meta Conversions API (CAPI) Utility
 * ------------------------------------
 * Sends server-side events to Meta (Facebook) for better tracking accuracy,
 * especially after iOS 14+ privacy changes. Works alongside the browser pixel
 * for deduplication (via event_id).
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

const META_PIXEL_ID = process.env.META_PIXEL_ID || '';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events`;

/** SHA-256 hash helper (Meta requires hashed user data) */
const sha256 = (value: string): string => {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
};

export interface MetaUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;  // _fbp cookie
  fbc?: string;  // _fbc cookie
  externalId?: string;
}

export interface MetaEventOptions {
  eventName: string;
  eventId?: string;
  eventSourceUrl?: string;
  userData: MetaUserData;
  customData?: Record<string, any>;
  actionSource?: 'website' | 'app' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  testEventCode?: string;
}

/**
 * Format and hash user data according to Meta's requirements
 */
const formatUserData = (userData: MetaUserData) => {
  const formatted: Record<string, any> = {};

  if (userData.email) {
    formatted.em = [sha256(userData.email)];
  }
  if (userData.phone) {
    // Remove spaces, dashes and normalize
    const cleanPhone = userData.phone.replace(/[\s\-\(\)]/g, '');
    formatted.ph = [sha256(cleanPhone)];
  }
  if (userData.firstName) {
    formatted.fn = [sha256(userData.firstName)];
  }
  if (userData.lastName) {
    formatted.ln = [sha256(userData.lastName)];
  }
  if (userData.city) {
    formatted.ct = [sha256(userData.city)];
  }
  if (userData.country) {
    formatted.country = [sha256(userData.country)];
  }
  if (userData.clientIpAddress) {
    formatted.client_ip_address = userData.clientIpAddress;
  }
  if (userData.clientUserAgent) {
    formatted.client_user_agent = userData.clientUserAgent;
  }
  if (userData.fbp) {
    formatted.fbp = userData.fbp;
  }
  if (userData.fbc) {
    formatted.fbc = userData.fbc;
  }
  if (userData.externalId) {
    formatted.external_id = [sha256(userData.externalId)];
  }

  return formatted;
};

/**
 * Send event to Meta Conversions API
 */
export const sendMetaEvent = async (options: MetaEventOptions): Promise<void> => {
  const pixelId = process.env.META_PIXEL_ID || '';
  const accessToken = process.env.META_ACCESS_TOKEN || '';
  const defaultTestCode = process.env.META_TEST_EVENT_CODE || '';

  if (!pixelId || !accessToken) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[META CAPI] Skipped (no credentials): ${options.eventName}`, options.customData || '');
    }
    return;
  }

  const graphApiUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`;

  const eventData: Record<string, any> = {
    event_name: options.eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: options.actionSource || 'website',
    user_data: formatUserData(options.userData),
  };

  if (options.eventId) {
    eventData.event_id = options.eventId;
  }
  if (options.eventSourceUrl) {
    eventData.event_source_url = options.eventSourceUrl;
  }
  if (options.customData) {
    eventData.custom_data = options.customData;
  }

  const payload: Record<string, any> = {
    data: [eventData],
    access_token: accessToken,
  };

  const activeTestCode = options.testEventCode || defaultTestCode;
  if (activeTestCode) {
    payload.test_event_code = activeTestCode;
  }

  try {
    const response = await fetch(graphApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[META CAPI ERROR] ${response.status}: ${errorBody}`);
    } else {
      const result = await response.json();
      console.log(`[META CAPI] ✅ ${options.eventName} sent successfully (Event ID: ${options.eventId || 'none'}, TestCode: ${activeTestCode || 'none'})`, result);
    }
  } catch (error) {
    console.error(`[META CAPI ERROR] Failed to send ${options.eventName}:`, error);
  }
};

/**
 * Generate a unique event ID for deduplication between browser pixel and CAPI
 */
export const generateEventId = (): string => {
  return `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
};

// ─── Pre-built E-commerce Event Helpers ───

/** ViewContent event — call when user views a product page */
export const trackViewContent = async (viewData: {
  productId: string;
  name?: string;
  price?: number;
  currency?: string;
  category?: string;
  userData: MetaUserData;
  eventId?: string;
  sourceUrl?: string;
  testEventCode?: string;
}) => {
  await sendMetaEvent({
    eventName: 'ViewContent',
    eventId: viewData.eventId || generateEventId(),
    eventSourceUrl: viewData.sourceUrl,
    userData: viewData.userData,
    testEventCode: viewData.testEventCode,
    customData: {
      content_ids: [viewData.productId],
      content_name: viewData.name,
      content_type: 'product',
      content_category: viewData.category,
      value: viewData.price || 0,
      currency: viewData.currency || 'BDT',
    },
  });
};

/** AddToCart event — call when user adds product to cart */
export const trackAddToCart = async (cartData: {
  productId: string;
  name?: string;
  price?: number;
  quantity?: number;
  currency?: string;
  userData: MetaUserData;
  eventId?: string;
  sourceUrl?: string;
  testEventCode?: string;
}) => {
  await sendMetaEvent({
    eventName: 'AddToCart',
    eventId: cartData.eventId || generateEventId(),
    eventSourceUrl: cartData.sourceUrl,
    userData: cartData.userData,
    testEventCode: cartData.testEventCode,
    customData: {
      content_ids: [cartData.productId],
      content_name: cartData.name,
      content_type: 'product',
      value: (cartData.price || 0) * (cartData.quantity || 1),
      currency: cartData.currency || 'BDT',
      num_items: cartData.quantity || 1,
    },
  });
};

/** Purchase event — call after successful order creation */
export const trackPurchase = async (orderData: {
  orderId: string;
  totalAmount: number;
  currency?: string;
  items: Array<{ productId: string; name?: string; quantity: number; price: number }>;
  userData: MetaUserData;
  eventId?: string;
  sourceUrl?: string;
  testEventCode?: string;
}) => {
  await sendMetaEvent({
    eventName: 'Purchase',
    eventId: orderData.eventId || generateEventId(),
    eventSourceUrl: orderData.sourceUrl,
    userData: orderData.userData,
    testEventCode: orderData.testEventCode,
    customData: {
      currency: orderData.currency || 'BDT',
      value: orderData.totalAmount,
      order_id: orderData.orderId,
      content_type: 'product',
      num_items: orderData.items.length,
      content_ids: orderData.items.map(item => item.productId).filter(Boolean),
      contents: orderData.items.map(item => ({
        id: item.productId,
        quantity: item.quantity,
        item_price: item.price,
      })),
    },
  });
};

/** InitiateCheckout event — when user starts checkout */
export const trackInitiateCheckout = async (checkoutData: {
  totalAmount: number;
  currency?: string;
  numItems: number;
  contentIds: string[];
  userData: MetaUserData;
  eventId?: string;
  sourceUrl?: string;
  testEventCode?: string;
}) => {
  await sendMetaEvent({
    eventName: 'InitiateCheckout',
    eventId: checkoutData.eventId || generateEventId(),
    eventSourceUrl: checkoutData.sourceUrl,
    userData: checkoutData.userData,
    testEventCode: checkoutData.testEventCode,
    customData: {
      currency: checkoutData.currency || 'BDT',
      value: checkoutData.totalAmount,
      num_items: checkoutData.numItems,
      content_ids: checkoutData.contentIds,
      content_type: 'product',
    },
  });
};

/** Contact event — when user submits contact form */
export const trackContact = async (userData: MetaUserData, eventId?: string, testEventCode?: string) => {
  await sendMetaEvent({
    eventName: 'Contact',
    eventId: eventId || generateEventId(),
    userData,
    testEventCode,
  });
};

/** CompleteRegistration event — after successful sign up */
export const trackRegistration = async (userData: MetaUserData, eventId?: string, testEventCode?: string) => {
  await sendMetaEvent({
    eventName: 'CompleteRegistration',
    eventId: eventId || generateEventId(),
    userData,
    testEventCode,
    customData: {
      status: true,
    },
  });
};
