import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
const currencies = [
  { code: 'USD', symbol: '$' },      // US Dollar
  { code: 'EUR', symbol: '€' },      // Euro
  { code: 'JPY', symbol: '¥' },      // Japanese Yen
  { code: 'GBP', symbol: '£' },      // British Pound
  { code: 'AUD', symbol: 'A$' },     // Australian Dollar
  { code: 'CAD', symbol: 'C$' },     // Canadian Dollar
  { code: 'CHF', symbol: 'CHF' },    // Swiss Franc
  { code: 'CNY', symbol: '¥' },      // Chinese Yuan
  { code: 'HKD', symbol: 'HK$' },    // Hong Kong Dollar
  { code: 'SGD', symbol: 'S$' },     // Singapore Dollar
  { code: 'INR', symbol: '₹' },      // Indian Rupee
  { code: 'KRW', symbol: '₩' },      // South Korean Won
  { code: 'BRL', symbol: 'R$' },     // Brazilian Real
  { code: 'ZAR', symbol: 'R' },      // South African Rand
  { code: 'SEK', symbol: 'kr' },     // Swedish Krona
  { code: 'NOK', symbol: 'kr' },     // Norwegian Krone
  { code: 'DKK', symbol: 'kr' },     // Danish Krone
  { code: 'RUB', symbol: '₽' },      // Russian Ruble
  { code: 'MXN', symbol: 'Mex$' },   // Mexican Peso
  { code: 'IDR', symbol: 'Rp' },     // Indonesian Rupiah
  { code: 'TRY', symbol: '₺' },      // Turkish Lira
  { code: 'PLN', symbol: 'zł' },     // Polish Zloty
  { code: 'THB', symbol: '฿' },      // Thai Baht
  { code: 'TWD', symbol: 'NT$' },    // New Taiwan Dollar
  { code: 'MYR', symbol: 'RM' },     // Malaysian Ringgit
  { code: 'VND', symbol: '₫' },      // Vietnamese Dong
  { code: 'SAR', symbol: '﷼' },      // Saudi Riyal
  { code: 'AED', symbol: 'د.إ' },    // UAE Dirham
  { code: 'EGP', symbol: 'E£' },     // Egyptian Pound
  { code: 'NGN', symbol: '₦' },      // Nigerian Naira
  { code: 'GHS', symbol: '₵' },      // Ghanaian Cedi
  { code: 'KES', symbol: 'KSh' },    // Kenyan Shilling
  { code: 'TZS', symbol: 'TSh' },    // Tanzanian Shilling
  { code: 'UGX', symbol: 'USh' },    // Ugandan Shilling
  { code: 'XOF', symbol: 'CFA' },    // West African CFA Franc
  { code: 'XAF', symbol: 'CFA' },    // Central African CFA Franc
  { code: 'BWP', symbol: 'P' },      // Botswana Pula
  { code: 'LSL', symbol: 'M' },      // Lesotho Loti
  { code: 'MZN', symbol: 'MT' },     // Mozambican Metical
  { code: 'BHD', symbol: '.د.ب' },   // Bahraini Dinar
  { code: 'QAR', symbol: '﷼' },      // Qatari Riyal
  { code: 'PKR', symbol: '₨' },      // Pakistani Rupee
  { code: 'BDT', symbol: '৳' },      // Bangladeshi Taka
  { code: 'LKR', symbol: 'Rs' },     // Sri Lankan Rupee
  { code: 'MAD', symbol: 'د.م.' },   // Moroccan Dirham
  { code: 'DZD', symbol: 'د.ج' },    // Algerian Dinar
  { code: 'JOD', symbol: 'JD' },     // Jordanian Dinar
  { code: 'KWD', symbol: 'KD' },     // Kuwaiti Dinar
  { code: 'OMR', symbol: '﷼' },      // Omani Rial
];

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

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {}, // do nothing if exists
      create: {
        code: currency.code,
        symbol: currency.symbol,
      },
    });
  }

  console.log('✅ Currencies seeded successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
