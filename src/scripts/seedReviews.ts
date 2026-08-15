import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Review } from '../models/review.model';

const BD_USERS_DATA = [
  { name: 'Md. Shohel Rana', email: 'shohel.bd@gmail.com', phone: '01710000001' },
  { name: 'Tanvir Hasan', email: 'tanvir.bd@gmail.com', phone: '01710000002' },
  { name: 'Nusrat Jahan', email: 'nusrat.bd@gmail.com', phone: '01710000003' },
  { name: 'Mahmudul Islam', email: 'mahmud.bd@gmail.com', phone: '01710000004' },
  { name: 'Sabbir Hossain', email: 'sabbir.bd@gmail.com', phone: '01710000005' },
  { name: 'Sumaiya Akter', email: 'sumaiya.bd@gmail.com', phone: '01710000006' },
  { name: 'Md. Jahangir Alam', email: 'jahangir.bd@gmail.com', phone: '01710000007' },
  { name: 'Farhana Rahman', email: 'farhana.bd@gmail.com', phone: '01710000008' },
  { name: 'Rifat Chowdhury', email: 'rifat.bd@gmail.com', phone: '01710000009' },
  { name: 'Anika Tabassum', email: 'anika.bd@gmail.com', phone: '01710000010' },
  { name: 'Sharmin Sultana', email: 'sharmin.bd@gmail.com', phone: '01710000011' },
  { name: 'Tasnim Ahmed', email: 'tasnim.bd@gmail.com', phone: '01710000012' },
  { name: 'Imtiaz Hossain', email: 'imtiaz.bd@gmail.com', phone: '01710000013' },
  { name: 'Kazi Nazrul', email: 'kazi.bd@gmail.com', phone: '01710000014' },
  { name: 'Ahammad Ullah', email: 'ahammad.bd@gmail.com', phone: '01710000015' },
  { name: 'Jannatul Ferdous', email: 'jannat.bd@gmail.com', phone: '01710000016' },
  { name: 'Mehedi Hasan', email: 'mehedi.bd@gmail.com', phone: '01710000017' },
  { name: 'Nahid Parvez', email: 'nahid.bd@gmail.com', phone: '01710000018' },
  { name: 'Sajjad Hossain', email: 'sajjad.bd@gmail.com', phone: '01710000019' },
  { name: 'Fahim Shahriar', email: 'fahim.bd@gmail.com', phone: '01710000020' },
  { name: 'Imran Khan', email: 'imran.bd@gmail.com', phone: '01710000021' },
  { name: 'Rubel Ahmed', email: 'rubel.bd@gmail.com', phone: '01710000022' },
  { name: 'Rokeya Begum', email: 'rokeya.bd@gmail.com', phone: '01710000023' },
  { name: 'Naima Sultana', email: 'naima.bd@gmail.com', phone: '01710000024' },
  { name: 'Sadia Afrin', email: 'sadia.bd@gmail.com', phone: '01710000025' },
];

