import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  User,
  PortalVehicle,
  WarrantyDetails,
  ServiceRecord,
  Appointment,
  TestDriveRequest,
  NotificationItem,
  VehicleOrder,
  CustomerDocuments,
  CustomerDocumentItem,
  PortalMessage,
  PortalTestimonial,
  Vehicle,
  SiteSettings,
} from '../src/types';
import { VEHICLES } from '../src/data/vehicles';
import {
  loadAllFromSupabase,
  seedSupabaseInitialData,
  isSupabaseDatabaseEnabled,
  syncUserDocumentsToSupabase,
  syncNotificationToSupabase,
} from './supabaseDb';


export interface UserAccount extends User {
  passwordHash: string;
  isEmailVerified?: boolean;
  verificationOtp?: string;
  verificationOtpExpires?: number;
  lastResendAt?: number;
  lastResetRequestedAt?: number;
  resetToken?: string;
  resetTokenExpiry?: number;
  deletedFromMessaging?: boolean;
}

export interface UserDocumentsRecord {
  userId: string;
  documents: CustomerDocuments;
}

export interface DatabaseSchema {
  users: UserAccount[];
  vehicles: PortalVehicle[];
  warranties: WarrantyDetails[];
  serviceRecords: ServiceRecord[];
  appointments: Appointment[];
  testDrives: TestDriveRequest[];
  notifications: NotificationItem[];
  orders: VehicleOrder[];
  userDocuments: UserDocumentsRecord[];
  messages: PortalMessage[];
  testimonials: PortalTestimonial[];
  catalogVehicles: Vehicle[];
  settings: SiteSettings;
  deletedMessagingContacts?: string[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'portal-db.json');

// Default initial settings
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'Kairos Addis Automotive PLC',
  tagline: 'Ethiopia’s Premier Electric Vehicle Importer & YouGuard Warranty Partner',
  logoUrl: '',
  faviconUrl: '',
  showroomAddress: 'Bole Wollo Sefer, Infront of Ibex Hotel, Addis Ababa, Ethiopia',
  serviceCenterAddress: 'Bole Medhanialem Behind Edna Mall, Addis Ababa, Ethiopia',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.648171731693!2d38.78456237588325!3d8.995279689369986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b8504ebc45f41%3A0x6b4fb43dc52e6f47!2sBole%20Wollo%20Sefer!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set',
  phones: ['+251 953 991 901', '+251 911 234 567'],
  emails: ['contact@kairosaddis.com', 'sales@kairosaddis.com'],
  showroomPhone: '+251 953 991 901',
  showroomEmail: 'contact@kairosaddis.com',
  showroomHours: 'Mon - Sat: 8:30 AM - 6:30 PM (Sunday by Appointment)',
  operatingHours: 'Monday – Saturday: 8:30 AM – 6:30 PM (Sunday: By VIP Appointment)',
  socialLinks: [
    { platform: 'telegram', url: 'https://t.me/kairosaddis', label: 'Telegram Channel' },
    { platform: 'facebook', url: 'https://facebook.com/kairosaddis', label: 'Facebook Page' },
    { platform: 'instagram', url: 'https://instagram.com/kairosaddis', label: 'Instagram Profile' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/kairosaddis', label: 'LinkedIn Company' },
    { platform: 'tiktok', url: 'https://tiktok.com/@kairosaddis', label: 'TikTok Official' },
    { platform: 'youtube', url: 'https://youtube.com/@kairosaddis', label: 'YouTube Channel' },
  ],
  aboutShowroomImage: '/images/showroom_exterior_1788207130284.jpg',
};

// In-memory cache synced with disk
let db: DatabaseSchema = {
  users: [],
  vehicles: [],
  warranties: [],
  serviceRecords: [],
  appointments: [],
  testDrives: [],
  notifications: [],
  orders: [],
  userDocuments: [],
  messages: [],
  testimonials: [],
  catalogVehicles: [...VEHICLES],
  settings: { ...DEFAULT_SITE_SETTINGS },
};

// Initialize DB with seed data if file doesn't exist
export function initDatabase() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(content);
      db = {
        users: loaded.users || [],
        vehicles: loaded.vehicles || [],
        warranties: loaded.warranties || [],
        serviceRecords: loaded.serviceRecords || [],
        appointments: loaded.appointments || [],
        testDrives: loaded.testDrives || [],
        notifications: loaded.notifications || [],
        orders: (loaded.orders || []).map((o: any) => {
          const priceETB = (o.priceETB && typeof o.priceETB === 'number' && o.priceETB > 0)
            ? o.priceETB
            : (o.priceUSD ? o.priceUSD * 135 : 7290000);
          const priceFormattedETB = (o.priceFormattedETB && !o.priceFormattedETB.includes('$'))
            ? o.priceFormattedETB
            : `ETB ${priceETB.toLocaleString()}`;
          const { priceUSD, ...rest } = o;
          return {
            ...rest,
            priceETB,
            priceFormattedETB,
            priceFormatted: priceFormattedETB,
          };
        }),
        userDocuments: loaded.userDocuments || [],
        messages: loaded.messages || [],
        testimonials: loaded.testimonials || [],
        catalogVehicles: (loaded.catalogVehicles && loaded.catalogVehicles.length > 0)
          ? loaded.catalogVehicles.map((v: any) => {
              const canonical = VEHICLES.find((cv) => cv.id === v.id);
              const priceETB = (v.priceETB && typeof v.priceETB === 'number' && v.priceETB > 0)
                ? v.priceETB
                : (canonical ? canonical.priceETB : 6800000);
              const priceFormattedETB = (canonical && (!v.priceETB || v.priceETB <= 0))
                ? canonical.priceFormattedETB
                : (v.priceFormattedETB && !v.priceFormattedETB.includes('$') ? v.priceFormattedETB : `ETB ${priceETB.toLocaleString()}`);
              const { priceUSD, ...rest } = v;
              const priceEstimate = (v.priceEstimate && !v.priceEstimate.includes('$') && !v.priceEstimate.includes('USD'))
                ? v.priceEstimate
                : (canonical?.priceEstimate || 'Official ETB Quotation Available at Showroom');
              return {
                ...rest,
                priceETB,
                priceFormattedETB,
                priceFormatted: priceFormattedETB,
                priceEstimate,
              };
            })
          : [...VEHICLES],
        settings: loaded.settings || { ...DEFAULT_SITE_SETTINGS },
      };

