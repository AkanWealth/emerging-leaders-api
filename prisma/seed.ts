// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
// const currencies = [
//   { code: 'USD', symbol: '$' },      // US Dollar
//   { code: 'EUR', symbol: '€' },      // Euro
//   { code: 'JPY', symbol: '¥' },      // Japanese Yen
//   { code: 'GBP', symbol: '£' },      // British Pound
//   { code: 'AUD', symbol: 'A$' },     // Australian Dollar
//   { code: 'CAD', symbol: 'C$' },     // Canadian Dollar
//   { code: 'CHF', symbol: 'CHF' },    // Swiss Franc
//   { code: 'CNY', symbol: '¥' },      // Chinese Yuan
//   { code: 'HKD', symbol: 'HK$' },    // Hong Kong Dollar
//   { code: 'SGD', symbol: 'S$' },     // Singapore Dollar
//   { code: 'INR', symbol: '₹' },      // Indian Rupee
//   { code: 'KRW', symbol: '₩' },      // South Korean Won
//   { code: 'BRL', symbol: 'R$' },     // Brazilian Real
//   { code: 'ZAR', symbol: 'R' },      // South African Rand
//   { code: 'SEK', symbol: 'kr' },     // Swedish Krona
//   { code: 'NOK', symbol: 'kr' },     // Norwegian Krone
//   { code: 'DKK', symbol: 'kr' },     // Danish Krone
//   { code: 'RUB', symbol: '₽' },      // Russian Ruble
//   { code: 'MXN', symbol: 'Mex$' },   // Mexican Peso
//   { code: 'IDR', symbol: 'Rp' },     // Indonesian Rupiah
//   { code: 'TRY', symbol: '₺' },      // Turkish Lira
//   { code: 'PLN', symbol: 'zł' },     // Polish Zloty
//   { code: 'THB', symbol: '฿' },      // Thai Baht
//   { code: 'TWD', symbol: 'NT$' },    // New Taiwan Dollar
//   { code: 'MYR', symbol: 'RM' },     // Malaysian Ringgit
//   { code: 'VND', symbol: '₫' },      // Vietnamese Dong
//   { code: 'SAR', symbol: '﷼' },      // Saudi Riyal
//   { code: 'AED', symbol: 'د.إ' },    // UAE Dirham
//   { code: 'EGP', symbol: 'E£' },     // Egyptian Pound
//   { code: 'NGN', symbol: '₦' },      // Nigerian Naira
//   { code: 'GHS', symbol: '₵' },      // Ghanaian Cedi
//   { code: 'KES', symbol: 'KSh' },    // Kenyan Shilling
//   { code: 'TZS', symbol: 'TSh' },    // Tanzanian Shilling
//   { code: 'UGX', symbol: 'USh' },    // Ugandan Shilling
//   { code: 'XOF', symbol: 'CFA' },    // West African CFA Franc
//   { code: 'XAF', symbol: 'CFA' },    // Central African CFA Franc
//   { code: 'BWP', symbol: 'P' },      // Botswana Pula
//   { code: 'LSL', symbol: 'M' },      // Lesotho Loti
//   { code: 'MZN', symbol: 'MT' },     // Mozambican Metical
//   { code: 'BHD', symbol: '.د.ب' },   // Bahraini Dinar
//   { code: 'QAR', symbol: '﷼' },      // Qatari Riyal
//   { code: 'PKR', symbol: '₨' },      // Pakistani Rupee
//   { code: 'BDT', symbol: '৳' },      // Bangladeshi Taka
//   { code: 'LKR', symbol: 'Rs' },     // Sri Lankan Rupee
//   { code: 'MAD', symbol: 'د.م.' },   // Moroccan Dirham
//   { code: 'DZD', symbol: 'د.ج' },    // Algerian Dinar
//   { code: 'JOD', symbol: 'JD' },     // Jordanian Dinar
//   { code: 'KWD', symbol: 'KD' },     // Kuwaiti Dinar
//   { code: 'OMR', symbol: '﷼' },      // Omani Rial
// ];

