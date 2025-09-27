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