      // Ensure Master Admin exists and credentials align with environment configuration
      const adminEmail = (process.env.ADMIN_EMAIL || process.env.ADMIN_DEFAULT_EMAIL || 'admin@kairosaddis.com').toLowerCase().trim();
      const existingAdmin = db.users.find((u) => u.email.toLowerCase() === adminEmail || u.role === 'admin');
      const configuredAdminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD;

      if (configuredAdminPassword) {
        const salt = bcrypt.genSaltSync(10);
        const adminPasswordHash = bcrypt.hashSync(configuredAdminPassword, salt);
        if (existingAdmin) {
          existingAdmin.role = 'admin';
          existingAdmin.isEmailVerified = true;
          existingAdmin.passwordHash = adminPasswordHash;
          saveDatabase();
        } else {
          db.users.unshift({
            id: 'usr_kairos_master_admin',
            fullName: 'Kairos Master Admin',
            email: adminEmail,
            phone: '+251 953 991 901',
            role: 'admin',
            passwordHash: adminPasswordHash,
            isEmailVerified: true,
            createdAt: '2025-01-01T00:00:00Z',
          });
          saveDatabase();
        }
      } else if (!existingAdmin) {
        // If no admin exists at all and no password env is given, create an initial admin with a random secure password
        const randomAdminPass = crypto.randomBytes(8).toString('hex') + '!2026';
        const salt = bcrypt.genSaltSync(10);
        const adminPasswordHash = bcrypt.hashSync(randomAdminPass, salt);
        db.users.unshift({
          id: 'usr_kairos_master_admin',
          fullName: 'Kairos Master Admin',
          email: adminEmail,
          phone: '+251 953 991 901',
          role: 'admin',
          passwordHash: adminPasswordHash,
          isEmailVerified: true,
          createdAt: '2025-01-01T00:00:00Z',
        });
        saveDatabase();
      }

