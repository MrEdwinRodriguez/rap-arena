const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const countries = [
  { id: 1, name: 'United States', code: 'US' },
  { id: 2, name: 'Canada', code: 'CA' },
  { id: 3, name: 'United Kingdom', code: 'GB' },
  { id: 4, name: 'Australia', code: 'AU' },
  { id: 5, name: 'Germany', code: 'DE' },
  { id: 6, name: 'France', code: 'FR' },
  { id: 7, name: 'Japan', code: 'JP' },
  { id: 8, name: 'Brazil', code: 'BR' },
  { id: 9, name: 'Mexico', code: 'MX' },
  { id: 10, name: 'India', code: 'IN' },
  { id: 11, name: 'China', code: 'CN' },
  { id: 12, name: 'South Korea', code: 'KR' },
  { id: 13, name: 'Italy', code: 'IT' },
  { id: 14, name: 'Spain', code: 'ES' },
  { id: 15, name: 'Netherlands', code: 'NL' },
  { id: 16, name: 'Sweden', code: 'SE' },
  { id: 17, name: 'Norway', code: 'NO' },
  { id: 18, name: 'Denmark', code: 'DK' },
  { id: 19, name: 'Finland', code: 'FI' },
  { id: 20, name: 'Switzerland', code: 'CH' },
  
  // Central America
  { id: 21, name: 'Belize', code: 'BZ' },
  { id: 22, name: 'Costa Rica', code: 'CR' },
  { id: 23, name: 'El Salvador', code: 'SV' },
  { id: 24, name: 'Guatemala', code: 'GT' },
  { id: 25, name: 'Honduras', code: 'HN' },
  { id: 26, name: 'Nicaragua', code: 'NI' },
  { id: 27, name: 'Panama', code: 'PA' },
  
  // South America
  { id: 28, name: 'Argentina', code: 'AR' },
  { id: 29, name: 'Bolivia', code: 'BO' },
  { id: 30, name: 'Chile', code: 'CL' },
  { id: 31, name: 'Colombia', code: 'CO' },
  { id: 32, name: 'Ecuador', code: 'EC' },
  { id: 33, name: 'Guyana', code: 'GY' },
  { id: 34, name: 'Paraguay', code: 'PY' },
  { id: 35, name: 'Peru', code: 'PE' },
  { id: 36, name: 'Suriname', code: 'SR' },
  { id: 37, name: 'Uruguay', code: 'UY' },
  { id: 38, name: 'Venezuela', code: 'VE' },
  { id: 39, name: 'French Guiana', code: 'GF' },
  
  // Caribbean Islands
  { id: 40, name: 'Antigua and Barbuda', code: 'AG' },
  { id: 41, name: 'Aruba', code: 'AW' },
  { id: 42, name: 'Bahamas', code: 'BS' },
  { id: 43, name: 'Barbados', code: 'BB' },
  { id: 44, name: 'Bonaire', code: 'BQ' },
  { id: 45, name: 'British Virgin Islands', code: 'VG' },
  { id: 46, name: 'Cayman Islands', code: 'KY' },
  { id: 47, name: 'Cuba', code: 'CU' },
  { id: 48, name: 'Curaçao', code: 'CW' },
  { id: 49, name: 'Dominica', code: 'DM' },
  { id: 50, name: 'Dominican Republic', code: 'DO' },
  { id: 51, name: 'Grenada', code: 'GD' },
  { id: 52, name: 'Guadeloupe', code: 'GP' },
  { id: 53, name: 'Haiti', code: 'HT' },
  { id: 54, name: 'Jamaica', code: 'JM' },
  { id: 55, name: 'Martinique', code: 'MQ' },
  { id: 56, name: 'Montserrat', code: 'MS' },
  { id: 57, name: 'Saint Barthélemy', code: 'BL' },
  { id: 58, name: 'Saint Kitts and Nevis', code: 'KN' },
  { id: 59, name: 'Saint Lucia', code: 'LC' },
  { id: 60, name: 'Saint Martin', code: 'MF' },
  { id: 61, name: 'Saint Vincent and the Grenadines', code: 'VC' },
  { id: 62, name: 'Sint Maarten', code: 'SX' },
  { id: 63, name: 'Trinidad and Tobago', code: 'TT' },
  { id: 64, name: 'Turks and Caicos Islands', code: 'TC' },
  { id: 65, name: 'U.S. Virgin Islands', code: 'VI' },
];