// const currencies = [
//   { code: 'AOA', symbol: 'Kz' },     // Angolan Kwanza
//   { code: 'ARS', symbol: '$' },      // Argentine Peso
//   { code: 'AWG', symbol: 'ƒ' },      // Aruban Florin
//   { code: 'AZN', symbol: '₼' },      // Azerbaijani Manat
//   { code: 'BAM', symbol: 'KM' },     // Bosnian Mark
//   { code: 'BBD', symbol: 'Bds$' },   // Barbadian Dollar
//   { code: 'BGN', symbol: 'лв' },     // Bulgarian Lev
//   { code: 'BIF', symbol: 'FBu' },    // Burundian Franc
//   { code: 'BMD', symbol: '$' },      // Bermudian Dollar
//   { code: 'BND', symbol: 'B$' },     // Brunei Dollar
//   { code: 'BOB', symbol: 'Bs' },     // Bolivian Boliviano
//   { code: 'BSD', symbol: 'B$' },     // Bahamian Dollar
//   { code: 'BTN', symbol: 'Nu.' },    // Bhutanese Ngultrum
//   { code: 'BZD', symbol: 'BZ$' },    // Belize Dollar
//   { code: 'CDF', symbol: 'FC' },     // Congolese Franc
//   { code: 'CLP', symbol: '$' },      // Chilean Peso
//   { code: 'COP', symbol: '$' },      // Colombian Peso
//   { code: 'CRC', symbol: '₡' },      // Costa Rican Colón
//   { code: 'CUP', symbol: '₱' },      // Cuban Peso
//   { code: 'CVE', symbol: '$' },      // Cape Verdean Escudo
//   { code: 'DJF', symbol: 'Fdj' },    // Djiboutian Franc
//   { code: 'DOP', symbol: 'RD$' },    // Dominican Peso
//   { code: 'ERN', symbol: 'Nkf' },    // Eritrean Nakfa
//   { code: 'ETB', symbol: 'Br' },     // Ethiopian Birr
//   { code: 'FJD', symbol: 'FJ$' },    // Fijian Dollar
//   { code: 'FKP', symbol: '£' },      // Falkland Islands Pound
//   { code: 'GEL', symbol: '₾' },      // Georgian Lari
//   { code: 'GIP', symbol: '£' },      // Gibraltar Pound
//   { code: 'GMD', symbol: 'D' },      // Gambian Dalasi
//   { code: 'GNF', symbol: 'FG' },     // Guinean Franc
//   { code: 'GTQ', symbol: 'Q' },      // Guatemalan Quetzal
//   { code: 'GYD', symbol: 'G$' },     // Guyanese Dollar
//   { code: 'HNL', symbol: 'L' },      // Honduran Lempira
//   { code: 'HRK', symbol: 'kn' },     // Croatian Kuna
//   { code: 'HTG', symbol: 'G' },      // Haitian Gourde
//   { code: 'HUF', symbol: 'Ft' },     // Hungarian Forint
//   { code: 'ISK', symbol: 'kr' },     // Icelandic Krona
//   { code: 'IQD', symbol: 'ع.د' },    // Iraqi Dinar
//   { code: 'IRR', symbol: '﷼' },      // Iranian Rial
//   { code: 'JMD', symbol: 'J$' },     // Jamaican Dollar
//   { code: 'KGS', symbol: 'с' },      // Kyrgyzstani Som
//   { code: 'KHR', symbol: '៛' },      // Cambodian Riel
//   { code: 'KMF', symbol: 'CF' },     // Comorian Franc
//   { code: 'KPW', symbol: '₩' },      // North Korean Won
//   { code: 'KZT', symbol: '₸' },      // Kazakhstani Tenge
//   { code: 'LAK', symbol: '₭' },      // Lao Kip
//   { code: 'LBP', symbol: 'ل.ل' },    // Lebanese Pound
//   { code: 'LKR', symbol: 'Rs' },     // Sri Lankan Rupee
//   { code: 'LRD', symbol: 'L$' },     // Liberian Dollar
//   { code: 'LSL', symbol: 'M' },      // Lesotho Loti
//   { code: 'LYD', symbol: 'ل.د' },    // Libyan Dinar
//   { code: 'MAD', symbol: 'د.م.' },   // Moroccan Dirham
//   { code: 'MDL', symbol: 'L' },      // Moldovan Leu
//   { code: 'MGA', symbol: 'Ar' },     // Malagasy Ariary
//   { code: 'MKD', symbol: 'ден' },    // Macedonian Denar
//   { code: 'MMK', symbol: 'Ks' },     // Burmese Kyat
//   { code: 'MNT', symbol: '₮' },      // Mongolian Tögrög
//   { code: 'MOP', symbol: 'MOP$' },   // Macanese Pataca
//   { code: 'MRU', symbol: 'UM' },     // Mauritanian Ouguiya
//   { code: 'MUR', symbol: '₨' },      // Mauritian Rupee
//   { code: 'MVR', symbol: 'Rf' },     // Maldivian Rufiyaa
//   { code: 'MWK', symbol: 'MK' },     // Malawian Kwacha
//   { code: 'MZN', symbol: 'MT' },     // Mozambican Metical
//   { code: 'NAD', symbol: 'N$' },     // Namibian Dollar
//   { code: 'NIO', symbol: 'C$' },     // Nicaraguan Córdoba
//   { code: 'NPR', symbol: '₨' },      // Nepalese Rupee
//   { code: 'PAB', symbol: 'B/.' },    // Panamanian Balboa
//   { code: 'PEN', symbol: 'S/' },     // Peruvian Sol
//   { code: 'PGK', symbol: 'K' },      // Papua New Guinean Kina
//   { code: 'PYG', symbol: '₲' },      // Paraguayan Guarani
//   { code: 'RON', symbol: 'lei' },    // Romanian Leu
//   { code: 'RSD', symbol: 'din' },    // Serbian Dinar
//   { code: 'RWF', symbol: 'FRw' },    // Rwandan Franc
//   { code: 'SBD', symbol: 'SI$' },    // Solomon Islands Dollar
//   { code: 'SCR', symbol: '₨' },      // Seychellois Rupee
//   { code: 'SDG', symbol: 'ج.س' },    // Sudanese Pound
//   { code: 'SHP', symbol: '£' },      // Saint Helena Pound
//   { code: 'SLL', symbol: 'Le' },     // Sierra Leonean Leone
//   { code: 'SOS', symbol: 'Sh' },     // Somali Shilling
//   { code: 'SRD', symbol: 'SRD$' },   // Surinamese Dollar
//   { code: 'SSP', symbol: '£' },      // South Sudanese Pound
//   { code: 'STD', symbol: 'Db' },     // São Tomé Dobra (old)
//   { code: 'STN', symbol: 'Db' },     // São Tomé Dobra (new)
//   { code: 'SVC', symbol: '$' },      // Salvadoran Colón
//   { code: 'SYP', symbol: '£S' },     // Syrian Pound
//   { code: 'SZL', symbol: 'E' },      // Swazi Lilangeni
//   { code: 'TJS', symbol: 'ЅМ' },     // Tajikistani Somoni
//   { code: 'TMT', symbol: 'T' },      // Turkmenistani Manat
//   { code: 'TOP', symbol: 'T$' },     // Tongan Paʻanga
//   { code: 'TTD', symbol: 'TT$' },    // Trinidad and Tobago Dollar
//   { code: 'UAH', symbol: '₴' },      // Ukrainian Hryvnia
//   { code: 'UGX', symbol: 'USh' },    // Ugandan Shilling
//   { code: 'UYU', symbol: '$U' },     // Uruguayan Peso
//   { code: 'UZS', symbol: "so'm" },   // Uzbekistani Soʻm
//   { code: 'VUV', symbol: 'VT' },     // Vanuatu Vatu
//   { code: 'WST', symbol: 'WS$' },    // Samoan Tala
//   { code: 'XAF', symbol: 'CFA' },    // Central African CFA Franc
//   { code: 'XCD', symbol: 'EC$' },    // East Caribbean Dollar
//   { code: 'XOF', symbol: 'CFA' },    // West African CFA Franc
//   { code: 'YER', symbol: '﷼' },      // Yemeni Rial
//   { code: 'ZMW', symbol: 'ZK' },     // Zambian Kwacha
//   { code: 'ZWL', symbol: 'Z$' },     // Zimbabwean Dollar
// ];

