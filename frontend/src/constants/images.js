const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`;

const VEHICLE_IMAGES = {
  // ── BMW ──
  'bmw-m4-competition': U('1776380736529-73da3674e036'),
  'bmw-m3-competition': U('3fKZm3KDcXM'),
  'bmw-x5': U('1635990215241-4d2805d729bb'),
  'bmw-x7': U('rCYW2bFXXvQ'),
  'bmw-i4': U('1751467948938-09cfc4d70a25'),
  'bmw-ix': U('q6Oj9ladM7Y'),

  'bmw': U('1776380736529-73da3674e036'),

  // ── Mercedes-Benz ──
  'mercedes-benz-c-class': U('1595418595204-fb0e7391647e'),
  'mercedes-benz-e-class': U('1616549934892-595cbeb38ef5'),
  'mercedes-benz-gle': U('1635990215241-4d2805d729bb'),
  'mercedes-benz-gls': U('nCeBY2Dt6V8'),
  'mercedes-benz-amg-gt': U('PxsKpeYBxiE'),
  'mercedes-amg-gt': U('PxsKpeYBxiE'),

  'mercedes-benz': U('1595418595204-fb0e7391647e'),
  'mercedes': U('1595418595204-fb0e7391647e'),

  // ── Audi ──
  'audi-a4': U('1606455732352-c62090607402'),
  'audi-a6': U('1606455732352-c62090607402'),
  'audi-q5': U('1606455732352-c62090607402'),
  'audi-q7': U('1606455732352-c62090607402'),
  'audi-e-tron-gt': U('1606455732352-c62090607402'),

  'audi': U('1606455732352-c62090607402'),

  // ── Toyota ──
  'toyota-land-cruiser': U('9792f2a3b18a0ea8c26b4e4d371d5516'),
  'toyota-camry': U('1547444866-b54ca0a611b9'),
  'toyota-corolla': U('1753440532990-ca0c6fedda01'),
  'toyota-fortuner': U('9792f2a3b18a0ea8c26b4e4d371d5516'),
  'toyota-hilux': U('1635990215241-4d2805d729bb'),
  'toyota-prius': U('MFU3EdWAc10'),

  'toyota': U('1753440532990-ca0c6fedda01'),

  // ── Honda ──
  'honda-civic': U('1750048860015-d43701535a79'),
  'honda-city': U('1750048860015-d43701535a79'),
  'honda-accord': U('1750048860015-d43701535a79'),
  'honda-cr-v': U('1750048860015-d43701535a79'),
  'honda-hr-v': U('1750048860015-d43701535a79'),

  'honda': U('1750048860015-d43701535a79'),

  // ── Hyundai ──
  'hyundai-creta': U('1769500152152-e8be7458316c'),
  'hyundai-tucson': U('1704940225548-1420f7fed72f'),
  'hyundai-verna': U('1769500152152-e8be7458316c'),
  'hyundai-ioniq-5': U('1769500152152-e8be7458316c'),
  'hyundai-venue': U('1704940225548-1420f7fed72f'),

  'hyundai': U('1769500152152-e8be7458316c'),

  // ── Kia ──
  'kia-seltos': U('9cIClSZGllA'),
  'kia-sonet': U('9cIClSZGllA'),
  'kia-ev6': U('BJN9tF9iraE'),
  'kia-carnival': U('9cIClSZGllA'),

  'kia': U('9cIClSZGllA'),

  // ── Mahindra ──
  'mahindra-xuv700': U('1635990215241-4d2805d729bb'),
  'mahindra-scorpio-n': U('rCYW2bFXXvQ'),
  'mahindra-thar': U('1703609645513-9c7b5a965add'),
  'mahindra-be-6': U('1703609645513-9c7b5a965add'),

  'mahindra': U('1703609645513-9c7b5a965add'),

  // ── Tata ──
  'tata-harrier': U('1635990215241-4d2805d729bb'),
  'tata-safari': U('1635990215241-4d2805d729bb'),
  'tata-nexon': U('1566223831052-0950aee82567'),
  'tata-curvv-ev': U('1566223831052-0950aee82567'),
  'tata-punch': U('1566223831052-0950aee82567'),

  'tata': U('1566223831052-0950aee82567'),

  // ── Volkswagen ──
  'volkswagen-polo': U('1541899481282-d53bffe3c35d'),
  'volkswagen-virtus': U('1541899481282-d53bffe3c35d'),
  'volkswagen-taigun': U('1753803932015-b8f45c1a6043'),
  'volkswagen-tiguan': U('1753803932015-b8f45c1a6043'),

  'volkswagen': U('1541899481282-d53bffe3c35d'),
  'vw': U('1541899481282-d53bffe3c35d'),

  // ── Skoda ──
  'skoda-slavia': U('1563207770-2194b28bc651'),
  'skoda-kushaq': U('1563207770-2194b28bc651'),
  'skoda-octavia': U('1563207770-2194b28bc651'),
  'skoda-superb': U('1563207770-2194b28bc651'),

  'skoda': U('1563207770-2194b28bc651'),

  // ── Ford ──
  'ford-mustang-gt': U('DppydBEkmkc'),
  'ford-ranger': U('DppydBEkmkc'),
  'ford-everest': U('DppydBEkmkc'),

  'ford': U('DppydBEkmkc'),

  // ── Chevrolet ──
  'chevrolet-camaro': U('1629843932438-64f903debed0'),
  'chevrolet-corvette-c8': U('1629843932438-64f903debed0'),
  'chevrolet-tahoe': U('1635990215241-4d2805d729bb'),

  'chevrolet': U('1629843932438-64f903debed0'),
  'chevy': U('1629843932438-64f903debed0'),

  // ── Nissan ──
  'nissan-gt-r': U('Affhul1fVxE'),
  'nissan-x-trail': U('1635990215241-4d2805d729bb'),
  'nissan-patrol': U('1635990215241-4d2805d729bb'),

  'nissan': U('Affhul1fVxE'),

  // ── Jeep ──
  'jeep-wrangler': U('rCYW2bFXXvQ'),
  'jeep-compass': U('rCYW2bFXXvQ'),
  'jeep-grand-cherokee': U('1635990215241-4d2805d729bb'),

  'jeep': U('rCYW2bFXXvQ'),

  // ── Lexus ──
  'lexus-es': U('MFU3EdWAc10'),
  'lexus-rx': U('1635990215241-4d2805d729bb'),
  'lexus-lx': U('rCYW2bFXXvQ'),

  'lexus': U('MFU3EdWAc10'),

  // ── Volvo ──
  'volvo-xc60': U('1635990215241-4d2805d729bb'),
  'volvo-xc90': U('1635990215241-4d2805d729bb'),
  'volvo-s90': U('MFU3EdWAc10'),

  'volvo': U('1635990215241-4d2805d729bb'),

  // ── Porsche ──
  'porsche-911-carrera': U('1611157816410-6a6b31ee255e'),
  'porsche-cayenne': U('1769697013524-b42d45bcb2f2'),
  'porsche-macan': U('1769697013524-b42d45bcb2f2'),
  'porsche-taycan': U('1769697013524-b42d45bcb2f2'),

  'porsche': U('1769697013524-b42d45bcb2f2'),

  // ── Ferrari ──
  'ferrari-sf90-stradale': U('DppydBEkmkc'),
  'ferrari-296-gtb': U('DppydBEkmkc'),

  'ferrari': U('DppydBEkmkc'),

  // ── Lamborghini ──
  'lamborghini-huracan': U('Affhul1fVxE'),
  'lamborghini-revuelto': U('Affhul1fVxE'),

  'lamborghini': U('Affhul1fVxE'),

  // ── McLaren ──
  'mclaren-720s': U('1748091677506-6d7147d3b688'),
  'mclaren-artura': U('1748091677506-6d7147d3b688'),

  'mclaren': U('1748091677506-6d7147d3b688'),

  // ── Tesla ──
  'tesla-model-3': U('cRXYSQO8eGY'),
  'tesla-model-s': U('cRXYSQO8eGY'),
  'tesla-model-x': U('cRXYSQO8eGY'),
  'tesla-model-y': U('cRXYSQO8eGY'),
  'tesla-cybertruck': U('cRXYSQO8eGY'),

  'tesla': U('cRXYSQO8eGY'),

  // ── BYD ──
  'byd-seal': U('1760435107985-40b6872c8c97'),
  'byd-atto-3': U('1760435107985-40b6872c8c97'),

  'byd': U('1760435107985-40b6872c8c97'),

  // ── MG ──
  'mg-hector': U('1635990215241-4d2805d729bb'),
  'mg-astor': U('1635990215241-4d2805d729bb'),
  'mg-zs-ev': U('1635990215241-4d2805d729bb'),
  'mg-windsor-ev': U('1635990215241-4d2805d729bb'),

  'mg': U('1635990215241-4d2805d729bb'),

  // ── Legacy brands from seed data ──
  'mazda': U('DppydBEkmkc'),
  'subaru': U('1635990215241-4d2805d729bb'),
  'ram': U('rCYW2bFXXvQ'),
  'fiat': U('SuD4h8Gpgok'),

  // ── Category fallbacks ──
  sedan: U('1776380736529-73da3674e036'),
  suv: U('1635990215241-4d2805d729bb'),
  truck: U('rCYW2bFXXvQ'),
  coupe: U('1776380736529-73da3674e036'),
  convertible: U('DppydBEkmkc'),
  hatchback: U('SuD4h8Gpgok'),
  van: U('rCYW2bFXXvQ'),
  wagon: U('1635990215241-4d2805d729bb'),
  electric: U('cRXYSQO8eGY'),
  hybrid: U('MFU3EdWAc10'),
};

export const BG_IMAGES = {
  login: 'https://images.unsplash.com/photo-1767907571229-01cf4ba03590?auto=format&fit=crop&w=1920&q=80',
  register: 'https://images.unsplash.com/photo-1774203290850-7c846edc9039?auto=format&fit=crop&w=1920&q=80',
  dashboard: 'https://images.unsplash.com/photo-1779599507352-1e6e736b3f5f?auto=format&fit=crop&w=1920&q=80',
  admin: 'https://images.unsplash.com/photo-1755288348267-3b8bf38e7961?auto=format&fit=crop&w=1920&q=80',
};

function normalizeKey(make, model) {
  const m = String(make || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const mo = String(model || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${m}-${mo}`;
}

export function getVehicleImage(make, model) {
  const key = normalizeKey(make, model);
  if (VEHICLE_IMAGES[key]) return VEHICLE_IMAGES[key];

  const brand = String(make || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (VEHICLE_IMAGES[brand]) return VEHICLE_IMAGES[brand];

  return VEHICLE_IMAGES.sedan;
}