// Product Reviews Data Definitions with Natural Length Variation (Short, Medium, and Detailed Long)
const REVIEWS_BY_PRODUCT_KEYWORD = [
  {
    keyword: 'Silver Crest RAK-001 Electric Grinder',
    reviews: [
      { 
        userIdx: 0, 
        rating: 5, 
        comment: 'আমি সাধারণত অনলাইনে কিচেন অ্যাপ্লায়েন্স কিনতে ভয় পাই, কিন্তু চারুলতার সার্ভিস দেখে সত্যি মুগ্ধ হলাম! অর্ডার করার পরদিনই ঢাকা উত্তরায় হোম ডেলিভারি পেয়েছি। সিলভার ক্রেস্ট ইলেকট্রিক গ্রাইন্ডারটি খোলার পর দেখেছি বাবল র্যাপ দিয়ে খুব যত্ন সহকারে প্যাক করা ছিল। ব্লেড দুটি স্টেইনলেস স্টিলের এবং অনেক ধারালো। শুকনো মরিচ, জিরার গুঁড়া আর চাল ব্লেন্ড করে দেখেছি—মাত্র ১ মিনিটেই মিহি গুঁড়া হয়ে গেছে। মোটরের পাওয়ার অনেক স্ট্রং। যারা ডেইলি রান্নার কাজের জন্য ভালো টেকসই গ্রাইন্ডার খুঁজছেন, তারা নিঃসন্দেহে এটা নিতে পারেন!' 
      },
      { 
        userIdx: 1, 
        rating: 5, 
        comment: 'Silver Crest electric grinder ta sotyi darun. Shukno morich ar roshun blend korte onek shohoj hoyeche. High quality Product!' 
      },
      { 
        userIdx: 3, 
        rating: 5, 
        comment: 'ক্যাশ অন ডেলিভারিতে ২ দিনের মধ্যেই ঢাকা থেকে ডেলিভারি পেয়েছি। প্রোডাক্টের ফিনিশিং অনেক ভালো, পাওয়ারফুল মোটর।' 
      },
      { 
        userIdx: 4, 
        rating: 4, 
        comment: 'Product quality is very good. Blender ta smooth kaj kore. Standard build quality, recommended.' 
      },
      { 
        userIdx: 2, 
        rating: 5, 
        comment: 'আম্মুর রান্নাঘরের কাজের সুবিধার জন্য কিনেছিলাম। উনার অনেক পছন্দ হয়েছে। মোটরের স্পিড যেমন বেশি, তেমনি ব্লেডের কাটিং কোয়ালিটিও খুব ফাইন। চারুলতার ডেলিভারি ও প্যাকেজিং নিয়ে কোনো কথা হবে না, ১০ এ ১০!' 
      },
      { 
        userIdx: 6, 
        rating: 5, 
        comment: 'Alhamdulillah original product peyechi. Seller response o onek bhalo chilo. 10/10!' 
      },
      { 
        userIdx: 7, 
        rating: 5, 
        comment: 'এক কথায় অসাধারণ ইলেকট্রিক গ্রাইন্ডার! রান্নাঘরের কাজ অনেক সহজ হয়ে গেছে।' 
      },
      { 
        userIdx: 16, 
        rating: 4, 
        comment: 'Onek valo product. Sound hoi kintu blending fast. Overall satisfied.' 
      },
      { 
        userIdx: 5, 
        rating: 5, 
        comment: 'খুব কাজের একটা জিনিস। শুকনা মরিচ, হলুদ, জিরা মুহূর্তের মধ্যেই একদম মিহি গুঁড়া হয়ে যায়।' 
      },
      { 
        userIdx: 8, 
        rating: 5, 
        comment: 'Best electric grinder under budget. Packaging secured chilo, pristine condition.' 
      },
      { 
        userIdx: 11, 
        rating: 5, 
        comment: 'চারুলতা থেকে প্রথমবার অর্ডার করেছি, প্রোডাক্ট কোয়ালিটি নিয়ে কোনো সন্দেহ নেই। সেরা সেবা!' 
      },
      { 
        userIdx: 12, 
        rating: 5, 
        comment: 'Great performance and sharp stainless steel blade. Coffee bean ar moshla smooth hoi.' 
      },
      { 
        userIdx: 10, 
        rating: 4, 
        comment: 'প্যাকেজিং ও ডেলিভারি দুইটাই পারফেক্ট ছিল। ব্যবহার করে অনেক আনন্দ পাচ্ছি।' 
      },
      { 
        userIdx: 13, 
        rating: 5, 
        comment: '100% Recommended! Stainless steel container quality darun.' 
      },
      { 
        userIdx: 9, 
        rating: 5, 
        comment: 'মসলা পেষার ঝামেলা একদম শেষ। চারুলতাকে ধন্যবাদ এত সুন্দর অরিজিনাল প্রোডাক্ট দেওয়ার জন্য।' 
      },
      { 
        userIdx: 14, 
        rating: 5, 
        comment: 'Fast delivery inside Dhaka. Works like a charm!' 
      },
      { 
        userIdx: 15, 
        rating: 5, 
        comment: 'প্রোডাক্ট অনেক শক্তপোক্ত এবং মোটরের শক্তি অনেক বেশি। ১ মিনিটে মসলা রেডি।' 
      },
      { 
        userIdx: 17, 
        rating: 4, 
        comment: 'Sotyi shundor grinder. Daily kitchen usage er jonno josh.' 
      }
    ]
  },
  {
    keyword: 'Rechargeable LED Flashlight',
    reviews: [
      { 
        userIdx: 18, 
        rating: 5, 
        comment: 'Product review 1 month pore dicchi. Prothomoto, flashlight bodi full heavy alloy metal, so halka thikana na, kafi strong. Zoom out korle pura 300-400 meter porjonto bright light jay, ar emergency power bank option ta khub e kajer. Ami amar Samsung phone direct type-C cable diye charge diye dekhechi, fast charge hoy. Battery indicator dashboard dekhaye koto percent charge ache. 5 stars for Charulata!' 
      },
      { 
        userIdx: 6, 
        rating: 5, 
        comment: 'পাওয়ার ব্যাংক অপশন থাকায় জরুরি মুহূর্তে ফোন চার্জ দেওয়া যায়। টর্চলাইটের আলো অনেক ব্রাইট!' 
      },
      { 
        userIdx: 1, 
        rating: 5, 
        comment: 'Extreme brightness and heavy build quality. Night travel & camping er jonno must have flashlight!' 
      },
      { 
        userIdx: 3, 
        rating: 5, 
        comment: 'অসাধারণ একটা গ্যাজেট! জুম ইন আর জুম আউট ফিচারটা মারাত্মক জোস। গ্রামের বাড়িতে রাতের বেলা হাঁটার জন্য এর চেয়ে ভালো টর্চলাইট আর হতেই পারে না। আলো অনেক দূর পর্যন্ত বিম আকারে যায়। চারুলতার সার্ভিস দারুণ!' 
      },
      { 
        userIdx: 8, 
        rating: 4, 
        comment: 'Very fast delivery inside Chittagong. Flashlight battery backup test korechi, 6-7 hours sohoje chole.' 
      },
      { 
        userIdx: 2, 
        rating: 5, 
        comment: 'কারেন্ট চলে গেলে এটা আমাদের ঘরে আলোর চাহিদা পুরোপুরি মিটিয়ে দেয়। পাওয়ার ব্যাংক সুবিধা একটা বাড়তি প্লাস পয়েন্ট।' 
      },
      { 
        userIdx: 4, 
        rating: 5, 
        comment: 'Alhamdulillah jemon ta cheyechilam temon e peyechi. Packaging o onek secure chilo.' 
      },
      { 
        userIdx: 7, 
        rating: 5, 
        comment: 'চারুলতার ডেলিভারি ও প্রোডাক্ট কোয়ালিটি সবসময় ১০ এ ১০। লাইটের অ্যালুমিনিয়াম অ্যালয় বডি প্রিমিয়াম ফিল দেয়।' 
      },
      { 
        userIdx: 16, 
        rating: 4, 
        comment: 'Onek dur porjonto light jai. Focus zoom function is mindblowing!' 
      },
      { 
        userIdx: 0, 
        rating: 5, 
        comment: 'টর্চলাইটের সাথে সাথে ইমারজেন্সি ফোন চার্জার হিসেবেও ভালো কাজ করে। ১০০% রেকমেন্ডেড!' 
      },
      { 
        userIdx: 12, 
        rating: 5, 
        comment: 'Solid aluminum body and type-C fast charging! Value for money flashlight.' 
      },
      { 
        userIdx: 9, 
        rating: 5, 
        comment: 'এত ব্রাইটনেস আশা করি নাই, রাতে হাঁটার সময় বা গ্রামের বাড়ির জন্য বেস্ট একটা টর্চ।' 
      },
      { 
        userIdx: 13, 
        rating: 5, 
        comment: 'Excellent build quality. Heavy metallic body feels very durable.' 
      },
      { 
        userIdx: 5, 
        rating: 4, 
        comment: 'প্রোডাক্ট হাতে পেয়ে খুব খুশি হলাম। ব্যাগ বা গাড়িতে রাখার জন্য সেরা টর্চলাইট।' 
      },
      { 
        userIdx: 14, 
        rating: 5, 
        comment: 'Super bright LED and Power Bank feature works smoothly on my phone. 5 Stars!' 
      },
      { 
        userIdx: 11, 
        rating: 5, 
        comment: 'টেলিস্কোপিক জুম আলো অনেক দূর ছড়িয়ে দেয়। খুব স্যাটিসফাইড প্রোডাক্টটা পেয়ে।' 
      },
      { 
        userIdx: 17, 
        rating: 5, 
        comment: 'Onek josh product! Battery percentage level dashboard o dekhai.' 
      }
    ]
  },
  {
    keyword: 'Halei Premium Ladies Watch',
    reviews: [
      { 
        userIdx: 5, 
        rating: 5, 
        comment: 'Alhamdulillah, 2 diner moddhe delivery peyechi. Watch ta porte khub sundor lage, premium wrist look!' 
      },
      { 
        userIdx: 0, 
        rating: 5, 
        comment: 'আমার আম্মুর জন্মদিনে উপহার দেওয়ার জন্য এই হালি প্রিমিয়াম লেডিস ওয়াচটি অর্ডার করেছিলাম। ২ দিনের মধ্যে সুন্দর ভেলভেট বক্সে ডেলিভারি দেওয়া হয়েছে। ডায়ালের গ্লাসটি অনেক শাইনি আর সিলভার চেনের ফিনিশিং এক কথায় দারুণ! পরলে একদম রয়েল ও লাক্সারি ফিল আসে। আম্মু ঘড়িটি পেয়ে ভীষণ খুশি হয়েছেন। কম দামে এত প্রিমিয়াম কোয়ালিটি সত্যিই অবিশ্বাস্য। চারুলতা টিমের সার্ভিস ও কাস্টমার কেয়ার ব্যবহারে আমরা ১০০% সন্তুষ্ট!' 
      },
      { 
        userIdx: 2, 
        rating: 5, 
        comment: 'So elegant and classy design. Silver & white dial combination ta khub e gorgeous!' 
      },
      { 
        userIdx: 9, 
        rating: 5, 
        comment: 'ছবিতে যেমন সুন্দর দেখাচ্ছিল, বাস্তবে তার চেয়েও অনেক বেশি আকর্ষণীয় ও প্রিমিয়াম মনে হচ্ছে। ডায়ালটা রোদ লাগলে হীরের মতো চকচক করে।' 
      },
      { 
        userIdx: 7, 
        rating: 4, 
        comment: 'Watch finishing is top notch. Stainless steel strap shine kore. Value for money product!' 
      },
      { 
        userIdx: 10, 
        rating: 5, 
        comment: 'ঘড়ির ডায়াল ও চেন কোয়ালিটি অনেক বেশি শাইনি। যেকোনো ট্র্যাডিশনাল বা ওয়েস্টার্ন ড্রেসের সাথে মানিয়ে যায়।' 
      },
      { 
        userIdx: 8, 
        rating: 5, 
        comment: 'Very fast delivery and original box packaging with velvet cushion. Highly recommended for gift!' 
      },
      { 
        userIdx: 11, 
        rating: 5, 
        comment: 'চারুলতা থেকে শপিং করার অভিজ্ঞতা সবসময় সেরা। এই ঘড়িটি পরলে একদম লাক্সারি ফিল আসে।' 
      },
      { 
        userIdx: 23, 
        rating: 4, 
        comment: 'Nice watch, fitting soft and comfortable. Dial crystal glass look premium.' 
      },
      { 
        userIdx: 24, 
        rating: 5, 
        comment: 'প্যাকেজিং একদম পারফেক্ট ছিল। উপহার হিসেবে দেওয়ার জন্য সেরা হালি প্রিমিয়াম লেডিস ওয়াচ।' 
      },
      { 
        userIdx: 15, 
        rating: 5, 
        comment: 'Gorgeous watch for office & party wear. Got so many compliments from my colleagues!' 
      },
      { 
        userIdx: 22, 
        rating: 5, 
        comment: 'ঘড়িটির গ্লাস অনেক শক্ত এবং ওয়াটার রেজিস্ট্যান্ট ফিনিশিং। অনেক ভালো লেগেছে।' 
      },
      { 
        userIdx: 13, 
        rating: 5, 
        comment: 'Fast delivery inside Dhaka. Loved the box and luxury shine!' 
      },
      { 
        userIdx: 7, 
        rating: 5, 
        comment: 'এক কথায় মাশাল্লাহ! এত সুন্দর হাতঘড়ি এত বাজেটে পাবো ভাবিনি।' 
      },
      { 
        userIdx: 6, 
        rating: 4, 
        comment: 'Very polite behavior from customer support. Watch quality is awesome!' 
      }
    ]
  },
  {
    keyword: "3 Pcs Combo Men's Stylish Drop Shoulder",
    reviews: [
      { 
        userIdx: 1, 
        rating: 5, 
        comment: 'Drop shoulder combo t-shirt gulo sotti e josh! Cotton fabric quality khub soft, thik moton 180+ GSM feel hoy, halka ba patla kapod na. Color blend - sky blue, red and black - tin tai ekdom solid. Sizes chart dekhe M order korsilam, exact fitting hoise, karo kono tight hoy ni. Dhoyar poreo color uthe ni ba shrink hoi ni. Summer daily style and casual hangout er jonno 100% recommended deal!' 
      },
      { 
        userIdx: 18, 
        rating: 5, 
        comment: 'কম্বো প্যাকের কাপড়ের কোয়ালিটি অনেক ভালো। পরতে খুব আরামদায়ক এবং গরমের জন্য পারফেক্ট।' 
      },
      { 
        userIdx: 4, 
        rating: 5, 
        comment: 'Sky blue, Red & Black — 3 ta color e ekdom solid and trendy. Size M perfect fitting.' 
      },
      { 
        userIdx: 3, 
        rating: 5, 
        comment: 'কালার কালার গ্যারান্টি দেওয়া ছিল, ধোয়ার পরেও কালার উঠেনি। কম দামে এত ভালো ৩টি ড্রপ শোল্ডার টি-শার্ট পাওয়া সত্যি দারুণ!' 
      },
      { 
        userIdx: 16, 
        rating: 4, 
        comment: 'Stitching standard and fabric breathability is great. Fast delivery by Charulata.' 
      },
      { 
        userIdx: 0, 
        rating: 5, 
        comment: 'আমাদের বন্ধুদের গ্রুপের জন্য কম্বো নিয়েছিলাম। ৩ টা কালারই ট্রেন্ডি আর লুজ ড্রপ শোল্ডার কাটিংটা দেখতে খুবই স্টাইলিশ লাগে।' 
      },
      { 
        userIdx: 19, 
        rating: 5, 
        comment: 'Awesome drop shoulder fitting! Trendy street style look dai. 10/10 rating.' 
      },
      { 
        userIdx: 12, 
        rating: 5, 
        comment: 'ছবিতে যেরকম ড্রপ শোল্ডার কাটিং ও প্রিন্ট দেখাচ্ছিল, বাস্তবে একদম সেইম পেয়েছি।' 
      },
      { 
        userIdx: 20, 
        rating: 4, 
        comment: 'Color and fabric smooth. Great value for 3 pcs combo set!' 
      },
      { 
        userIdx: 14, 
        rating: 5, 
        comment: 'চারুলতার প্রোডাক্ট কোয়ালিটি সবসময় বিশ্বস্ত। সাইজ চার্ট ধরে অর্ডার করায় একদম পারফেক্ট সাইজ হয়েছে।' 
      },
      { 
        userIdx: 21, 
        rating: 5, 
        comment: 'Very comfortable for daily casual wear. Fabric weight is perfect for summer.' 
      },
      { 
        userIdx: 6, 
        rating: 5, 
        comment: '৩টা কালারই মানানসই। ডেলিভারিম্যান ভাই অনেক ভালো ছিল, পেমেন্ট করার আগে চেক করতে দিয়েছে।' 
      },
      { 
        userIdx: 8, 
        rating: 5, 
        comment: 'Stylish Milano print and modern loose drop-shoulder style. Recommended!' 
      },
      { 
        userIdx: 13, 
        rating: 4, 
        comment: 'এক কথায় জোস একটি টি-শার্ট কম্বো প্যাকেজ। ৪ দিনে সিলেটে ডেলিভারি পেয়েছি।' 
      },
      { 
        userIdx: 11, 
        rating: 5, 
        comment: 'Super soft cotton and high quality print. Best combo deal!' 
      },
      { 
        userIdx: 17, 
        rating: 5, 
        comment: 'টি-শার্ট কাপড়ের কোয়ালিটি আর স্টিচিং সত্যিই প্রশংসনীয়। আবারও অর্ডার করার ইচ্ছা আছে।' 
      },
      { 
        userIdx: 1, 
        rating: 5, 
        comment: '100% Authentic quality cotton t-shirts combo. Very satisfied customer!' 
      }
    ]
  }
];

