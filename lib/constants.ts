export const COMPANY_INFO = {
  name: 'SMART CROWD',
  nameAr: 'سمارت إدارة الحشود',
  email: 'Info@smartcrowdme.com',
  phone: '0580112052',
  address: 'Al-Rusaifah, Third Ring Road – Al-Sharif Yahya Tower, Makkah',
  website: 'https://hthkia.com',
  social: {
    instagram: '@SMARTCROWD.SA',
    twitter: '@SMARTCROWD.SA',
    snapchat: '@SMARTCROWD.SA',
  },
};

export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];



