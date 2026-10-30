export interface BDThana {
  nameEn: string;
  nameBn: string;
}

export interface BDDistrict {
  district: string; // e.g. "Dhaka(ঢাকা)"
  nameEn: string;   // e.g. "Dhaka"
  nameBn: string;   // e.g. "ঢাকা"
  division: string; // e.g. "Dhaka"
  divisionEn?: string;
  divisionBn?: string;
  isDhaka: boolean;
  thanas: BDThana[];
}

export interface BDDivision {
  division: string;
  divisionBn: string;
  districts: BDDistrict[];
}

export const BD_LOCATIONS_BY_DIVISION: BDDivision[] = [
  // ─── 1. DHAKA DIVISION ───
  {
    division: 'Dhaka',
    divisionBn: 'ঢাকা',
    districts: [
      {
        district: 'Dhaka(ঢাকা)',
        nameEn: 'Dhaka',
        nameBn: 'ঢাকা',
        division: 'Dhaka',
        isDhaka: true,
        thanas: [
          // Metro Thanas
          { nameEn: 'Adabor', nameBn: 'আদাবর' },
          { nameEn: 'Airport', nameBn: 'বিমানবন্দর' },
          { nameEn: 'Badda', nameBn: 'বাড্ডা' },
          { nameEn: 'Banani', nameBn: 'বনানী' },
          { nameEn: 'Bangshal', nameBn: 'বংশাল' },
          { nameEn: 'Bhashantek', nameBn: 'ভাষানটেক' },
          { nameEn: 'Bhatara', nameBn: 'ভাটারা' },
          { nameEn: 'Cantonment', nameBn: 'ক্যান্টনমেন্ট' },
          { nameEn: 'Chawkbazar', nameBn: 'চকবাজার' },
          { nameEn: 'Dakshinkhan', nameBn: 'দক্ষিণখান' },
          { nameEn: 'Darus Salam', nameBn: 'দারুস সালাম' },
          { nameEn: 'Demra', nameBn: 'ডেমরা' },
          { nameEn: 'Dhanmondi', nameBn: 'ধানমন্ডি' },
          { nameEn: 'Gendaria', nameBn: 'গেন্ডারিয়া' },
          { nameEn: 'Gulshan', nameBn: 'গুলশান' },
          { nameEn: 'Hatirjheel', nameBn: 'হাতিরঝিল' },
          { nameEn: 'Hazaribagh', nameBn: 'হাজারীবাগ' },
          { nameEn: 'Jatrabari', nameBn: 'যাত্রাবাড়ী' },
          { nameEn: 'Kadamtali', nameBn: 'কদমতলী' },
          { nameEn: 'Kafrul', nameBn: 'কাফরুল' },
          { nameEn: 'Kalabagan', nameBn: 'কলাবাগান' },
          { nameEn: 'Kamrangirchar', nameBn: 'কামরাঙ্গীরচর' },
          { nameEn: 'Khilgaon', nameBn: 'খিলগাঁও' },
          { nameEn: 'Khilkhet', nameBn: 'খিলক্ষেত' },
          { nameEn: 'Kotwali', nameBn: 'কোতোয়ালী' },
          { nameEn: 'Lalbagh', nameBn: 'লালবাগ' },
          { nameEn: 'Mirpur', nameBn: 'মিরপুর' },
          { nameEn: 'Mohammadpur', nameBn: 'মোহাম্মদপুর' },
          { nameEn: 'Motijheel', nameBn: 'মতিঝিল' },
          { nameEn: 'Mugda', nameBn: 'মুগদা' },
          { nameEn: 'New Market', nameBn: 'নিউ মার্কেট' },
          { nameEn: 'Pallabi', nameBn: 'পল্লবী' },
          { nameEn: 'Paltan', nameBn: 'পল্টন' },
          { nameEn: 'Ramna', nameBn: 'রমনা' },
          { nameEn: 'Rampura', nameBn: 'রামপুরা' },
          { nameEn: 'Rupnagar', nameBn: 'রূপনগর' },
          { nameEn: 'Sabujbagh', nameBn: 'সবুজবাগ' },
          { nameEn: 'Shah Ali', nameBn: 'শাহ আলী' },
          { nameEn: 'Shahbagh', nameBn: 'শাহবাগ' },
          { nameEn: 'Sher-e-Bangla Nagar', nameBn: 'শেরেবাংলা নগর' },
          { nameEn: 'Shyampur', nameBn: 'শ্যামপুর' },
          { nameEn: 'Sutrapur', nameBn: 'সূত্রাপুর' },
          { nameEn: 'Tejgaon', nameBn: 'তেজগাঁও' },
          { nameEn: 'Tejgaon Industrial Area', nameBn: 'তেজগাঁও শিল্পাঞ্চল' },
          { nameEn: 'Turag', nameBn: 'তুরাগ' },
          { nameEn: 'Uttara East', nameBn: 'উত্তরা পূর্ব' },
          { nameEn: 'Uttara West', nameBn: 'উত্তরা পশ্চিম' },
          { nameEn: 'Uttarkhan', nameBn: 'উত্তরখান' },
          { nameEn: 'Wari', nameBn: 'ওয়ারী' },
          // Upazilas
          { nameEn: 'Dhamrai', nameBn: 'ধামরাই' },
          { nameEn: 'Dohar', nameBn: 'দোহার' },
          { nameEn: 'Keraniganj', nameBn: 'কেরানীগঞ্জ' },
          { nameEn: 'Nawabganj', nameBn: 'নবাবগঞ্জ' },
          { nameEn: 'Savar', nameBn: 'সাভার' }
        ]
      },
      {
        district: 'Gazipur(গাজীপুর)',
        nameEn: 'Gazipur',
        nameBn: 'গাজীপুর',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Gazipur Sadar', nameBn: 'গাজীপুর সদর' },
          { nameEn: 'Joydebpur', nameBn: 'জয়দেবপুর' },
          { nameEn: 'Tongi', nameBn: 'টঙ্গী' },
          { nameEn: 'Kaliakair', nameBn: 'কালিয়াকৈর' },
          { nameEn: 'Kaliganj', nameBn: 'কালীগঞ্জ' },
          { nameEn: 'Kapasia', nameBn: 'কাপাসিয়া' },
          { nameEn: 'Sreepur', nameBn: 'শ্রীপুর' }
        ]
      },
      {
        district: 'Narayanganj(নারায়ণগঞ্জ)',
        nameEn: 'Narayanganj',
        nameBn: 'নারায়ণগঞ্জ',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Narayanganj Sadar', nameBn: 'নারায়ণগঞ্জ সদর' },
          { nameEn: 'Bandar', nameBn: 'বন্দর' },
          { nameEn: 'Fatullah', nameBn: 'ফতুল্লা' },
          { nameEn: 'Siddhirganj', nameBn: 'সিদ্ধিরগঞ্জ' },
          { nameEn: 'Araihazar', nameBn: 'আড়াইহাজার' },
          { nameEn: 'Sonargaon', nameBn: 'সোনারগাঁও' },
          { nameEn: 'Rupganj', nameBn: 'রূপগঞ্জ' }
        ]
      },
      {
        district: 'Tangail(টাঙ্গাইল)',
        nameEn: 'Tangail',
        nameBn: 'টাঙ্গাইল',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Tangail Sadar', nameBn: 'টাঙ্গাইল সদর' },
          { nameEn: 'Basail', nameBn: 'বাসাইল' },
          { nameEn: 'Bhuapur', nameBn: 'ভুয়াপুর' },
          { nameEn: 'Delduar', nameBn: 'দেলদুয়ার' },
          { nameEn: 'Dhanbari', nameBn: 'ধনবাড়ী' },
          { nameEn: 'Ghatail', nameBn: 'ঘাটাইল' },
          { nameEn: 'Gopalpur', nameBn: 'গোপালপুর' },
          { nameEn: 'Kalihati', nameBn: 'কালিহাতী' },
          { nameEn: 'Madhupur', nameBn: 'মধুপুর' },
          { nameEn: 'Mirzapur', nameBn: 'মির্জাপুর' },
          { nameEn: 'Nagarpur', nameBn: 'নাগরপুর' },
          { nameEn: 'Sakhipur', nameBn: 'সখিপুর' }
        ]
      },
      {
        district: 'Kishoreganj(কিশোরগঞ্জ)',
        nameEn: 'Kishoreganj',
        nameBn: 'কিশোরগঞ্জ',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Kishoreganj Sadar', nameBn: 'কিশোরগঞ্জ সদর' },
          { nameEn: 'Austagram', nameBn: 'অষ্টগ্রাম' },
          { nameEn: 'Bajitpur', nameBn: 'বাজিতপুর' },
          { nameEn: 'Bhairab', nameBn: 'ভৈরব' },
          { nameEn: 'Hossainpur', nameBn: 'হোসেনপুর' },
          { nameEn: 'Itna', nameBn: 'ইটনা' },
          { nameEn: 'Karimganj', nameBn: 'করিমগঞ্জ' },
          { nameEn: 'Katiadi', nameBn: 'কটিয়াদী' },
          { nameEn: 'Kuliarchar', nameBn: 'কুলিয়ারচর' },
          { nameEn: 'Mithamain', nameBn: 'মিঠামইন' },
          { nameEn: 'Nikli', nameBn: 'নিকলী' },
          { nameEn: 'Pakundia', nameBn: 'পাকুন্দিয়া' },
          { nameEn: 'Tarail', nameBn: 'তাড়াইল' }
        ]
      },
      {
        district: 'Manikganj(মানিকগঞ্জ)',
        nameEn: 'Manikganj',
        nameBn: 'মানিকগঞ্জ',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Manikganj Sadar', nameBn: 'মানিকগঞ্জ সদর' },
          { nameEn: 'Daulatpur', nameBn: 'দৌলতপুর' },
          { nameEn: 'Ghior', nameBn: 'ঘিওর' },
          { nameEn: 'Harirampur', nameBn: 'হরিরামপুর' },
          { nameEn: 'Saturia', nameBn: 'সাটুরিয়া' },
          { nameEn: 'Shivalaya', nameBn: 'শিবালয়' },
          { nameEn: 'Singair', nameBn: 'সিংগাইর' }
        ]
      },
      {
        district: 'Munshiganj(মুন্সিগঞ্জ)',
        nameEn: 'Munshiganj',
        nameBn: 'মুন্সিগঞ্জ',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Munshiganj Sadar', nameBn: 'মুন্সিগঞ্জ সদর' },
          { nameEn: 'Gazaria', nameBn: 'গজারিয়া' },
          { nameEn: 'Lohajang', nameBn: 'লৌহজং' },
          { nameEn: 'Sirajdikhan', nameBn: 'সিরাজদিখান' },
          { nameEn: 'Sreenagar', nameBn: 'শ্রীনগর' },
          { nameEn: 'Tongibari', nameBn: 'টংগিবাড়ী' }
        ]
      },
      {
        district: 'Narsingdi(নরসিংদী)',
        nameEn: 'Narsingdi',
        nameBn: 'নরসিংদী',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Narsingdi Sadar', nameBn: 'নরসিংদী সদর' },
          { nameEn: 'Belabo', nameBn: 'বেলাবো' },
          { nameEn: 'Monohardi', nameBn: 'মনোহরদী' },
          { nameEn: 'Palash', nameBn: 'পলাশ' },
          { nameEn: 'Raipura', nameBn: 'রায়পুরা' },
          { nameEn: 'Shibpur', nameBn: 'শিবপুর' }
        ]
      },
      {
        district: 'Faridpur(ফরিদপুর)',
        nameEn: 'Faridpur',
        nameBn: 'ফরিদপুর',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Faridpur Sadar', nameBn: 'ফরিদপুর সদর' },
          { nameEn: 'Alfadanga', nameBn: 'আলফাডাঙ্গা' },
          { nameEn: 'Bhanga', nameBn: 'ভাঙ্গা' },
          { nameEn: 'Boalmari', nameBn: 'বোয়ালমারী' },
          { nameEn: 'Charbhadrasan', nameBn: 'চরভদ্রাসন' },
          { nameEn: 'Madhukhali', nameBn: 'মধুখালী' },
          { nameEn: 'Nagarkanda', nameBn: 'নগরকান্দা' },
          { nameEn: 'Sadarpur', nameBn: 'সদরপুর' },
          { nameEn: 'Saltha', nameBn: 'সালথা' }
        ]
      },
      {
        district: 'Gopalganj(গোপালগঞ্জ)',
        nameEn: 'Gopalganj',
        nameBn: 'গোপালগঞ্জ',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Gopalganj Sadar', nameBn: 'গোপালগঞ্জ সদর' },
          { nameEn: 'Kashiani', nameBn: 'কাশিয়ানী' },
          { nameEn: 'Kotalipara', nameBn: 'কোটালীপাড়া' },
          { nameEn: 'Muksudpur', nameBn: 'মুকসুদপুর' },
          { nameEn: 'Tungipara', nameBn: 'টুঙ্গিপাড়া' }
        ]
      },
      {
        district: 'Madaripur(মাদারীপুর)',
        nameEn: 'Madaripur',
        nameBn: 'মাদারীপুর',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Madaripur Sadar', nameBn: 'মাদারীপুর সদর' },
          { nameEn: 'Kalkini', nameBn: 'কালকিনি' },
          { nameEn: 'Rajoir', nameBn: 'রাজৈর' },
          { nameEn: 'Shibchar', nameBn: 'শিবচর' },
          { nameEn: 'Dasar', nameBn: 'ডাসার' }
        ]
      },
      {
        district: 'Rajbari(রাজবাড়ী)',
        nameEn: 'Rajbari',
        nameBn: 'রাজবাড়ী',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Rajbari Sadar', nameBn: 'রাজবাড়ী সদর' },
          { nameEn: 'Baliakandi', nameBn: 'বালিয়াকান্দি' },
          { nameEn: 'Goalandaghat', nameBn: 'গোয়ালন্দঘাট' },
          { nameEn: 'Pangsha', nameBn: 'পাংশা' },
          { nameEn: 'Kalukhali', nameBn: 'কালুখালী' }
        ]
      },
      {
        district: 'Shariatpur(শরীয়তপুর)',
        nameEn: 'Shariatpur',
        nameBn: 'শরীয়তপুর',
        division: 'Dhaka',
        isDhaka: false,
        thanas: [
          { nameEn: 'Shariatpur Sadar', nameBn: 'শরীয়তপুর সদর' },
          { nameEn: 'Bhedarganj', nameBn: 'ভেদরগঞ্জ' },
          { nameEn: 'Damudya', nameBn: 'ডামুড্যা' },
          { nameEn: 'Gosairhat', nameBn: 'গোসাইরহাট' },
          { nameEn: 'Naria', nameBn: 'নড়িয়া' },
          { nameEn: 'Zajira', nameBn: 'জাজিরা' }
        ]
      }
    ]
  },

  // ─── 2. CHATTOGRAM DIVISION ───
  {
    division: 'Chattogram',
    divisionBn: 'চট্টগ্রাম',
    districts: [
      {
        district: 'Chattogram(চট্টগ্রাম)',
        nameEn: 'Chattogram',
        nameBn: 'চট্টগ্রাম',
        division: 'Chattogram',
        isDhaka: false,
        thanas: [
          // Metro Thanas
          { nameEn: 'Kotwali', nameBn: 'কোতোয়ালী' },
          { nameEn: 'Panchlaish', nameBn: 'পাঁচলাইশ' },
          { nameEn: 'Chawkbazar', nameBn: 'চকবাজার' },
          { nameEn: 'Bakalia', nameBn: 'বাকলিয়া' },
          { nameEn: 'Bayazid', nameBn: 'বায়োজিদ বোস্তামী' },
          { nameEn: 'Chandgaon', nameBn: 'চান্দগাঁও' },
          { nameEn: 'Halishahar', nameBn: 'হালিশহর' },
          { nameEn: 'Double Mooring', nameBn: 'ডাবল মুরিং' },
          { nameEn: 'Pahartali', nameBn: 'পাহাড়তলী' },
          { nameEn: 'Akbar Shah', nameBn: 'আকবর শাহ' },
          { nameEn: 'Khulshi', nameBn: 'খুলশী' },
          { nameEn: 'Patenga', nameBn: 'পতেঙ্গা' },
          { nameEn: 'EPZ', nameBn: 'ইপিজেড' },
          { nameEn: 'Karnaphuli', nameBn: 'কর্ণফুলী' },
          { nameEn: 'Bandar', nameBn: 'বন্দর' },
          { nameEn: 'Sadarghat', nameBn: 'সদরঘাট' },
          // Upazilas
          { nameEn: 'Anwara', nameBn: 'আনোয়ারা' },
          { nameEn: 'Banshkhali', nameBn: 'বাঁশখালী' },
          { nameEn: 'Boalkhali', nameBn: 'বোয়ালখালী' },
          { nameEn: 'Chandanaish', nameBn: 'চন্দনাইশ' },
          { nameEn: 'Fatikchhari', nameBn: 'ফটিকছড়ি' },
          { nameEn: 'Hathazari', nameBn: 'হাটহাজারী' },
          { nameEn: 'Lohagara', nameBn: 'লোহাগাড়া' },
          { nameEn: 'Mirsharai', nameBn: 'মীরসরাই' },
          { nameEn: 'Patiya', nameBn: 'পটিয়া' },
          { nameEn: 'Rangunia', nameBn: 'রাঙ্গুনিয়া' },
          { nameEn: 'Raozan', nameBn: 'রাউজান' },
          { nameEn: 'Sandwip', nameBn: 'সন্দ্বীপ' },
          { nameEn: 'Satkania', nameBn: 'সাতকানিয়া' },
          { nameEn: 'Sitakunda', nameBn: 'সীতাকুণ্ড' }
        ]
      },
      {
        district: "Cox's Bazar(কক্সবাজার)",
        nameEn: "Cox's Bazar",
        nameBn: 'কক্সবাজার',
        division: 'Chattogram',
        isDhaka: false,
        thanas: [
          { nameEn: "Cox's Bazar Sadar", nameBn: 'কক্সবাজার সদর' },
          { nameEn: 'Chakaria', nameBn: 'চকোরিয়া' },
          { nameEn: 'Kutubdia', nameBn: 'কুতুবদিয়া' },
          { nameEn: 'Maheshkhali', nameBn: 'মহেশখালী' },
          { nameEn: 'Ramu', nameBn: 'রামু' },
          { nameEn: 'Teknaf', nameBn: 'টেকনাফ' },
          { nameEn: 'Ukhia', nameBn: 'উখিয়া' },
          { nameEn: 'Pekua', nameBn: 'পেকুয়া' },
          { nameEn: 'Eidgaon', nameBn: 'ঈদগাঁও' }
        ]
      },
      {
        district: 'Cumilla(কুমিল্লা)',
        nameEn: 'Cumilla',
        nameBn: 'কুমিল্লা',
        division: 'Chattogram',
        isDhaka: false,
        thanas: [
          { nameEn: 'Cumilla Adarsha Sadar', nameBn: 'কুমিল্লা আদর্শ সদর' },
          { nameEn: 'Cumilla Sadar Dakshin', nameBn: 'কুমিল্লা সদর দক্ষিণ' },
          { nameEn: 'Barura', nameBn: 'বরুড়া' },
          { nameEn: 'Brahmanpara', nameBn: 'ব্রাহ্মণপাড়া' },
          { nameEn: 'Burichang', nameBn: 'বুড়িচং' },
          { nameEn: 'Chandina', nameBn: 'চান্দিনা' },
          { nameEn: 'Chauddagram', nameBn: 'চৌদ্দগ্রাম' },
          { nameEn: 'Daudkandi', nameBn: 'দাউদকান্দি' },
          { nameEn: 'Debidwar', nameBn: 'দেবিদ্বার' },
          { nameEn: 'Homna', nameBn: 'হোমনা' },
          { nameEn: 'Laksam', nameBn: 'লাকসাম' },
          { nameEn: 'Lalmai', nameBn: 'লালমাই' },
          { nameEn: 'Meghna', nameBn: 'মেঘনা' },
          { nameEn: 'Monohargonj', nameBn: 'মনোহরগঞ্জ' },
          { nameEn: 'Muradnagar', nameBn: 'মুরাদনগর' },
          { nameEn: 'Nangalkot', nameBn: 'নাঙ্গলকোট' },
          { nameEn: 'Titas', nameBn: 'তিতাস' }
        ]
      },
      {
        district: 'Feni(ফেনী)',
        nameEn: 'Feni',
        nameBn: 'ফেনী',
        division: 'Chattogram',
        isDhaka: false,
        thanas: [
          { nameEn: 'Feni Sadar', nameBn: 'ফেনী সদর' },
          { nameEn: 'Chhagalnaiya', nameBn: 'ছাগলনাইয়া' },
          { nameEn: 'Daganbhuiyan', nameBn: 'দাগনভূঞা' },
          { nameEn: 'Parshuram', nameBn: 'পরশুরাম' },
          { nameEn: 'Fulgazi', nameBn: 'ফুলগাজী' },
          { nameEn: 'Sonagazi', nameBn: 'সোনাগাজী' }
        ]
      },
      {
        district: 'Brahmanbaria(ব্রাহ্মণবাড়িয়া)',
        nameEn: 'Brahmanbaria',
        nameBn: 'ব্রাহ্মণবাড়িয়া',
        division: 'Chattogram',
        isDhaka: false,
        thanas: [
          { nameEn: 'Brahmanbaria Sadar', nameBn: 'ব্রাহ্মণবাড়িয়া সদর' },
          { nameEn: 'Ashuganj', nameBn: 'আশুগঞ্জ' },
          { nameEn: 'Bancharampur', nameBn: 'বাঞ্ছারামপুর' },
          { nameEn: 'Bijoynagar', nameBn: 'বিজয়নগর' },
          { nameEn: 'Kasba', nameBn: 'কসবা' },
          { nameEn: 'Nabinagar', nameBn: 'নবীনগর' },
          { nameEn: 'Nasirnagar', nameBn: 'নাসিরনগর' },
          { nameEn: 'Sarail', nameBn: 'সরাইল' },
          { nameEn: 'Akhaura', nameBn: 'আখাউড়া' }
        ]
      },
      {
        district: 'Chandpur(চাঁদপুর)',
        nameEn: 'Chandpur',
        nameBn: 'চাঁদপুর',
        division: 'Chattogram',
        isDhaka: false,
        thanas: [
          { nameEn: 'Chandpur Sadar', nameBn: 'চাঁদপুর সদর' },
          { nameEn: 'Faridganj', nameBn: 'ফরিদগঞ্জ' },
          { nameEn: 'Haimchar', nameBn: 'হাইমচর' },
          { nameEn: 'Haziganj', nameBn: 'হাজীগঞ্জ' },
          { nameEn: 'Kachua', nameBn: 'কচুয়া' },
          { nameEn: 'Matlab Dakshin', nameBn: 'মতলব দক্ষিণ' },
          { nameEn: 'Matlab Uttar', nameBn: 'মতলব উত্তর' },
          { nameEn: 'Shahrasti', nameBn: 'শাহরাস্তি' }
        ]
      },
      {
        district: 'Noakhali(নোয়াখালী)',
        nameEn: 'Noakhali',
        nameBn: 'নোয়াখালী',
        division: 'Chattogram',
        isDhaka: false,
        thanas: [
          { nameEn: 'Noakhali Sadar', nameBn: 'নোয়াখালী সদর' },
          { nameEn: 'Begumganj', nameBn: 'বেগমগঞ্জ' },
          { nameEn: 'Chatkhil', nameBn: 'চাটখিল' },
          { nameEn: 'Companiganj', nameBn: 'কোম্পানীগঞ্জ' },
          { nameEn: 'Hatiya', nameBn: 'হাতিয়া' },
          { nameEn: 'Kabirhat', nameBn: 'কবিরহাট' },
          { nameEn: 'Senbagh', nameBn: 'সেনবাগ' },
          { nameEn: 'Sonaimuri', nameBn: 'সোনাইমুড়ী' },
          { nameEn: 'Subarnachar', nameBn: 'সুবর্ণচর' }
        ]
      },
      {
        district: 'Lakshmipur(লক্ষ্মীপুর)',
        nameEn: 'Lakshmipur',
        nameBn: 'লক্ষ্মীপুর',
        division: 'Chattogram',
        isDhaka: false,
        thanas: [
          { nameEn: 'Lakshmipur Sadar', nameBn: 'লক্ষ্মীপুর সদর' },
          { nameEn: 'Raipur', nameBn: 'রায়পুর' },
          { nameEn: 'Ramganj', nameBn: 'রামগঞ্জ' },
          { nameEn: 'Ramgati', nameBn: 'রামগতি' },
          { nameEn: 'Kamalnagar', nameBn: 'কমলনগর' }
        ]
      },
      {
        district: 'Rangamati(রাঙ্গামাটি)',
        nameEn: 'Rangamati',
        nameBn: 'রাঙ্গামাটি',
        division: 'Chattogram',
        isDhaka: false,
        thanas: [
          { nameEn: 'Rangamati Sadar', nameBn: 'রাঙ্গামাটি সদর' },
          { nameEn: 'Bagaichhari', nameBn: 'বাঘাইছড়ি' },
          { nameEn: 'Barkal', nameBn: 'বরকল' },
          { nameEn: 'Belaichhari', nameBn: 'বিলাইছড়ি' },
          { nameEn: 'Juraichhari', nameBn: 'জুরাইছড়ি' },
          { nameEn: 'Kaptai', nameBn: 'কাপ্তাই' },
          { nameEn: 'Kawkhali', nameBn: 'কাউখালী' },
          { nameEn: 'Langadu', nameBn: 'লংগদু' },
          { nameEn: 'Naniarchar', nameBn: 'নানিয়ারচর' },
          { nameEn: 'Rajasthali', nameBn: 'রাজস্থলী' }
        ]
      },
      {
        district: 'Khagrachhari(খাগড়াছড়ি)',
        nameEn: 'Khagrachhari',
        nameBn: 'খাগড়াছড়ি',
        division: 'Chattogram',
        isDhaka: false,
        thanas: [
          { nameEn: 'Khagrachhari Sadar', nameBn: 'খাগড়াছড়ি সদর' },
          { nameEn: 'Dighinala', nameBn: 'দিঘীনালা' },
          { nameEn: 'Lakshmichhari', nameBn: 'লক্ষ্মীছড়ি' },
          { nameEn: 'Mahalchhari', nameBn: 'মহালছড়ি' },
          { nameEn: 'Manikchhari', nameBn: 'মানিকছড়ি' },
          { nameEn: 'Matiranga', nameBn: 'মাটিরাঙ্গা' },
          { nameEn: 'Panchhari', nameBn: 'পানছড়ি' },
          { nameEn: 'Ramgarh', nameBn: 'রামগড়' },
          { nameEn: 'Guimara', nameBn: 'গুইমারা' }
        ]
      },
      {
        district: 'Bandarban(বান্দরবান)',
        nameEn: 'Bandarban',
        nameBn: 'বান্দরবান',
        division: 'Chattogram',
        isDhaka: false,
        thanas: [
          { nameEn: 'Bandarban Sadar', nameBn: 'বান্দরবান সদর' },
          { nameEn: 'Alikadam', nameBn: 'আলীকদম' },
          { nameEn: 'Lama', nameBn: 'লামা' },
          { nameEn: 'Naikhongchhari', nameBn: 'নাইক্ষ্যংছড়ি' },
          { nameEn: 'Rowangchhari', nameBn: 'রোয়াংছড়ি' },
          { nameEn: 'Ruma', nameBn: 'রুমা' },
          { nameEn: 'Thanchi', nameBn: 'থানচি' }
        ]
      }
    ]
  },

  // ─── 3. RAJSHAHI DIVISION ───
  {
    division: 'Rajshahi',
    divisionBn: 'রাজশাহী',
    districts: [
      {
        district: 'Rajshahi(রাজশাহী)',
        nameEn: 'Rajshahi',
        nameBn: 'রাজশাহী',
        division: 'Rajshahi',
        isDhaka: false,
        thanas: [
          // Metro Thanas
          { nameEn: 'Boalia', nameBn: 'বোয়ালিয়া' },
          { nameEn: 'Motihar', nameBn: 'মতিহার' },
          { nameEn: 'Rajpara', nameBn: 'রাজপাড়া' },
          { nameEn: 'Shah Makhdum', nameBn: 'শাহ মখদুম' },
          { nameEn: 'Chandrima', nameBn: 'চন্দ্রিমা' },
          { nameEn: 'Kashiadanga', nameBn: 'কাশিয়াডাঙ্গা' },
          { nameEn: 'Katakhali', nameBn: 'কাটাখালী' },
          { nameEn: 'Belpukur', nameBn: 'বেলপুকুর' },
          { nameEn: 'Airport', nameBn: 'বিমানবন্দর' },
          { nameEn: 'Kornohar', nameBn: 'কর্ণহার' },
          { nameEn: 'Damkura', nameBn: 'দামকুড়া' },
          // Upazilas
          { nameEn: 'Bagha', nameBn: 'বাঘা' },
          { nameEn: 'Bagmara', nameBn: 'বাগমারা' },
          { nameEn: 'Charghat', nameBn: 'চারঘাট' },
          { nameEn: 'Durgapur', nameBn: 'দুর্গাপুর' },
          { nameEn: 'Godagari', nameBn: 'গোদাগাড়ী' },
          { nameEn: 'Mohonpur', nameBn: 'মোহনপুর' },
          { nameEn: 'Paba', nameBn: 'পবা' },
          { nameEn: 'Puthia', nameBn: 'পুঠিয়া' },
          { nameEn: 'Tanore', nameBn: 'তানোর' }
        ]
      },
      {
        district: 'Bogura(বগুড়া)',
        nameEn: 'Bogura',
        nameBn: 'বগুড়া',
        division: 'Rajshahi',
        isDhaka: false,
        thanas: [
          { nameEn: 'Bogura Sadar', nameBn: 'বগুড়া সদর' },
          { nameEn: 'Adamdighi', nameBn: 'আদমদিঘী' },
          { nameEn: 'Dhunat', nameBn: 'ধুনট' },
          { nameEn: 'Dhupchanchia', nameBn: 'দুপচাঁচিয়া' },
          { nameEn: 'Gabtali', nameBn: 'গাবতলী' },
          { nameEn: 'Kahaloo', nameBn: 'কাহালু' },
          { nameEn: 'Nandigram', nameBn: 'নন্দীগ্রাম' },
          { nameEn: 'Sariakandi', nameBn: 'সারিয়াকান্দি' },
          { nameEn: 'Shajahanpur', nameBn: 'শাজাহানপুর' },
          { nameEn: 'Sherpur', nameBn: 'শেরপুর' },
          { nameEn: 'Shibganj', nameBn: 'শিবগঞ্জ' },
          { nameEn: 'Sonatala', nameBn: 'সোনাতলা' }
        ]
      },
      {
        district: 'Joypurhat(জয়পুরহাট)',
        nameEn: 'Joypurhat',
        nameBn: 'জয়পুরহাট',
        division: 'Rajshahi',
        isDhaka: false,
        thanas: [
          { nameEn: 'Joypurhat Sadar', nameBn: 'জয়পুরহাট সদর' },
          { nameEn: 'Akkelpur', nameBn: 'আক্কেলপুর' },
          { nameEn: 'Kalai', nameBn: 'কালাই' },
          { nameEn: 'Khetlal', nameBn: 'ক্ষেতলাল' },
          { nameEn: 'Panchbibi', nameBn: 'পাঁচবিবি' }
        ]
      },
      {
        district: 'Naogaon(নওগাঁ)',
        nameEn: 'Naogaon',
        nameBn: 'নওগাঁ',
        division: 'Rajshahi',
        isDhaka: false,
        thanas: [
          { nameEn: 'Naogaon Sadar', nameBn: 'নওগাঁ সদর' },
          { nameEn: 'Atrai', nameBn: 'আত্রাই' },
          { nameEn: 'Badalgachhi', nameBn: 'বদলগাছী' },
          { nameEn: 'Dhamoirhat', nameBn: 'ধামইরহাট' },
          { nameEn: 'Manda', nameBn: 'মান্দা' },
          { nameEn: 'Mohadevpur', nameBn: 'মহাদেবপুর' },
          { nameEn: 'Niamatpur', nameBn: 'নিয়ামতপুর' },
          { nameEn: 'Patnitala', nameBn: 'পত্নীতলা' },
          { nameEn: 'Porsha', nameBn: 'পোরশা' },
          { nameEn: 'Raninagar', nameBn: 'রাণীনগর' },
          { nameEn: 'Sapahar', nameBn: 'সাপাহার' }
        ]
      },
      {
        district: 'Natore(নাটোর)',
        nameEn: 'Natore',
        nameBn: 'নাটোর',
        division: 'Rajshahi',
        isDhaka: false,
        thanas: [
          { nameEn: 'Natore Sadar', nameBn: 'নাটোর সদর' },
          { nameEn: 'Bagatipara', nameBn: 'বাগাতিপাড়া' },
          { nameEn: 'Baraigram', nameBn: 'বড়াইগ্রাম' },
          { nameEn: 'Gurudaspur', nameBn: 'গুরুদাসপুর' },
          { nameEn: 'Lalpur', nameBn: 'লালপুর' },
          { nameEn: 'Singra', nameBn: 'সিংড়া' },
          { nameEn: 'Naldanga', nameBn: 'নলডাঙ্গা' }
        ]
      },
      {
        district: 'Chapainawabganj(চাঁপাইনবাবগঞ্জ)',
        nameEn: 'Chapainawabganj',
        nameBn: 'চাঁপাইনবাবগঞ্জ',
        division: 'Rajshahi',
        isDhaka: false,
        thanas: [
          { nameEn: 'Chapainawabganj Sadar', nameBn: 'চাঁপাইনবাবগঞ্জ সদর' },
          { nameEn: 'Bholahat', nameBn: 'ভোলাহাট' },
          { nameEn: 'Gomastapur', nameBn: 'গোমস্তাপুর' },
          { nameEn: 'Nachole', nameBn: 'নাচোল' },
          { nameEn: 'Shibganj', nameBn: 'শিবগঞ্জ' }
        ]
      },
      {
        district: 'Pabna(পাবনা)',
        nameEn: 'Pabna',
        nameBn: 'পাবনা',
        division: 'Rajshahi',
        isDhaka: false,
        thanas: [
          { nameEn: 'Pabna Sadar', nameBn: 'পাবনা সদর' },
          { nameEn: 'Atgharia', nameBn: 'আটঘরিয়া' },
          { nameEn: 'Bera', nameBn: 'বেড়া' },
          { nameEn: 'Bhangura', nameBn: 'ভাঙ্গুড়া' },
          { nameEn: 'Chatmohar', nameBn: 'চাটমোহর' },
          { nameEn: 'Faridpur', nameBn: 'ফরিদপুর' },
          { nameEn: 'Ishwardi', nameBn: 'ঈশ্বরদী' },
          { nameEn: 'Santhia', nameBn: 'সাঁথিয়া' },
          { nameEn: 'Sujanagar', nameBn: 'সুজানগর' }
        ]
      },
      {
        district: 'Sirajganj(সিরাজগঞ্জ)',
        nameEn: 'Sirajganj',
        nameBn: 'সিরাজগঞ্জ',
        division: 'Rajshahi',
        isDhaka: false,
        thanas: [
          { nameEn: 'Sirajganj Sadar', nameBn: 'সিরাজগঞ্জ সদর' },
          { nameEn: 'Belkuchi', nameBn: 'বেলকুচি' },
          { nameEn: 'Chauhali', nameBn: 'চৌহালী' },
          { nameEn: 'Kamarkhanda', nameBn: 'কামারখন্দ' },
          { nameEn: 'Kazipur', nameBn: 'কাজীপুর' },
          { nameEn: 'Raiganj', nameBn: 'রায়গঞ্জ' },
          { nameEn: 'Shahjadpur', nameBn: 'শাহজাদপুর' },
          { nameEn: 'Tarash', nameBn: 'তাড়াশ' },
          { nameEn: 'Ullahpara', nameBn: 'উল্লাপাড়া' }
        ]
      }
    ]
  },

  // ─── 4. KHULNA DIVISION ───
  {
    division: 'Khulna',
    divisionBn: 'খুলনা',
    districts: [
      {
        district: 'Khulna(খুলনা)',
        nameEn: 'Khulna',
        nameBn: 'খুলনা',
        division: 'Khulna',
        isDhaka: false,
        thanas: [
          // Metro Thanas
          { nameEn: 'Kotwali', nameBn: 'কোতোয়ালী' },
          { nameEn: 'Daulatpur', nameBn: 'দৌলতপুর' },
          { nameEn: 'Khalishpur', nameBn: 'খালিশপুর' },
          { nameEn: 'Khan Jahan Ali', nameBn: 'খান জাহান আলী' },
          { nameEn: 'Sonadanga', nameBn: 'সোনাডাঙ্গা' },
          { nameEn: 'Harintana', nameBn: 'হরিণটানা' },
          { nameEn: 'Aranghata', nameBn: 'আড়ংঘাটা' },
          // Upazilas
          { nameEn: 'Batiaghata', nameBn: 'বটিয়াঘাটা' },
          { nameEn: 'Dacope', nameBn: 'দাকোপ' },
          { nameEn: 'Dumuria', nameBn: 'ডুমুরিয়া' },
          { nameEn: 'Dighalia', nameBn: 'দিঘলিয়া' },
          { nameEn: 'Koyra', nameBn: 'কয়রা' },
          { nameEn: 'Paikgachha', nameBn: 'পাইকগাছা' },
          { nameEn: 'Phultala', nameBn: 'ফুলতলা' },
          { nameEn: 'Rupsha', nameBn: 'রূপসা' },
          { nameEn: 'Terokhada', nameBn: 'তেরখাদা' }
        ]
      },
      {
        district: 'Bagerhat(বাগেরহাট)',
        nameEn: 'Bagerhat',
        nameBn: 'বাগেরহাট',
        division: 'Khulna',
        isDhaka: false,
        thanas: [
          { nameEn: 'Bagerhat Sadar', nameBn: 'বাগেরহাট সদর' },
          { nameEn: 'Chitalmari', nameBn: 'চিতলমারী' },
          { nameEn: 'Fakirhat', nameBn: 'ফকিরহাট' },
          { nameEn: 'Kachua', nameBn: 'কচুয়া' },
          { nameEn: 'Mollahat', nameBn: 'মোল্লাহাট' },
          { nameEn: 'Mongla', nameBn: 'মোংলা' },
          { nameEn: 'Morrelganj', nameBn: 'মোরেলগঞ্জ' },
          { nameEn: 'Rampal', nameBn: 'রামপাল' },
          { nameEn: 'Sarankhola', nameBn: 'শরণখোলা' }
        ]
      },
      {
        district: 'Chuadanga(চুয়াডাঙ্গা)',
        nameEn: 'Chuadanga',
        nameBn: 'চুয়াডাঙ্গা',
        division: 'Khulna',
        isDhaka: false,
        thanas: [
          { nameEn: 'Chuadanga Sadar', nameBn: 'চুয়াডাঙ্গা সদর' },
          { nameEn: 'Alamdanga', nameBn: 'আলমডাঙ্গা' },
          { nameEn: 'Damurhuda', nameBn: 'দামুড়হুদা' },
          { nameEn: 'Jibannagar', nameBn: 'জীবননগর' }
        ]
      },
      {
        district: 'Jashore(যশোর)',
        nameEn: 'Jashore',
        nameBn: 'যশোর',
        division: 'Khulna',
        isDhaka: false,
        thanas: [
          { nameEn: 'Jashore Sadar', nameBn: 'যশোর সদর' },
          { nameEn: 'Abhaynagar', nameBn: 'অভয়নগর' },
          { nameEn: 'Bagherpara', nameBn: 'বাঘারপাড়া' },
          { nameEn: 'Chaugachha', nameBn: 'চৌগাছা' },
          { nameEn: 'Jhikargachha', nameBn: 'ঝিকরগাছা' },
          { nameEn: 'Keshabpur', nameBn: 'কেশবপুর' },
          { nameEn: 'Manirampur', nameBn: 'মণিরামপুর' },
          { nameEn: 'Sharsha', nameBn: 'শার্শা' }
        ]
      },
      {
        district: 'Jhenaidah(ঝিনাইদহ)',
        nameEn: 'Jhenaidah',
        nameBn: 'ঝিনাইদহ',
        division: 'Khulna',
        isDhaka: false,
        thanas: [
          { nameEn: 'Jhenaidah Sadar', nameBn: 'ঝিনাইদহ সদর' },
          { nameEn: 'Harinakunda', nameBn: 'হরিণাকুণ্ডু' },
          { nameEn: 'Kaliganj', nameBn: 'কালীগঞ্জ' },
          { nameEn: 'Kotchandpur', nameBn: 'কোটচাঁদপুর' },
          { nameEn: 'Maheshpur', nameBn: 'মহেশপুর' },
          { nameEn: 'Shailkupa', nameBn: 'শৈলকুপা' }
        ]
      },
      {
        district: 'Kushtia(কুষ্টিয়া)',
        nameEn: 'Kushtia',
        nameBn: 'কুষ্টিয়া',
        division: 'Khulna',
        isDhaka: false,
        thanas: [
          { nameEn: 'Kushtia Sadar', nameBn: 'কুষ্টিয়া সদর' },
          { nameEn: 'Bheramara', nameBn: 'ভেড়ামারা' },
          { nameEn: 'Daulatpur', nameBn: 'দৌলতপুর' },
          { nameEn: 'Khoksa', nameBn: 'খোকসা' },
          { nameEn: 'Kumarkhali', nameBn: 'কুমারখালী' },
          { nameEn: 'Mirpur', nameBn: 'মিরপুর' }
        ]
      },
      {
        district: 'Magura(মাগুরা)',
        nameEn: 'Magura',
        nameBn: 'মাগুরা',
        division: 'Khulna',
        isDhaka: false,
        thanas: [
          { nameEn: 'Magura Sadar', nameBn: 'মাগুরা সদর' },
          { nameEn: 'Mohammadpur', nameBn: 'মোহাম্মদপুর' },
          { nameEn: 'Shalikha', nameBn: 'শালিখা' },
          { nameEn: 'Sreepur', nameBn: 'শ্রীপুর' }
        ]
      },
      {
        district: 'Meherpur(মেহেরপুর)',
        nameEn: 'Meherpur',
        nameBn: 'মেহেরপুর',
        division: 'Khulna',
        isDhaka: false,
        thanas: [
          { nameEn: 'Meherpur Sadar', nameBn: 'মেহেরপুর সদর' },
          { nameEn: 'Gangni', nameBn: 'গাংনী' },
          { nameEn: 'Mujibnagar', nameBn: 'মুজিবনগর' }
        ]
      },
      {
        district: 'Narail(নড়াইল)',
        nameEn: 'Narail',
        nameBn: 'নড়াইল',
        division: 'Khulna',
        isDhaka: false,
        thanas: [
          { nameEn: 'Narail Sadar', nameBn: 'নড়াইল সদর' },
          { nameEn: 'Kalia', nameBn: 'কালিয়া' },
          { nameEn: 'Lohagara', nameBn: 'লোহাগড়া' }
        ]
      },
      {
        district: 'Satkhira(সাতক্ষীরা)',
        nameEn: 'Satkhira',
        nameBn: 'সাতক্ষীরা',
        division: 'Khulna',
        isDhaka: false,
        thanas: [
          { nameEn: 'Satkhira Sadar', nameBn: 'সাতক্ষীরা সদর' },
          { nameEn: 'Assasuni', nameBn: 'আশাশুনি' },
          { nameEn: 'Debhata', nameBn: 'দেবহাটা' },
          { nameEn: 'Kalaroa', nameBn: 'কলারোয়া' },
          { nameEn: 'Kaliganj', nameBn: 'কালীগঞ্জ' },
          { nameEn: 'Shyamnagar', nameBn: 'শ্যামনগর' },
          { nameEn: 'Tala', nameBn: 'তালা' }
        ]
      }
    ]
  },

  // ─── 5. BARISHAL DIVISION ───
  {
    division: 'Barishal',
    divisionBn: 'বরিশাল',
    districts: [
      {
        district: 'Barishal(বরিশাল)',
        nameEn: 'Barishal',
        nameBn: 'বরিশাল',
        division: 'Barishal',
        isDhaka: false,
        thanas: [
          // Metro Thanas
          { nameEn: 'Kotwali', nameBn: 'কোতোয়ালী' },
          { nameEn: 'Kawnia', nameBn: 'কাউনিয়া' },
          { nameEn: 'Bandar', nameBn: 'বন্দর' },
          { nameEn: 'Airport', nameBn: 'বিমানবন্দর' },
          // Upazilas
          { nameEn: 'Agailjhara', nameBn: 'আগৈলঝাড়া' },
          { nameEn: 'Babuganj', nameBn: 'বাবুগঞ্জ' },
          { nameEn: 'Bakerganj', nameBn: 'বাকেরগঞ্জ' },
          { nameEn: 'Banaripara', nameBn: 'বানারীপাড়া' },
          { nameEn: 'Gaurnadi', nameBn: 'গৌরনদী' },
          { nameEn: 'Hizla', nameBn: 'হিজলা' },
          { nameEn: 'Mehendiganj', nameBn: 'মেহেন্দিগঞ্জ' },
          { nameEn: 'Muladi', nameBn: 'মুলাদী' },
          { nameEn: 'Wazirpur', nameBn: 'উজিরপুর' }
        ]
      },
      {
        district: 'Barguna(বরগুনা)',
        nameEn: 'Barguna',
        nameBn: 'বরগুনা',
        division: 'Barishal',
        isDhaka: false,
        thanas: [
          { nameEn: 'Barguna Sadar', nameBn: 'বরগুনা সদর' },
          { nameEn: 'Amtali', nameBn: 'আমতলী' },
          { nameEn: 'Bamna', nameBn: 'বামনা' },
          { nameEn: 'Betagi', nameBn: 'বেতাগী' },
          { nameEn: 'Patharghata', nameBn: 'পাথরঘাটা' },
          { nameEn: 'Taltali', nameBn: 'তালতলী' }
        ]
      },
      {
        district: 'Bhola(ভোলা)',
        nameEn: 'Bhola',
        nameBn: 'ভোলা',
        division: 'Barishal',
        isDhaka: false,
        thanas: [
          { nameEn: 'Bhola Sadar', nameBn: 'ভোলা সদর' },
          { nameEn: 'Burhanuddin', nameBn: 'বোরহানউদ্দিন' },
          { nameEn: 'Char Fasson', nameBn: 'চরফ্যাশন' },
          { nameEn: 'Daulatkhan', nameBn: 'দৌলতখান' },
          { nameEn: 'Lalmohan', nameBn: 'লালমোহন' },
          { nameEn: 'Manpura', nameBn: 'মনপুরা' },
          { nameEn: 'Tazumuddin', nameBn: 'তজুমদ্দিন' }
        ]
      },
      {
        district: 'Jhalokathi(ঝালকাঠি)',
        nameEn: 'Jhalokathi',
        nameBn: 'ঝালকাঠি',
        division: 'Barishal',
        isDhaka: false,
        thanas: [
          { nameEn: 'Jhalokathi Sadar', nameBn: 'ঝালকাঠি সদর' },
          { nameEn: 'Kathalia', nameBn: 'কাঠালিয়া' },
          { nameEn: 'Nalchity', nameBn: 'নলছিটি' },
          { nameEn: 'Rajapur', nameBn: 'রাজাপুর' }
        ]
      },
      {
        district: 'Patuakhali(পটুয়াখালী)',
        nameEn: 'Patuakhali',
        nameBn: 'পটুয়াখালী',
        division: 'Barishal',
        isDhaka: false,
        thanas: [
          { nameEn: 'Patuakhali Sadar', nameBn: 'পটুয়াখালী সদর' },
          { nameEn: 'Bauphal', nameBn: 'বাউফল' },
          { nameEn: 'Dashmina', nameBn: 'দশমিনা' },
          { nameEn: 'Galachipa', nameBn: 'গলাচিপা' },
          { nameEn: 'Kalapara', nameBn: 'কলাপাড়া' },
          { nameEn: 'Mirzaganj', nameBn: 'মির্জাগঞ্জ' },
          { nameEn: 'Rangabali', nameBn: 'রাঙ্গাবালী' },
          { nameEn: 'Dumki', nameBn: 'দুমকি' }
        ]
      },
      {
        district: 'Pirojpur(পিরোজপুর)',
        nameEn: 'Pirojpur',
        nameBn: 'পিরোজপুর',
        division: 'Barishal',
        isDhaka: false,
        thanas: [
          { nameEn: 'Pirojpur Sadar', nameBn: 'পিরোজপুর সদর' },
          { nameEn: 'Bhandaria', nameBn: 'ভাণ্ডারিয়া' },
          { nameEn: 'Kawkhali', nameBn: 'কাউখালী' },
          { nameEn: 'Mathbaria', nameBn: 'মঠবাড়িয়া' },
          { nameEn: 'Nazirpur', nameBn: 'নাজিরপুর' },
          { nameEn: 'Nesarabad', nameBn: 'নেছারাবাদ' },
          { nameEn: 'Zianagar', nameBn: 'জিয়ানগর' }
        ]
      }
    ]
  },

  // ─── 6. SYLHET DIVISION ───
  {
    division: 'Sylhet',
    divisionBn: 'সিলেট',
    districts: [
      {
        district: 'Sylhet(সিলেট)',
        nameEn: 'Sylhet',
        nameBn: 'সিলেট',
        division: 'Sylhet',
        isDhaka: false,
        thanas: [
          // Metro Thanas
          { nameEn: 'Kotwali', nameBn: 'কোতোয়ালী' },
          { nameEn: 'Jalalabad', nameBn: 'জালালাবাদ' },
          { nameEn: 'Airport', nameBn: 'বিমানবন্দর' },
          { nameEn: 'Moglabazar', nameBn: 'মোগলাবাজার' },
          { nameEn: 'South Surma', nameBn: 'দক্ষিণ সুরমা' },
          { nameEn: 'Shah Paran', nameBn: 'শাহ পরাণ' },
          // Upazilas
          { nameEn: 'Balaganj', nameBn: 'বালাগঞ্জ' },
          { nameEn: 'Beanibazar', nameBn: 'বিয়ানীবাজার' },
          { nameEn: 'Bishwanath', nameBn: 'বিশ্বনাথ' },
          { nameEn: 'Companiganj', nameBn: 'কোম্পানীগঞ্জ' },
          { nameEn: 'Fenchuganj', nameBn: 'ফেঞ্চুগঞ্জ' },
          { nameEn: 'Golapganj', nameBn: 'গোলাপগঞ্জ' },
          { nameEn: 'Gowainghat', nameBn: 'গোয়াইনঘাট' },
          { nameEn: 'Jaintiapur', nameBn: 'জৈন্তাপুর' },
          { nameEn: 'Kanaighat', nameBn: 'কানাইঘাট' },
          { nameEn: 'Zakiganj', nameBn: 'জকিগঞ্জ' },
          { nameEn: 'Osmani Nagar', nameBn: 'ওসমানী নগর' }
        ]
      },
      {
        district: 'Habiganj(হবিগঞ্জ)',
        nameEn: 'Habiganj',
        nameBn: 'হবিগঞ্জ',
        division: 'Sylhet',
        isDhaka: false,
        thanas: [
          { nameEn: 'Habiganj Sadar', nameBn: 'হবিগঞ্জ সদর' },
          { nameEn: 'Ajmiriganj', nameBn: 'আজমিরীগঞ্জ' },
          { nameEn: 'Bahubal', nameBn: 'বাহুবল' },
          { nameEn: 'Baniachong', nameBn: 'বানিয়াচং' },
          { nameEn: 'Chunarughat', nameBn: 'চুনারুঘাট' },
          { nameEn: 'Lakhai', nameBn: 'লাখাই' },
          { nameEn: 'Madhabpur', nameBn: 'মাধবপুর' },
          { nameEn: 'Nabiganj', nameBn: 'নবীগঞ্জ' },
          { nameEn: 'Sayestaganj', nameBn: 'শায়েস্তাগঞ্জ' }
        ]
      },
      {
        district: 'Moulvibazar(মৌলভীবাজার)',
        nameEn: 'Moulvibazar',
        nameBn: 'মৌলভীবাজার',
        division: 'Sylhet',
        isDhaka: false,
        thanas: [
          { nameEn: 'Moulvibazar Sadar', nameBn: 'মৌলভীবাজার সদর' },
          { nameEn: 'Barlekha', nameBn: 'বড়লেখা' },
          { nameEn: 'Juri', nameBn: 'জুড়ী' },
          { nameEn: 'Kamalganj', nameBn: 'কমলগঞ্জ' },
          { nameEn: 'Kulaura', nameBn: 'কুলাউড়া' },
          { nameEn: 'Rajnagar', nameBn: 'রাজনগর' },
          { nameEn: 'Sreemangal', nameBn: 'শ্রীমঙ্গল' }
        ]
      },
      {
        district: 'Sunamganj(সুনামগঞ্জ)',
        nameEn: 'Sunamganj',
        nameBn: 'সুনামগঞ্জ',
        division: 'Sylhet',
        isDhaka: false,
        thanas: [
          { nameEn: 'Sunamganj Sadar', nameBn: 'সুনামগঞ্জ সদর' },
          { nameEn: 'Bishwamvarpur', nameBn: 'বিশ্বম্ভরপুর' },
          { nameEn: 'Chhatak', nameBn: 'ছাতক' },
          { nameEn: 'Derai', nameBn: 'দিরাই' },
          { nameEn: 'Dharampasha', nameBn: 'ধর্মপাশা' },
          { nameEn: 'Dowarabazar', nameBn: 'দোয়ারাবাজার' },
          { nameEn: 'Jagannathpur', nameBn: 'জগন্নাথপুর' },
          { nameEn: 'Jamalganj', nameBn: 'জামালগঞ্জ' },
          { nameEn: 'Shantiganj', nameBn: 'শান্তিগঞ্জ' },
          { nameEn: 'Sullah', nameBn: 'শাল্লা' },
          { nameEn: 'Tahirpur', nameBn: 'তাহিরপুর' },
          { nameEn: 'Madhyanagar', nameBn: 'মধ্যনগর' }
        ]
      }
    ]
  },

  // ─── 7. RANGPUR DIVISION ───
  {
    division: 'Rangpur',
    divisionBn: 'রংপুর',
    districts: [
      {
        district: 'Rangpur(রংপুর)',
        nameEn: 'Rangpur',
        nameBn: 'রংপুর',
        division: 'Rangpur',
        isDhaka: false,
        thanas: [
          // Metro Thanas
          { nameEn: 'Kotwali', nameBn: 'কোতোয়ালী' },
          { nameEn: 'Tajhat', nameBn: 'তাজহাট' },
          { nameEn: 'Mahiganj', nameBn: 'মাহিগঞ্জ' },
          { nameEn: 'Haragach', nameBn: 'হারাগাছ' },
          { nameEn: 'Parshuram', nameBn: 'পরশুরাম' },
          { nameEn: 'Hazirhat', nameBn: 'হাজিরহাট' },
          // Upazilas
          { nameEn: 'Badarganj', nameBn: 'বদরগঞ্জ' },
          { nameEn: 'Gangachhara', nameBn: 'গংগাচড়া' },
          { nameEn: 'Kaunia', nameBn: 'কাউনিয়া' },
          { nameEn: 'Mithapukur', nameBn: 'মিঠাপুকুর' },
          { nameEn: 'Pirgachha', nameBn: 'পীরগাছা' },
          { nameEn: 'Pirganj', nameBn: 'পীরগঞ্জ' },
          { nameEn: 'Taraganj', nameBn: 'তারাগঞ্জ' }
        ]
      },
      {
        district: 'Dinajpur(দিনাজপুর)',
        nameEn: 'Dinajpur',
        nameBn: 'দিনাজপুর',
        division: 'Rangpur',
        isDhaka: false,
        thanas: [
          { nameEn: 'Dinajpur Sadar', nameBn: 'দিনাজপুর সদর' },
          { nameEn: 'Birampur', nameBn: 'বিরামপুর' },
          { nameEn: 'Birganj', nameBn: 'বীরগঞ্জ' },
          { nameEn: 'Biral', nameBn: 'বিরল' },
          { nameEn: 'Bochaganj', nameBn: 'বোচাগঞ্জ' },
          { nameEn: 'Chirirbandar', nameBn: 'চিরিরবন্দর' },
          { nameEn: 'Phulbari', nameBn: 'ফুলবাড়ী' },
          { nameEn: 'Ghoraghat', nameBn: 'ঘোড়াঘাট' },
          { nameEn: 'Hakimpur', nameBn: 'হাকিমপুর' },
          { nameEn: 'Kaharole', nameBn: 'কাহারোল' },
          { nameEn: 'Khansama', nameBn: 'খানসামা' },
          { nameEn: 'Nawabganj', nameBn: 'নবাবগঞ্জ' },
          { nameEn: 'Parbatipur', nameBn: 'পার্বতীপুর' }
        ]
      },
      {
        district: 'Gaibandha(গাইবান্ধা)',
        nameEn: 'Gaibandha',
        nameBn: 'গাইবান্ধা',
        division: 'Rangpur',
        isDhaka: false,
        thanas: [
          { nameEn: 'Gaibandha Sadar', nameBn: 'গাইবান্ধা সদর' },
          { nameEn: 'Fulchhari', nameBn: 'ফুলছড়ি' },
          { nameEn: 'Gobindaganj', nameBn: 'গোবিন্দগঞ্জ' },
          { nameEn: 'Palashbari', nameBn: 'পলাশবাড়ী' },
          { nameEn: 'Sadullapur', nameBn: 'সাদুল্লাপুর' },
          { nameEn: 'Saghata', nameBn: 'সাঘাটা' },
          { nameEn: 'Sundarganj', nameBn: 'সুন্দরগঞ্জ' }
        ]
      },
      {
        district: 'Kurigram(কুড়িগ্রাম)',
        nameEn: 'Kurigram',
        nameBn: 'কুড়িগ্রাম',
        division: 'Rangpur',
        isDhaka: false,
        thanas: [
          { nameEn: 'Kurigram Sadar', nameBn: 'কুড়িগ্রাম সদর' },
          { nameEn: 'Bhurungamari', nameBn: 'ভুরুঙ্গামারী' },
          { nameEn: 'Char Rajibpur', nameBn: 'চর রাজিবপুর' },
          { nameEn: 'Chilmari', nameBn: 'চিলমারী' },
          { nameEn: 'Phulbari', nameBn: 'ফুলবাড়ী' },
          { nameEn: 'Nageshwari', nameBn: 'নাগেশ্বরী' },
          { nameEn: 'Rajarhat', nameBn: 'রাজারহাট' },
          { nameEn: 'Rowmari', nameBn: 'রৌমারী' },
          { nameEn: 'Ulipur', nameBn: 'উলিপুর' }
        ]
      },
      {
        district: 'Lalmonirhat(লালমনিরহাট)',
        nameEn: 'Lalmonirhat',
        nameBn: 'লালমনিরহাট',
        division: 'Rangpur',
        isDhaka: false,
        thanas: [
          { nameEn: 'Lalmonirhat Sadar', nameBn: 'লালমনিরহাট সদর' },
          { nameEn: 'Aditmari', nameBn: 'আদিতমারী' },
          { nameEn: 'Hatibandha', nameBn: 'হাতীবান্ধা' },
          { nameEn: 'Kaliganj', nameBn: 'কালীগঞ্জ' },
          { nameEn: 'Patgram', nameBn: 'পাটগ্রাম' }
        ]
      },
      {
        district: 'Nilphamari(নীলফামারী)',
        nameEn: 'Nilphamari',
        nameBn: 'নীলফামারী',
        division: 'Rangpur',
        isDhaka: false,
        thanas: [
          { nameEn: 'Nilphamari Sadar', nameBn: 'নীলফামারী সদর' },
          { nameEn: 'Dimla', nameBn: 'ডিমলা' },
          { nameEn: 'Domar', nameBn: 'ডোমার' },
          { nameEn: 'Jaldhaka', nameBn: 'জলঢাকা' },
          { nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ' },
          { nameEn: 'Saidpur', nameBn: 'সৈয়দপুর' }
        ]
      },
      {
        district: 'Panchagarh(পঞ্চগড়)',
        nameEn: 'Panchagarh',
        nameBn: 'পঞ্চগড়',
        division: 'Rangpur',
        isDhaka: false,
        thanas: [
          { nameEn: 'Panchagarh Sadar', nameBn: 'পঞ্চগড় সদর' },
          { nameEn: 'Atwari', nameBn: 'আটোয়ারী' },
          { nameEn: 'Boda', nameBn: 'বোদা' },
          { nameEn: 'Debiganj', nameBn: 'দেবীগঞ্জ' },
          { nameEn: 'Tetulia', nameBn: 'তেঁতুলিয়া' }
        ]
      },
      {
        district: 'Thakurgaon(ঠাকুরগাঁও)',
        nameEn: 'Thakurgaon',
        nameBn: 'ঠাকুরগাঁও',
        division: 'Rangpur',
        isDhaka: false,
        thanas: [
          { nameEn: 'Thakurgaon Sadar', nameBn: 'ঠাকুরগাঁও সদর' },
          { nameEn: 'Baliadangi', nameBn: 'বালিয়াডাঙ্গী' },
          { nameEn: 'Haripur', nameBn: 'হরিপুর' },
          { nameEn: 'Pirganj', nameBn: 'পীরগঞ্জ' },
          { nameEn: 'Ranisankail', nameBn: 'রাণীশংকৈল' }
        ]
      }
    ]
  },

  // ─── 8. MYMENSINGH DIVISION ───
  {
    division: 'Mymensingh',
    divisionBn: 'ময়মনসিংহ',
    districts: [
      {
        district: 'Mymensingh(ময়মনসিংহ)',
        nameEn: 'Mymensingh',
        nameBn: 'ময়মনসিংহ',
        division: 'Mymensingh',
        isDhaka: false,
        thanas: [
          { nameEn: 'Mymensingh Sadar', nameBn: 'ময়মনসিংহ সদর' },
          { nameEn: 'Bhaluka', nameBn: 'ভালুকা' },
          { nameEn: 'Dhobaura', nameBn: 'ধোবাউড়া' },
          { nameEn: 'Fulbaria', nameBn: 'ফুলবাড়িয়া' },
          { nameEn: 'Gafargaon', nameBn: 'গফরগাঁও' },
          { nameEn: 'Gauripur', nameBn: 'গৌরীপুর' },
          { nameEn: 'Haluaghat', nameBn: 'হালুয়াঘাট' },
          { nameEn: 'Ishwarganj', nameBn: 'ঈশ্বরগঞ্জ' },
          { nameEn: 'Muktagachha', nameBn: 'মুক্তাগাছা' },
          { nameEn: 'Nandail', nameBn: 'নান্দাইল' },
          { nameEn: 'Phulpur', nameBn: 'ফুলপুর' },
          { nameEn: 'Trishal', nameBn: 'ত্রিশাল' },
          { nameEn: 'Tara Khanda', nameBn: 'তারাকান্দা' }
        ]
      },
      {
        district: 'Jamalpur(জামালপুর)',
        nameEn: 'Jamalpur',
        nameBn: 'জামালপুর',
        division: 'Mymensingh',
        isDhaka: false,
        thanas: [
          { nameEn: 'Jamalpur Sadar', nameBn: 'জামালপুর সদর' },
          { nameEn: 'Bakshiganj', nameBn: 'বকশীগঞ্জ' },
          { nameEn: 'Dewanganj', nameBn: 'দেওয়ানগঞ্জ' },
          { nameEn: 'Islampur', nameBn: 'ইসলামপুর' },
          { nameEn: 'Madarganj', nameBn: 'মাদারগঞ্জ' },
          { nameEn: 'Melandaha', nameBn: 'মেলান্দহ' },
          { nameEn: 'Sarishabari', nameBn: 'সরিষাবাড়ী' }
        ]
      },
      {
        district: 'Netrokona(নেত্রকোণা)',
        nameEn: 'Netrokona',
        nameBn: 'নেত্রকোণা',
        division: 'Mymensingh',
        isDhaka: false,
        thanas: [
          { nameEn: 'Netrokona Sadar', nameBn: 'নেত্রকোণা সদর' },
          { nameEn: 'Atpara', nameBn: 'আটপাড়া' },
          { nameEn: 'Barhatta', nameBn: 'বারহাট্টা' },
          { nameEn: 'Durgapur', nameBn: 'দুর্গাপুর' },
          { nameEn: 'Khaliajuri', nameBn: 'খালিয়াজুড়ী' },
          { nameEn: 'Kalmakanda', nameBn: 'কলমাকান্দা' },
          { nameEn: 'Kendua', nameBn: 'কেন্দুয়া' },
          { nameEn: 'Madan', nameBn: 'মদন' },
          { nameEn: 'Mohanganj', nameBn: 'মোহনগঞ্জ' },
          { nameEn: 'Purbadhala', nameBn: 'পূর্বধলা' }
        ]
      },
      {
        district: 'Sherpur(শেরপুর)',
        nameEn: 'Sherpur',
        nameBn: 'শেরপুর',
        division: 'Mymensingh',
        isDhaka: false,
        thanas: [
          { nameEn: 'Sherpur Sadar', nameBn: 'শেরপুর সদর' },
          { nameEn: 'Jhenaigati', nameBn: 'ঝিনাইগাতী' },
          { nameEn: 'Nakla', nameBn: 'নকলা' },
          { nameEn: 'Nalitabari', nameBn: 'নালিতাবাড়ী' },
          { nameEn: 'Sreebardi', nameBn: 'শ্রীবরদী' }
        ]
      }
    ]
  }
];

/** Flattens all 64 districts across divisions with bilingual division names */
export const ALL_BD_DISTRICTS: BDDistrict[] = BD_LOCATIONS_BY_DIVISION.flatMap(div =>
  div.districts.map(dist => ({
    ...dist,
    divisionEn: div.division,
    divisionBn: div.divisionBn,
  }))
);