      saveDatabase();
      console.log(`[DB] Loaded existing portal database with ${db.users.length} users and ${db.catalogVehicles.length} vehicles.`);
    } else {
      seedDefaultData();
      saveDatabase();
      console.log('[DB] Initialized fresh portal database with master admin and demo customer account.');
    }
  } catch (err) {
    console.error('[DB] Error loading database:', err);
    seedDefaultData();
  }
}

export async function initDatabaseAsync(): Promise<void> {
  // First load local database as base cache
  initDatabase();

  // If Supabase is enabled, load persistent state from Supabase PostgreSQL
  if (isSupabaseDatabaseEnabled()) {
    try {
      console.log('[DB] Supabase database enabled. Syncing persistent state from Supabase PostgreSQL...');
      const remote = await loadAllFromSupabase();
      if (remote) {
        if (remote.users && remote.users.length > 0) db.users = remote.users;
        if (remote.catalogVehicles && remote.catalogVehicles.length > 0) db.catalogVehicles = remote.catalogVehicles;
        if (remote.orders) db.orders = remote.orders;
        if (remote.vehicles) db.vehicles = remote.vehicles;
        if (remote.warranties) db.warranties = remote.warranties;
        if (remote.serviceRecords) db.serviceRecords = remote.serviceRecords;
        if (remote.appointments) db.appointments = remote.appointments;
        if (remote.testDrives) db.testDrives = remote.testDrives;
        if (remote.notifications) db.notifications = remote.notifications;
        if (remote.userDocuments) db.userDocuments = remote.userDocuments;
        if (remote.testimonials) db.testimonials = remote.testimonials;
        if (remote.settings) db.settings = remote.settings;

        console.log(`[DB] Supabase sync completed. Active users: ${db.users.length}, Orders: ${db.orders.length}, Catalog: ${db.catalogVehicles.length}.`);
      }

      // Check if Supabase needs initial seed
      await seedSupabaseInitialData(db);
    } catch (err) {
      console.warn('[DB] Supabase async sync notice:', err);
    }
  }
}

export function saveDatabase() {
  try {
    // Only attempt local file persistence if not running on read-only serverless filesystem or if in dev mode
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Safe to ignore in read-only environment like Vercel Lambda
      }
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err: any) {
    // In Vercel serverless environments, local filesystem write is read-only; Supabase is the persistent store
    if (process.env.NODE_ENV === 'production') {
      // Non-fatal notice in production serverless
    } else {
      console.warn('[DB] Local filesystem write warning:', err?.message || err);
    }
  }
}