//   for (const currency of currencies) {
//     await prisma.currency.upsert({
//       where: { code: currency.code },
//       update: {}, // do nothing if exists
//       create: {
//         code: currency.code,
//         symbol: currency.symbol,
//       },
//     });
//   }

//   console.log('✅ Currencies seeded successfully');
// }

// main()
//   .catch(e => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(() => prisma.$disconnect());


// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// const reminders = [
//   "None of us start with nothing.  What do you have in your hand right now that will help you with what you need to do today?",
//   "What 3 things do you need to focus on now to get you from HERE to THERE?",
//   "Who do you know that will help you, and who do you need to know?  Write down three names to focus on contacting.",
//   "At the heart of every project, every task is the WHY?  Ask yourself why this matters until you get to your passionate purpose.  Your passionate purpose is the fuel that gets the engine started, and the power and energy to keep going when you encounter challenges.",
//   "You can’t say “No” if you don’t have a bigger “Yes”.  What is your bigger “yes’”?  Focus on that.",
//   "How you THINK about money will affect how you FEEL about money which affects how you ACT with money.  Which negative mindset is influencing how you treat money right now?",
//   "How you THINK about money will affect how you FEEL about money which affects how you ACT with money.  Which leadership mindset do you need to start to use to lead your money well?",
//   "At the heart of every project, every task is the WHY?  Ask yourself why this matters until you get to your passionate purpose.  Your passionate purpose is the fuel that gets the engine started, and the power and energy to keep going when you encounter challenges.",
//   "Lead your money or your money will lead you.",
//   "Be proactive: budget before you spend.",
//   "Who can you partner with who can help you stay disciplined with your money?",
//   "What are you saving for?  Your bigger “Yes” helps you say “No” when temptation comes knocking.",
//   "If you’re finding there’s more month than money, what can you cut back, where can you save?  Why not use the Essentials, Cut Out and Cut back list to help you decide.",
//   "Performance (what I do) = Potential (what I could do) - interference (what stops me doing it)",
//   "What negative thoughts do you need to challenge and change to reduce the interference and unlock your potential?",
//   "Keep hold of your pen.  You have an amazing story that is waiting to be written.",
//   "See yourself as a leader. You can do this.",
//   "What do you need to focus on today to be able to write the story you want to write?",
//   "When something’s not working, change something.  What’s one thing you can change today?",
//   "Leaders see and take responsibility.  What can you see that needs sorting today?  See it and sort it."
// ];

