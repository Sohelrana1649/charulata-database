import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      recipientName: z.string().min(2, 'Recipient name is required'),
      recipientPhone: z.string().min(10, 'Recipient phone is required'),
      district: z.string().min(2, 'District is required'),
      addressLine: z.string().min(5, 'Detailed shipping address is required')
    }),
    deliveryNotes: z.string().optional(),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(['COD', 'bkash', 'nagad', 'rocket']).optional().default('COD'),
    paymentSenderNumber: z.string().optional(),
    transactionId: z.string().optional()
  }).refine((data) => {
    if (data.paymentMethod && data.paymentMethod !== 'COD') {
      return !!data.paymentSenderNumber && data.paymentSenderNumber.trim().length > 0;
    }
    return true;
  }, {
    message: 'Sender number is required for mobile payments',
    path: ['paymentSenderNumber']
  }).refine((data) => {
    if (data.paymentMethod && data.paymentMethod !== 'COD') {
      return !!data.transactionId && data.transactionId.trim().length > 0;
    }
    return true;
  }, {
    message: 'Transaction ID is required for mobile payments',
    path: ['transactionId']
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'Pending',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for delivery',
      'Delivered',
      'Cancelled'
    ]),
    deliveryNotes: z.string().optional()
  })
});

export const createGuestOrderSchema = z.object({
  body: z.object({
    guestInfo: z.object({
      name: z.string().min(2, 'Guest name is required'),
      phone: z.string().regex(/^(?:\+8801|8801|01)[3-9]\d{8}$/, 'Must be a valid Bangladeshi phone number'),
      email: z.string().email('Invalid email address').optional().or(z.literal(''))
    }).optional(),
    shippingAddress: z.object({
      recipientName: z.string().min(2, 'Recipient name is required'),
      recipientPhone: z.string().regex(/^(?:\+8801|8801|01)[3-9]\d{8}$/, 'Recipient phone must be a valid Bangladeshi number'),
      district: z.string().min(2, 'District is required'),
      addressLine: z.string().min(5, 'Detailed shipping address is required')
    }),
    deliveryNotes: z.string().optional(),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(['COD', 'bkash', 'nagad', 'rocket']).optional().default('COD'),
    paymentSenderNumber: z.string().optional(),
    transactionId: z.string().optional()
  })
});
