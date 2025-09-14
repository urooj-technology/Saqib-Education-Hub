const { Province } = require('../models');

async function seedProvinces() {
  try {
    console.log('Seeding provinces...');
    
    const provinces = [
      { name: 'Kabul', code: 'KBL', country: 'Afghanistan' },
      { name: 'Kandahar', code: 'KDR', country: 'Afghanistan' },
      { name: 'Herat', code: 'HRT', country: 'Afghanistan' },
      { name: 'Nangarhar', code: 'NGR', country: 'Afghanistan' },
      { name: 'Balkh', code: 'BLK', country: 'Afghanistan' },
      { name: 'Kunduz', code: 'KDZ', country: 'Afghanistan' },
      { name: 'Baghlan', code: 'BGL', country: 'Afghanistan' },
      { name: 'Badakhshan', code: 'BDK', country: 'Afghanistan' },
      { name: 'Takhar', code: 'TKR', country: 'Afghanistan' },
      { name: 'Faryab', code: 'FYB', country: 'Afghanistan' },
      { name: 'Jowzjan', code: 'JWZ', country: 'Afghanistan' },
      { name: 'Sar-e Pol', code: 'SRP', country: 'Afghanistan' },
      { name: 'Samangan', code: 'SMG', country: 'Afghanistan' },
      { name: 'Bamyan', code: 'BMY', country: 'Afghanistan' },
      { name: 'Wardak', code: 'WRK', country: 'Afghanistan' },
      { name: 'Logar', code: 'LGR', country: 'Afghanistan' },
      { name: 'Paktia', code: 'PKT', country: 'Afghanistan' },
      { name: 'Paktika', code: 'PKK', country: 'Afghanistan' },
      { name: 'Khost', code: 'KST', country: 'Afghanistan' },
      { name: 'Ghazni', code: 'GZN', country: 'Afghanistan' },
      { name: 'Zabul', code: 'ZBL', country: 'Afghanistan' },
      { name: 'Uruzgan', code: 'URZ', country: 'Afghanistan' },
      { name: 'Helmand', code: 'HLM', country: 'Afghanistan' },
      { name: 'Nimroz', code: 'NMR', country: 'Afghanistan' },
      { name: 'Farah', code: 'FRH', country: 'Afghanistan' },
      { name: 'Ghor', code: 'GHR', country: 'Afghanistan' },
      { name: 'Daykundi', code: 'DYK', country: 'Afghanistan' },
      { name: 'Kunar', code: 'KNR', country: 'Afghanistan' },
      { name: 'Laghman', code: 'LGM', country: 'Afghanistan' },
      { name: 'Panjshir', code: 'PJS', country: 'Afghanistan' },
      { name: 'Kapisa', code: 'KPS', country: 'Afghanistan' },
      { name: 'Parwan', code: 'PRW', country: 'Afghanistan' },
      { name: 'Maidan Wardak', code: 'MDW', country: 'Afghanistan' },
      { name: 'Nuristan', code: 'NRS', country: 'Afghanistan' }
    ];

    // Create provinces
    for (const provinceInfo of provinces) {
      await Province.findOrCreate({
        where: { name: provinceInfo.name },
        defaults: provinceInfo
      });
    }

    console.log(`✅ Created ${provinces.length} provinces`);
  } catch (error) {
    console.error('❌ Error seeding provinces:', error);
    throw error;
  }
}

module.exports = seedProvinces;
