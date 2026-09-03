import { Vehicle } from '../types';

/**
 * Consistently formats Ethiopian Birr prices throughout the Kairos Addis platform.
 * Standard format: "ETB 5,000,000"
 */
export function formatETBPrice(price?: number | null, fallback = 'ETB Price Pending Configuration'): string {
  if (typeof price === 'number' && price > 0) {
    return `ETB ${price.toLocaleString()}`;
  }
  return fallback;
}

export const VEHICLES: Vehicle[] = [
  {
    id: 'byd-tang-l',
    name: 'BYD TANG L',
    brand: 'BYD',
    category: 'Premium 7-Seater Electric SUV',
    bodyType: 'SUV',
    tagline: 'Flagship luxury, ultra-safe Blade Battery, unmatched road presence.',
    rangeNEDC: '530 km',
    rangeKm: 530,
    seats: 7,
    priceETB: 7290000,
    priceFormattedETB: 'ETB 7,290,000',
    priceFormatted: 'ETB 7,290,000',
    year: 2025,
    acceleration: '4.4s (0-100 km/h)',
    topSpeed: '180 km/h',
    batteryCapacity: '108.8 kWh Blade Battery',
    chargingTime: '30 min (30% - 80% DC Fast Charge)',
    driveType: 'Intelligent AWD (Dual Motor)',
    priceEstimate: 'Official ETB Quotation Available at Showroom',
    thumbnail: '/images/hero_byd_tang_1788207021341.jpg',
    sideImage: '/images/byd_tang_side_1788207031619.jpg',
    heroImage: '/images/hero_byd_tang_1788207021341.jpg',
    video: '/videos/byd-tang-l.mp4',
    warrantySummary: '8 Years / 160,000 km Battery Warranty + 5 Years Bumper-to-Bumper',
    highlights: [
      'Ultra-safe BYD Blade Battery Technology',
      'DiSus-C Intelligent Damping Suspension',
      'Panoramic 15.6" Rotating Touchscreen Display',
      'Dynaudio 12-Speaker High-Fidelity Audio System'
    ],
    description: 'The BYD Tang L redefines full-size electric luxury. Engineered with state-of-the-art thermal management and rugged high-clearance dynamics, it delivers serene cruising over Ethiopian roads with executive 7-seat versatility.',
    features: {
      safety: [
        'L2+ Advanced DiPilot Driver Assistance System',
        '360° High-Definition Surround Camera with Transparent Chassis',
        'Ultra-high strength steel safety cage structure',
        'Automatic Emergency Braking (AEB) & Pedestrian Detection'
      ],
      comfort: [
        'Nappa leather ventilated and massaging front seats',
        'Tri-zone automatic climate control with PM2.5 air purification',
        'Acoustic double-glazed noise-insulating glass',
        'Configurable 31-color ambient interior LED lighting'
      ],
      technology: [
        'DiLink 4.0 5G Intelligent Connectivity Network',
        'Full HD Head-Up Display (W-HUD)',
        'Vehicle-to-Load (V2L) 6kW mobile power station',
        'Wireless ultra-fast smartphone charging pad'
      ]
    }
  },
  {
    id: 'geely-galaxy-e5',
    name: 'GEELY GALAXY E5',
    brand: 'Geely',
    category: 'Pure Electric Smart Crossover',
    bodyType: 'Crossover',
    tagline: 'Sleek aerodynamics, next-generation Flyme Auto OS, everyday agility.',
    rangeNEDC: '530 km',
    rangeKm: 530,
    seats: 5,
    priceETB: 4650000,
    priceFormattedETB: 'ETB 4,650,000',
    priceFormatted: 'ETB 4,650,000',
    year: 2025,
    acceleration: '6.9s (0-100 km/h)',
    topSpeed: '175 km/h',
    batteryCapacity: '60.22 kWh Aegis Short Blade',
    chargingTime: '20 min (30% - 80% DC Fast Charge)',
    driveType: 'Front-Wheel Drive',
    priceEstimate: 'Official ETB Quotation Available at Showroom',
    thumbnail: '/images/car_geely_e5_1788207068809.jpg',
    sideImage: '/images/car_geely_e5_1788207068809.jpg',
    heroImage: '/images/car_geely_e5_1788207068809.jpg',
    video: '/videos/geely-galaxy-e5.mp4',
    warrantySummary: '8 Years / 150,000 km Aegis Battery Warranty + 5 Years Full Coverage',
    highlights: [
      'GEA Global Intelligent Electric Architecture',
      'Flyme Auto Intelligent Cockpit Experience',
      'Aegis Flame-Resistant Short Blade Battery',
      'Class-leading 0.269 Cd Ultra-Low Drag Coefficient'
    ],
    description: 'The Geely Galaxy E5 combines futuristic aesthetics with exceptional energy efficiency. Tailored for agile city driving and long-distance highway comfort across Ethiopia.',
    features: {
      safety: [
        'Aegis battery safety cell armor protection',
        'Forward Collision Warning with active emergency braking',
        'Lane Keeping Assist & Blind Spot Monitoring',
        'Tire Pressure Monitoring System (TPMS) with real-time PSI'
      ],
      comfort: [
        'Ergonomic Marshmallow cloud-comfort seating',
        'Panoramic sunroof with power sunshade',
        'Spacious 461L expandable cargo capacity',
        'Wireless Apple CarPlay and Android Auto integration'
      ],
      technology: [
        '15.4-inch 2.5K ultra-narrow bezel central display',
        'Qualcomm Snapdragon 8155 automotive cockpit chip',
        'Keyless NFC smart entry & phone Bluetooth key',
        'Over-the-Air (OTA) continuous vehicle software updates'
      ]
    }
  },
  {
    id: 'byd-song-plus',
    name: 'BYD SONG PLUS',
    brand: 'BYD',
    category: 'Dynamic Electric Family SUV',
    bodyType: 'SUV',
    tagline: 'Ethiopia’s favorite electric SUV: balanced range, reliability, and style.',
    rangeNEDC: '505 km',
    rangeKm: 505,
    seats: 5,
    priceETB: 4970000,
    priceFormattedETB: 'ETB 4,970,000',
    priceFormatted: 'ETB 4,970,000',
    year: 2024,
    acceleration: '7.7s (0-100 km/h)',
    topSpeed: '175 km/h',
    batteryCapacity: '71.8 kWh Blade Battery',
    chargingTime: '28 min (30% - 80% DC Fast Charge)',
    driveType: 'Front-Wheel Drive',
    priceEstimate: 'Official ETB Quotation Available at Showroom',
    thumbnail: '/images/car_byd_song_1788207081795.jpg',
    sideImage: '/images/car_byd_song_1788207081795.jpg',
    heroImage: '/images/car_byd_song_1788207081795.jpg',
    video: '/videos/byd-song-plus.mp4',
    warrantySummary: '8 Years / 150,000 km Blade Battery Warranty + 5 Years Drivetrain',
    highlights: [
      'Proven Blade Battery with zero spontaneous ignition risk',
      'Dragon Face 3.0 refined aerodynamic design',
      'Spacious luxury interior with plush soft-touch trim',
      'High ground clearance ideal for varied terrain'
    ],
    description: 'The BYD Song Plus delivers the optimal harmony of space, capability, and long-term durability. Perfectly suited for daily commutes in Addis Ababa and weekend road trips.',
    features: {
      safety: [
        'DiPilot Intelligent Driving Assistance',
        'Integrated body stability control (ESC)',
        'Hill Descent Control and Hill Start Assist',
        'Adaptive Cruise Control with Stop & Go'
      ],
      comfort: [
        'Dual-zone climate control with PM2.5 filtration',
        'Electric adjustable heated & ventilated front seats',
        'Panoramic power sunroof',
        'Generous rear legroom with flat floor architecture'
      ],
      technology: [
        '12.8-inch adaptive electric rotating screen',
        'Dirac high-fidelity sound system',
        'Smart remote start and climate pre-conditioning via App',
        'Built-in dashcam with cloud video storage'
      ]
    }
  },
  {
    id: 'toyota-bz3x',
    name: 'TOYOTA BZ3X',
    brand: 'Toyota',
    category: 'Intelligent Electric Urban Crossover',
    bodyType: 'Crossover',
    tagline: 'Toyota heritage meets cutting-edge electrification and intelligence.',
    rangeNEDC: '500 km',
    rangeKm: 500,
    seats: 5,
    priceETB: 5150000,
    priceFormattedETB: 'ETB 5,150,000',
    priceFormatted: 'ETB 5,150,000',
    year: 2025,
    acceleration: '7.5s (0-100 km/h)',
    topSpeed: '160 km/h',
    batteryCapacity: '65.3 kWh Lithium Iron Phosphate',
    chargingTime: '30 min (30% - 80% DC Fast Charge)',
    driveType: 'Front-Wheel Drive',
    priceEstimate: 'Official ETB Quotation Available at Showroom',
    thumbnail: '/images/car_toyota_bz3x_1788207093974.jpg',
    sideImage: '/images/car_toyota_bz3x_1788207093974.jpg',
    heroImage: '/images/car_toyota_bz3x_1788207093974.jpg',
    video: '/videos/toyota-bz3x.mp4',
    warrantySummary: '10 Years / 200,000 km Toyota Battery Warranty + 5 Years Vehicle Warranty',
    highlights: [
      'Toyota Safety Sense (TSS) 3.0 active protection suite',
      'Ultra-efficient e-TNGA dedicated electric platform',
      'High-durability battery with low degradation warranty',
      'Crisp high-contrast cockpit digital displays'
    ],
    description: 'Developed in partnership with world-leading battery pioneers, the Toyota bZ3X delivers legendary reliability wrapped in a bold, futuristic EV silhouette built for seamless daily driving.',
    features: {
      safety: [
        'Toyota Safety Sense 3.0 with Pre-Collision System',
        'Lane Departure Alert with Steering Assist',
        'Dynamic Radar Cruise Control',
        'Automatic High Beam assist'
      ],
      comfort: [
        'Spacious lounge-style minimalist interior',
        'Dual-zone automatic air conditioning system',
        'Acoustic insulation package for quiet cabin travel',
        'Fold-flat 60:40 rear seats for maximum luggage space'
      ],
      technology: [
        '12.3-inch Toyota Smart Multimedia Interface',
        'Intelligent voice recognition in multiple accents',
        'Qi wireless phone charging dock',
        'Full digital driver cockpit cluster'
      ]
    }
  },
  {
    id: 'geely-starwish',
    name: 'GEELY STARWISH',
    brand: 'Geely',
    category: 'Compact Urban Electric Hatchback',
    bodyType: 'Hatchback',
    tagline: 'Playful, agile, ultra-efficient — the smartest city EV in Addis.',
    rangeNEDC: '410 km',
    rangeKm: 410,
    seats: 5,
    priceETB: 3050000,
    priceFormattedETB: 'ETB 3,050,000',
    priceFormatted: 'ETB 3,050,000',
    year: 2025,
    acceleration: '8.2s (0-100 km/h)',
    topSpeed: '140 km/h',
    batteryCapacity: '40.16 kWh Short Blade Battery',
    chargingTime: '22 min (30% - 80% DC Fast Charge)',
    driveType: 'Rear-Wheel Drive / FWD',
    priceEstimate: 'Official ETB Quotation Available at Showroom',
    thumbnail: '/images/car_geely_starwish_1788207105482.jpg',
    sideImage: '/images/car_geely_starwish_1788207105482.jpg',
    heroImage: '/images/car_geely_starwish_1788207105482.jpg',
    video: '/videos/geely-starwish.mp4',
    warrantySummary: '8 Years / 150,000 km Battery Warranty + 5 Years Roadside Assistance',
    highlights: [
      'Compact turning radius perfect for tight city streets',
      'Class-leading interior passenger room optimization',
      'Flyme Auto smart multimedia system',
      'Remarkably low operating cost per kilometer'
    ],
    description: 'The Geely Starwish is designed for the modern metropolitan lifestyle. Easy to park, fun to drive, and remarkably economical with genuine 400+ km daily usability.',
    features: {
      safety: [
        'High-strength steel passenger cage',
        'Rear parking sensors with dynamic reversing camera',
        'Electronic Stability Control (ESC) with Brake Assist',
        'ISOFIX child seat anchors'
      ],
      comfort: [
        'Soft-touch eco-friendly upholstery',
        'Automatic air conditioning with dust filtration',
        'Under-seat storage compartments & multi-hook organizers',
        'Smooth electric steering with adjustable weight'
      ],
      technology: [
        '14.6-inch high-resolution infotainment screen',
        'Bluetooth 5.2 connectivity with multi-device pairing',
        'USB-C rapid charging ports for front and rear',
        'Smart remote keyless entry'
      ]
    }
  }
];
