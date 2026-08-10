import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  navbarLogo: string;
  footerLogo: string;
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  facebookUrl: string;
  advancePaymentAmount: number;
  requireAdvancePayment: boolean;
  paymentPhoneNumber: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  enableBkash: boolean;
  enableNagad: boolean;
  enableRocket: boolean;
  enableCOD: boolean;
  paymentInstructions: string;
  paymentMethodsInfo: string;
  prepaymentNoticeTitle: string;
  prepaymentRule1: string;
  prepaymentRule2: string;
  prepaymentRule3: string;
  prepaymentHelpText: string;
  insideDhakaCharge: number;
  outsideDhakaCharge: number;
  freeShippingMinAmount: number;
}

const settingsSchema = new Schema<ISettings>(
  {
    navbarLogo: {
      type: String,
      default: '/images/newlogo.png',
    },
    footerLogo: {
      type: String,
      default: '/images/newlogo.png',
    },
    storeName: {
      type: String,
      default: 'Charulata Lifestyle',
    },
    storePhone: {
      type: String,
      default: '+880 1620-556299',
    },
    storeEmail: {
      type: String,
      default: 'support@charulatalifestyle.com',
    },
    storeAddress: {
      type: String,
      default: 'Banani, Dhaka - 1213, Bangladesh',
    },
    facebookUrl: {
      type: String,
      default: 'https://facebook.com/charulatalifestyle',
    },
    advancePaymentAmount: {
      type: Number,
      default: 200,
    },
    requireAdvancePayment: {
      type: Boolean,
      default: true,
    },
    paymentPhoneNumber: {
      type: String,
      default: '01620-556299',
    },
    bkashNumber: {
      type: String,
      default: '01620-556299',
    },
    nagadNumber: {
      type: String,
      default: '01620-556299',
    },
    rocketNumber: {
      type: String,
      default: '01620-556299',
    },
    enableBkash: {
      type: Boolean,
      default: true,
    },
    enableNagad: {
      type: Boolean,
      default: true,
    },
    enableRocket: {
      type: Boolean,
      default: true,
    },
    enableCOD: {
      type: Boolean,
      default: true,
    },
    paymentInstructions: {
      type: String,
      default: 'বিকাশ, নগদ বা রকেটের মাধ্যমে নির্ধারিত অগ্রিম টাকা সেন্ড মানি করে ট্রানজেকশন আইডি প্রদান করুন।',
    },
    paymentMethodsInfo: {
      type: String,
      default: '(বিকাশ/নগদ/রকেট পার্সোনাল)',
    },
    prepaymentNoticeTitle: {
      type: String,
      default: 'অর্ডার করার নিয়ম',
    },
    prepaymentRule1: {
      type: String,
      default:
        'প্রতিটি পণ্য অর্ডার করতে অগ্রিম হিসেবে আমাদের ২০০ টাকা সেন্ড মানি করতে হবে। এই টাকাটা টোটাল বিল থেকে বাদ দেওয়া হবে।',
    },
    prepaymentRule2: {
      type: String,
      default:
        'দ্রুত ডেলিভারি নিশ্চিত করার জন্য সঠিক ভাবে আপনার ঠিকানা লিখুন (থানা এবং জেলা উল্লেখ করুন)।',
    },
    prepaymentRule3: {
      type: String,
      default:
        'টাকা পাঠানোর পর পেমেন্ট নম্বর এবং Transaction ID (TrxID) নিচের ফর্মে লিখুন।',
    },
    prepaymentHelpText: {
      type: String,
      default: 'যেকোনো সমস্যার জন্য আমাদের 01620-556299 নম্বরে ফোন করুন।',
    },
    insideDhakaCharge: {
      type: Number,
      default: 70,
    },
    outsideDhakaCharge: {
      type: Number,
      default: 130,
    },
    freeShippingMinAmount: {
      type: Number,
      default: 3000,
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
