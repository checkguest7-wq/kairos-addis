import { WhyFeature, WarrantyItem } from '../types';

export const WHY_FEATURES: WhyFeature[] = [
  {
    id: 'warranty',
    title: '5-YEAR WARRANTY',
    description: 'Drive with confidence knowing your vehicle is protected.',
    iconType: 'warranty'
  },
  {
    id: 'expertise',
    title: 'EV EXPERTISE',
    description: 'Deep knowledge and experience in electric vehicle technology.',
    iconType: 'expertise'
  },
  {
    id: 'service',
    title: 'PROFESSIONAL SERVICE',
    description: 'EV-trained technicians using advanced tools and genuine parts.',
    iconType: 'service'
  },
  {
    id: 'support',
    title: 'CUSTOMER SUPPORT',
    description: "We're here to support you before, during and after your purchase.",
    iconType: 'support'
  }
];

export const WARRANTY_ITEMS: WarrantyItem[] = [
  {
    id: 'vehicle-warranty',
    duration: '5 YEARS',
    label: 'Vehicle Warranty',
    description: 'Comprehensive bumper-to-bumper manufacturer warranty coverage.',
    iconType: 'shield'
  },
  {
    id: 'battery-warranty',
    duration: '8 YEARS / 160,000 KM',
    label: 'Battery Warranty',
    description: 'High-voltage traction battery capacity retention & cell guarantee.',
    iconType: 'battery'
  },
  {
    id: 'drivetrain-warranty',
    duration: '5 YEARS / 100,000 KM',
    label: 'Electric Drivetrain Warranty',
    description: 'Electric motors, power electronics, and drive unit protection.',
    iconType: 'drivetrain'
  },
  {
    id: 'service-item',
    duration: 'PROFESSIONAL SERVICE',
    label: 'Maintenance & Genuine Parts',
    description: 'Certified EV diagnostics, original OEM components, and fast turnarounds.',
    iconType: 'service'
  }
];