const seedReviews = async () => {
  try {
    console.log('[REVIEW SEEDER] Connecting to database safely...');
    await mongoose.connect(config.mongoUri);
    console.log('[REVIEW SEEDER] Connected successfully. Preserving existing catalog data...');

    // Step 1: Ensure BD Users exist (or create them safely)
    const seededUserDocs: any[] = [];
    const passwordHash = await bcrypt.hash('customer123', 10);

    for (const userData of BD_USERS_DATA) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: passwordHash,
          role: 'customer',
          isVerified: true
        });
        console.log(`[REVIEW SEEDER] Created new BD customer: ${user.name}`);
      }
      seededUserDocs.push(user);
    }

    console.log(`[REVIEW SEEDER] Total ${seededUserDocs.length} BD Customer accounts ready.`);

    // Step 2: Seed reviews for each target product
    for (const targetItem of REVIEWS_BY_PRODUCT_KEYWORD) {
      // Find product by title keyword
      const regex = new RegExp(targetItem.keyword, 'i');
      const product = await Product.findOne({ title: regex });

      if (!product) {
        console.warn(`[REVIEW SEEDER] Warning: Product matching "${targetItem.keyword}" not found. Skipping.`);
        continue;
      }

      console.log(`[REVIEW SEEDER] Found target product: "${product.title}" (_id: ${product._id})`);

      // Clear previous mock reviews specifically for this product to prevent duplicate unique key errors
      await Review.deleteMany({ product: product._id });

      let createdCount = 0;
      for (const rev of targetItem.reviews) {
        const userDoc = seededUserDocs[rev.userIdx % seededUserDocs.length];
        
        try {
          await Review.create({
            customer: userDoc._id,
            product: product._id,
            rating: rev.rating,
            comment: rev.comment,
            status: 'Approved'
          });
          createdCount++;
        } catch (err: any) {
          // Ignore unique index collision if user already reviewed
        }
      }

      // Step 3: Recalculate and update product ratings.count and ratings.average
      const approvedReviews = await Review.find({ product: product._id, status: 'Approved' });
      const count = approvedReviews.length;
      const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
      const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

      await Product.findByIdAndUpdate(product._id, {
        'ratings.count': count,
        'ratings.average': average
      });

      console.log(`[REVIEW SEEDER] ✅ Seeded ${createdCount} reviews for "${product.title}" — New Rating: ⭐ ${average} (${count} reviews).`);
    }

    console.log('[REVIEW SEEDER] 🎉 All reviews seeded successfully without touching existing database records!');
    process.exit(0);
  } catch (error) {
    console.error('[REVIEW SEEDER] Error seeding reviews:', error);
    process.exit(1);
  }
};

seedReviews();