function seedDefaultData() {
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.ADMIN_DEFAULT_EMAIL || 'admin@kairosaddis.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_DEFAULT_PASSWORD || (crypto.randomBytes(8).toString('hex') + '!2026');
  const demoPassword = process.env.DEMO_USER_PASSWORD || (crypto.randomBytes(8).toString('hex') + '!2026');

  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync(adminPassword, salt);
  const demoPasswordHash = bcrypt.hashSync(demoPassword, salt);

  const adminUserId = 'usr_kairos_master_admin';
  const demoUserId = 'usr_dawit_tadesse_2026';
  const demoVehicleId = 'veh_byd_tang_l_01';

  db.settings = { ...DEFAULT_SITE_SETTINGS };
  db.catalogVehicles = [...VEHICLES];

  db.users = [
    {
      id: adminUserId,
      fullName: 'Kairos Master Admin',
      email: adminEmail,
      phone: '+251 953 991 901',
      role: 'admin',
      passwordHash: adminPasswordHash,
      isEmailVerified: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: demoUserId,
      fullName: 'Dawit Tadesse',
      email: 'dawit@kairosaddis.com',
      phone: '+251 91 123 4567',
      role: 'customer',
      passwordHash: demoPasswordHash,
      isEmailVerified: true,
      createdAt: '2025-01-14T08:30:00Z',
    },
  ];

  db.vehicles = [
    {
      id: demoVehicleId,
      userId: demoUserId,
      model: 'BYD Tang L (7-Seater AWD)',
      brand: 'BYD',
      registrationNumber: 'AA 3-A49201',
      vin: 'LC0CE40E8N0184920',
      purchaseDate: 'January 14, 2025',
      color: 'Midnight Obsidian Black',
      mileageKm: 24350,
      batteryHealthPercent: 99.4,
      batteryCapacity: '108.8 kWh Blade Battery',
      estimatedRangeKm: 580,
      chargeStatusPercent: 86,
      tirePressurePsi: {
        frontLeft: 36,
        frontRight: 36,
        rearLeft: 38,
        rearRight: 38,
      },
      warrantyStatus: 'ACTIVE',
      softwareVersion: 'DiLink OS v4.2.8 (Ethiopian Region)',
      imageUrl: '/images/tang_l_dark.jpg',
    },
  ];

  db.warranties = [
    {
      id: 'war_youguard_01',
      userId: demoUserId,
      vehicleId: demoVehicleId,
      status: 'ACTIVE',
      partner: 'YouGuard Warranty Services (Official Partner)',
      certificateNumber: 'YG-ETH-2025-09841',
      startDate: 'January 14, 2025',
      vehicleWarrantyStartDate: 'January 14, 2025',
      vehicleWarrantyYears: 5,
      vehicleWarrantyKm: 100000,
      vehicleWarrantyEndDate: 'January 14, 2030',
      batteryWarrantyStartDate: 'January 14, 2025',
      batteryWarrantyYears: 8,
      batteryWarrantyKm: 160000,
      batteryWarrantyEndDate: 'January 14, 2033',
      currentKm: 24350,
      coveredComponents: [
        { name: 'High-Voltage Blade Battery Pack & BMS', coveragePeriod: '8 Years / 160,000 KM', status: 'ACTIVE' },
        { name: 'Dual Electric Motors & Power Electronics', coveragePeriod: '5 Years / 100,000 KM', status: 'ACTIVE' },
        { name: 'Integrated Onboard Charger & Inverter', coveragePeriod: '5 Years / 100,000 KM', status: 'ACTIVE' },
        { name: 'Chassis, Suspension & Active Air Struts', coveragePeriod: '3 Years / 60,000 KM', status: 'ACTIVE' },
        { name: 'DiLink Intelligent Cockpit & Infotainment', coveragePeriod: '3 Years / 60,000 KM', status: 'ACTIVE' },
      ],
      recentClaims: [
        {
          id: 'CLM-2025-001',
          date: 'November 18, 2025',
          type: 'Cabin Sensor Calibration',
          status: 'Completed',
          resolution: 'Optical radar calibrated under YouGuard complimentary coverage at Bole Medhanialem Service Center.',
        },
      ],
    },
  ];

  db.serviceRecords = [
    {
      id: 'srv_rec_01',
      userId: demoUserId,
      vehicleId: demoVehicleId,
      date: 'August 12, 2026',
      serviceType: 'Regular EV Service (20,000 KM)',
      vehicle: 'BYD Tang L (AA 3-A49201)',
      status: 'Completed',
      mileage: 20120,
      facility: 'Bole Medhanialem EV Center, Addis Ababa',
      technician: 'Yonas Getachew (Master EV Tech)',
      costETB: 0,
      notes: 'Complimentary scheduled maintenance. High-voltage insulation test: 100% nominal. Replaced HEPA cabin filter and topped off cooling loops.',
      itemsServiced: ['High-Voltage Diagnostic', 'Brake Fluid Water Content Test', 'HEPA Filter Replacement', 'Tire Rotation & Balance', 'Coolant Thermal Loop Check'],
    },
    {
      id: 'srv_rec_02',
      userId: demoUserId,
      vehicleId: demoVehicleId,
      date: 'February 10, 2025',
      serviceType: 'Initial 10,000 KM Inspection',
      vehicle: 'BYD Tang L (AA 3-A49201)',
      status: 'Completed',
      mileage: 10050,
      facility: 'Bole Medhanialem EV Center, Addis Ababa',
      technician: 'Abebe Bekele',
      costETB: 0,
      notes: 'Initial checkup completed. Battery health state: 99.8%. Firmware updated to v4.2.8.',
      itemsServiced: ['Firmware Flash v4.2.8', 'Suspension Bushing Torquing', 'Tire Pressure Calibration', 'Multi-point EV Safety Scan'],
    },
  ];

  db.appointments = [
    {
      id: 'apt_01',
      userId: demoUserId,
      vehicleId: demoVehicleId,
      serviceType: 'Annual EV Health Check & Firmware Optimization',
      vehicle: 'BYD Tang L (AA 3-A49201)',
      date: 'September 15, 2026',
      time: '10:00 AM',
      status: 'Confirmed',
      message: 'Comprehensive 25,000 KM high-voltage diagnostics and air conditioning refrigerant check.',
      facility: 'Kairos Addis Bole Medhanialem EV Center',
      createdAt: '2026-08-25T11:00:00Z',
    },
  ];

  db.testDrives = [
    {
      id: 'td_01',
      userId: demoUserId,
      vehicleName: 'Geely Galaxy E5 (Pure Electric SUV)',
      preferredDate: 'September 10, 2026',
      preferredTime: '02:30 PM',
      status: 'Confirmed',
      location: 'Bole Wollo Sefer Showroom, Infront of Ibex Hotel',
      notes: 'Customer interested in exploring a second EV for family commute.',
      createdAt: '2026-08-28T09:15:00Z',
    },
  ];

  db.notifications = [
    {
      id: 'notif_01',
      userId: demoUserId,
      title: 'Service Appointment Confirmed',
      message: 'Your upcoming service appointment on September 15, 2026 at 10:00 AM has been confirmed by our technical manager.',
      type: 'appointment',
      date: 'August 25, 2026',
      read: false,
      priority: 'high',
    },
    {
      id: 'notif_02',
      userId: demoUserId,
      title: 'YouGuard Warranty Active',
      message: 'Your 5-Year Vehicle & 8-Year Battery Warranty is fully active and synchronized with YouGuard Addis Ababa.',
      type: 'warranty',
      date: 'August 18, 2026',
      read: true,
      priority: 'medium',
    },
    {
      id: 'notif_03',
      userId: demoUserId,
      title: 'Vehicle Service Due Soon',
      message: 'Your 25,000 KM periodic inspection is scheduled for next month. All complimentary checks apply.',
      type: 'service',
      date: 'August 12, 2026',
      read: false,
      priority: 'medium',
    },
    {
      id: 'notif_04',
      userId: demoUserId,
      title: 'Firmware Update v4.2.8 Ready',
      message: 'New intelligent thermal management algorithms available for installation during your next service visit.',
      type: 'update',
      date: 'August 01, 2026',
      read: true,
      priority: 'low',
    },
  ];

  db.orders = [
    {
      id: 'ord_01',
      orderNumber: 'KA-2025-0814',
      userId: demoUserId,
      vehicleId: 'byd-tang-l',
      vehicleName: 'BYD TANG L (7-Seater AWD)',
      vehicleBrand: 'BYD',
      vehicleImage: '/images/hero_byd_tang_1788207021341.jpg',
      priceETB: 7290000,
      priceFormattedETB: 'ETB 7,290,000',
      priceFormatted: 'ETB 7,290,000',
      selectedColor: 'Midnight Obsidian Black',
      notes: 'Customer requested 7-seat configuration with DiSus-C active suspension package.',
      orderDate: 'January 10, 2025',
      status: 'Completed',
      stepProgress: 6,
      deliveryLocation: 'Bole Medhanialem Flagship Delivery Center',
      vin: 'LC0CE40E8N0184920',
      history: [
        { status: 'Order Received', date: 'January 10, 2025', note: 'Custom import order initiated.' },
        { status: 'Documents Verified', date: 'January 11, 2025', note: 'Fayda ID and Driving Licence verified.' },
        { status: 'Payment Processing', date: 'January 12, 2025', note: 'L/C and import tax clearance completed.' },
        { status: 'Preparing Vehicle', date: 'January 13, 2025', note: 'PDI (Pre-Delivery Inspection) & YouGuard warranty enrollment.' },
        { status: 'Completed', date: 'January 14, 2025', note: 'Delivered to customer with full onboarding.' },
      ],
    },
  ];

  db.userDocuments = [
    {
      userId: demoUserId,
      documents: {
        faydaIdFront: {
          id: 'doc_fayda_front_01',
          docType: 'faydaIdFront',
          fileName: 'fayda_id_front_dawit.jpg',
          fileSize: '2.4 MB',
          uploadedAt: 'August 01, 2026',
          status: 'Uploaded',
        },
        faydaIdBack: {
          id: 'doc_fayda_back_01',
          docType: 'faydaIdBack',
          fileName: 'fayda_id_back_dawit.jpg',
          fileSize: '2.1 MB',
          uploadedAt: 'August 01, 2026',
          status: 'Uploaded',
        },
        drivingLicenceFront: {
          id: 'doc_dl_front_01',
          docType: 'drivingLicenceFront',
          fileName: 'eth_driving_licence_front.jpg',
          fileSize: '1.9 MB',
          uploadedAt: 'August 01, 2026',
          status: 'Uploaded',
        },
        drivingLicenceBack: {
          id: 'doc_dl_back_01',
          docType: 'drivingLicenceBack',
          fileName: 'eth_driving_licence_back.jpg',
          fileSize: '1.8 MB',
          uploadedAt: 'August 01, 2026',
          status: 'Uploaded',
        },
      },
    },
  ];

  db.messages = [];

  db.testimonials = [
    {
      id: 'test_01',
      userId: demoUserId,
      customerName: 'Dawit Tadesse',
      vehicleOwned: 'BYD Tang L',
      rating: 5,
      title: 'Unmatched Electric Performance & YouGuard Peace of Mind',
      message: 'Switching to the BYD Tang L through Kairos Addis has transformed my daily commute in Addis Ababa. The YouGuard 8-year warranty and dedicated Bole service team give me absolute confidence.',
      status: 'Approved',
      submittedAt: '2026-07-20T10:00:00Z',
      reviewedAt: '2026-07-21T14:30:00Z',
    },
  ];
}

// User-specific helpers to seed new user assets upon registration
export function seedNewUserData(userId: string, fullName: string) {
  const newNotifications: NotificationItem[] = [
    {
      id: `notif_${Date.now()}_1`,
      userId,
      title: 'Welcome to Kairos Addis Portal',
      message: `Welcome, ${fullName}! You can now browse our vehicle catalog, upload your Fayda ID & driving licence, and order your next electric vehicle.`,
      type: 'system',
      date: 'Today',
      read: false,
      priority: 'high',
    },
  ];

  const initialDocs: UserDocumentsRecord = {
    userId,
    documents: {
      faydaIdFront: null,
      faydaIdBack: null,
      drivingLicenceFront: null,
      drivingLicenceBack: null,
    },
  };

  db.notifications.push(...newNotifications);
  db.userDocuments.push(initialDocs);
  saveDatabase();

  // Asynchronously sync initial user state to Supabase PostgreSQL
  syncUserDocumentsToSupabase(initialDocs).catch(() => {});
  for (const notif of newNotifications) {
    syncNotificationToSupabase(notif).catch(() => {});
  }
}

export function getDatabase() {
  return db;
}