// async function main() {
//   // Upsert so you can run seed multiple times without duplicates
//   await prisma.customReminder.upsert({
//     where: { key: 'GOAL_INCOMPLETE_REMINDER' },
//     update: { content: reminders },
//     create: {
//       key: 'GOAL_INCOMPLETE_REMINDER',
//       content: reminders,
//     },
//   });

//   console.log('✅ Custom reminders seeded successfully.');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// const categories = [
//   {
//     title: "Set goals for your personal development",
//     description: "Set goals for your personal development",
//     icon: "assets/icons/personal_development/personal_development_1.png",
//   },
//   {
//     title: "Health and wellbeing",
//     description: "Set goals for your health and wellness",
//     icon: "assets/icons/health/health_1.png",
//   },
//   {
//     title: "Family",
//     description: "Set goals for your family",
//     icon: "assets/icons/family/family_1.png",
//   },
//   {
//     title: "Education",
//     description: "Set goals for your education",
//     icon: "assets/icons/education/education_1.png",
//   },
//   {
//     title: "Entrepreneurship",
//     description: "Set goals for your entrepreneurship goals",
//     icon: "assets/icons/entrepreneurship/entrepreneurship_1.png",
//   },
//   {
//     title: "Career development",
//     description: "Set goals for your career development",
//     icon: "assets/icons/career/career_1.png",
//   },
//   {
//     title: "Community",
//     description: "Set goals for your community",
//     icon: "assets/icons/community/community_1.png",
//   },
//   {
//     title: "Financial growth",
//     description: "Set goals for financial freedom",
//     icon: "assets/icons/financial/financial_1.png",
//   },
// ];