const usStates = [
  { id: 1, name: 'Alabama', code: 'AL', countryId: 1 },
  { id: 2, name: 'Alaska', code: 'AK', countryId: 1 },
  { id: 3, name: 'Arizona', code: 'AZ', countryId: 1 },
  { id: 4, name: 'Arkansas', code: 'AR', countryId: 1 },
  { id: 5, name: 'California', code: 'CA', countryId: 1 },
  { id: 6, name: 'Colorado', code: 'CO', countryId: 1 },
  { id: 7, name: 'Connecticut', code: 'CT', countryId: 1 },
  { id: 8, name: 'Delaware', code: 'DE', countryId: 1 },
  { id: 9, name: 'Florida', code: 'FL', countryId: 1 },
  { id: 10, name: 'Georgia', code: 'GA', countryId: 1 },
  { id: 11, name: 'Hawaii', code: 'HI', countryId: 1 },
  { id: 12, name: 'Idaho', code: 'ID', countryId: 1 },
  { id: 13, name: 'Illinois', code: 'IL', countryId: 1 },
  { id: 14, name: 'Indiana', code: 'IN', countryId: 1 },
  { id: 15, name: 'Iowa', code: 'IA', countryId: 1 },
  { id: 16, name: 'Kansas', code: 'KS', countryId: 1 },
  { id: 17, name: 'Kentucky', code: 'KY', countryId: 1 },
  { id: 18, name: 'Louisiana', code: 'LA', countryId: 1 },
  { id: 19, name: 'Maine', code: 'ME', countryId: 1 },
  { id: 20, name: 'Maryland', code: 'MD', countryId: 1 },
  { id: 21, name: 'Massachusetts', code: 'MA', countryId: 1 },
  { id: 22, name: 'Michigan', code: 'MI', countryId: 1 },
  { id: 23, name: 'Minnesota', code: 'MN', countryId: 1 },
  { id: 24, name: 'Mississippi', code: 'MS', countryId: 1 },
  { id: 25, name: 'Missouri', code: 'MO', countryId: 1 },
  { id: 26, name: 'Montana', code: 'MT', countryId: 1 },
  { id: 27, name: 'Nebraska', code: 'NE', countryId: 1 },
  { id: 28, name: 'Nevada', code: 'NV', countryId: 1 },
  { id: 29, name: 'New Hampshire', code: 'NH', countryId: 1 },
  { id: 30, name: 'New Jersey', code: 'NJ', countryId: 1 },
  { id: 31, name: 'New Mexico', code: 'NM', countryId: 1 },
  { id: 32, name: 'New York', code: 'NY', countryId: 1 },
  { id: 33, name: 'North Carolina', code: 'NC', countryId: 1 },
  { id: 34, name: 'North Dakota', code: 'ND', countryId: 1 },
  { id: 35, name: 'Ohio', code: 'OH', countryId: 1 },
  { id: 36, name: 'Oklahoma', code: 'OK', countryId: 1 },
  { id: 37, name: 'Oregon', code: 'OR', countryId: 1 },
  { id: 38, name: 'Pennsylvania', code: 'PA', countryId: 1 },
  { id: 39, name: 'Rhode Island', code: 'RI', countryId: 1 },
  { id: 40, name: 'South Carolina', code: 'SC', countryId: 1 },
  { id: 41, name: 'South Dakota', code: 'SD', countryId: 1 },
  { id: 42, name: 'Tennessee', code: 'TN', countryId: 1 },
  { id: 43, name: 'Texas', code: 'TX', countryId: 1 },
  { id: 44, name: 'Utah', code: 'UT', countryId: 1 },
  { id: 45, name: 'Vermont', code: 'VT', countryId: 1 },
  { id: 46, name: 'Virginia', code: 'VA', countryId: 1 },
  { id: 47, name: 'Washington', code: 'WA', countryId: 1 },
  { id: 48, name: 'West Virginia', code: 'WV', countryId: 1 },
  { id: 49, name: 'Wisconsin', code: 'WI', countryId: 1 },
  { id: 50, name: 'Wyoming', code: 'WY', countryId: 1 },
];

async function seedCountriesAndStates() {
  try {
    console.log('🌍 Seeding countries...');
    
    // Insert countries
    for (const country of countries) {
      await prisma.country.upsert({
        where: { id: country.id },
        update: {},
        create: country,
      });
    }

    console.log('🇺🇸 Seeding US states...');
    
    // Insert US states
    for (const state of usStates) {
      await prisma.state.upsert({
        where: { id: state.id },
        update: {},
        create: state,
      });
    }

    console.log('✅ Successfully seeded countries and states!');
    console.log(`📊 Inserted ${countries.length} countries and ${usStates.length} US states`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCountriesAndStates(); 