// async function seedCategories() {
//   console.log("🌱 Seeding Default Categories...");

//   for (const cat of categories) {
//     const existing = await prisma.category.findFirst({
//       where: {
//         title: cat.title,
//         defaultCate: true,
//         userId: null, // system category
//       },
//     });

//     if (existing) {
//       await prisma.category.update({
//         where: { id: existing.id },
//         data: {
//           description: cat.description,
//           icon: cat.icon,
//         },
//       });
//       console.log("✔ Updated:", cat.title);
//     } else {
//       await prisma.category.create({
//         data: {
//           title: cat.title,
//           description: cat.description,
//           icon: cat.icon,
//           defaultCate: true,
//           userId: null,
//         },
//       });
//       console.log("➕ Inserted:", cat.title);
//     }
//   }

//   console.log("✅ Default categories seeded safely.");
// }

// seedCategories()
//   .catch(console.error)
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main() {
//   // --- Upsert Groups ---
//   const generalGroup = await prisma.mindsetGroup.upsert({
//     where: { name: 'General' },
//     update: { intervalDays: 7 },
//     create: { name: 'General', intervalDays: 7 },
//   });

//   const negativeGroup = await prisma.mindsetGroup.upsert({
//     where: { name: '7 Negative Mindsets' },
//     update: { intervalDays: 14 },
//     create: { name: '7 Negative Mindsets', intervalDays: 14 },
//   });

//   const leadershipGroup = await prisma.mindsetGroup.upsert({
//     where: { name: '7 Leadership Mindsets' },
//     update: { intervalDays: 30 },
//     create: { name: '7 Leadership Mindsets', intervalDays: 30 },
//   });

//   // --- General Cards ---
//   const generalItems = [
//     'You don’t need to wait for others. You can sort this out.',
//     'Who are your partnering with to write your story?',
//     'Lift Up Your Head! Live like an eagle, not like a chicken.',
//     'What do you have in your hand right now to help get you started?',
//     'What went well today? What would even better look like?',
//     'Keep hold of your pen.',
//     'See yourself as a leader. You can do this.',
//     'Performance (what I do) = Potential (what I could do) - interference (what stops me doing it).',
//     'What negative thoughts can you challenge and change to reduce the interference and unlock your potential?',
//     'What can you focus on today to be able to write the story you want to write?',
//     'Leaders see and take responsibility. What can you see that needs sorting today? See it and sort it.'
//   ];

//   for (let i = 0; i < generalItems.length; i++) {
//     await prisma.mindsetItem.upsert({
//       where: { id: `${generalGroup.id}-${i + 1}` },
//       update: { text: generalItems[i], order: i + 1 },
//       create: {
//         id: `${generalGroup.id}-${i + 1}`,
//         groupId: generalGroup.id,
//         order: i + 1,
//         text: generalItems[i],
//       },
//     });
//   }

//   // --- 7 Negative Mindsets Cards ---
//   const negativeItems = [
//     'HOPELESS THINKING: "I can\'t!" "Nothing ever works out for me" → I CAN, I WILL, I\'LL FIND A WAY.',
//     'LAZY THINKING: "I can\'t be bothered" → I WILL MAKE THE EFFORT.',
//     'FIXED THINKING: "It’s just the way I am" → I WILL TAKE THE RISK TO GROW.',
//     'RECYCLED THINKING: "I can only think of one solution" → I CAN THINK NEW THOUGHTS; I WILL FIND NEW SOLUTIONS.',
//     'SELF THINKING: "It’s my turn to eat" → LET’S ALL EAT.',
//     'STUCK THINKING: "I’ll wait for others to fix things" → I WILL SORT THIS OUT.',
//     'UNFINISHED THINKING: "I might start but I won’t finish" → WHEN IT GETS TOUGH, I’LL KEEP GOING.'
//   ];

//   for (let i = 0; i < negativeItems.length; i++) {
//     await prisma.mindsetItem.upsert({
//       where: { id: `${negativeGroup.id}-${i + 1}` },
//       update: { text: negativeItems[i], order: i + 1 },
//       create: {
//         id: `${negativeGroup.id}-${i + 1}`,
//         groupId: negativeGroup.id,
//         order: i + 1,
//         text: negativeItems[i],
//       },
//     });
//   }

//   // --- 7 Leadership Mindsets Cards ---
//   const leadershipItems = [
//     'Lift up your head. Why live as a chicken when you are really an eagle? See opportunities you can take & challenges you need to navigate.',
//     'See Yourself as a Leader. How you see yourself determines how you act. Admit / Ask / Act.',
//     'Be Proactive. Live life on the front foot. What can I do NOW, so I am ready for what is coming in the future?',
//     'See and take responsibility. What do you see in your life, family, community that is not okay that YOU could do something about?',
//     'Change Something. What is not working in your life that you need to change?',
//     'Focus. The more you focus, the less interference! What do you need to focus on today to enable you to write the story you want to write?',
//     'Appreciative Thinking. DISCOVERY: What went well? DREAMING: What does it look like if it went even better?'
//   ];

//   for (let i = 0; i < leadershipItems.length; i++) {
//     await prisma.mindsetItem.upsert({
//       where: { id: `${leadershipGroup.id}-${i + 1}` },
//       update: { text: leadershipItems[i], order: i + 1 },
//       create: {
//         id: `${leadershipGroup.id}-${i + 1}`,
//         groupId: leadershipGroup.id,
//         order: i + 1,
//         text: leadershipItems[i],
//       },
//     });
//   }

//   console.log('Mindsets upserted successfully!');
// }

// main()
//   .catch(e => console.error(e))
//   .finally(() => prisma.$disconnect());


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany(); // or pick specific users

  const messages = [
    "Saving towards your Bigger Yes!",
    "You made it to your target! Go use that money to write the next chapter of your story, however big or small. And celebrate. You did it!",
    "Now that you’ve hit that target, what else can you be saving towards? What is your medium or long term goal?",
    "Small changes make a BIG difference. Congratulations!",
    "Remember, you’ve got this. You’re saving towards that Bigger Yes!",
    "If we don’t lead our finances our finances will lead us",
    "In order to lead our money, we must first lead ourselves."
  ];

  for (const user of users) {
    const notifications = messages.map((body) => ({
      userId: user.id,
      title: 'Budget Notification',
      body,
      type: 'SAVINGS_TARGET'
    }));

    await prisma.budgetNotification.createMany({
      data: notifications,
      skipDuplicates: true, // won't create duplicates if rerun
    });
  }

  console.log('Budget notifications seeded successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   const users = await prisma.user.findMany();

//   const messages = [
//     'Be proactive. What step can you take now to help you move forward?',
//     'You’ve taken the next step in your project. Keep on going. You’ve got this.',
//     'You’re staying focused and right on target.',
//     'You’re writing the next chapter of your story, despite the challenges along the way.',
//     'Now you’ve completed that goal, what else do you want to achieve?',
//     'Where is your next “THERE”?',
//     'Take some time to celebrate, and to thank those that helped along the way.',
//     'You’re moving in the right direction. What is your next step from here to there?',
//     'What new skills, resources, people or experience do you need for the next step in your journey?',
//     'Go back to your WHY and remember what’s at the heart of all this.',
//     'Who are the people you know and need to know that can help you write the next steps of your goal?',
//   ];

//   for (const user of users) {
//     const notifications = messages.map((body) => ({
//       userId: user.id,
//       title: 'Goal Notification',
//       body,
//       type: 'GOAL_MOTIVATION',
//     }));

//     await prisma.goalNotification.createMany({
//       data: notifications,
//       skipDuplicates: true,
//     });
//   }

//   console.log('Goal notifications seeded successfully!');
// }

// main()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());
