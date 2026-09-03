export interface Vehicle {
  id: string;
  name: string;
  brand: 'BYD' | 'Geely' | 'Toyota' | string;
  category: string;
  bodyType: 'SUV' | 'Crossover' | 'Hatchback' | 'Sedan' | string;
  tagline: string;
  rangeNEDC: string;
  rangeKm: number;
  seats: number;
  priceETB: number;
  priceFormattedETB: string;
  priceFormatted?: string;
  year: number;
  acceleration: string;
  topSpeed: string;
  batteryCapacity: string;
  chargingTime: string;
  driveType: string;
  priceEstimate: string;
  thumbnail: string;
  sideImage: string;
  heroImage?: string;
  /** Optional vehicle video. Used only when the corresponding image is not available. */
  video?: string;
  highlights: string[];
  description: string;
  features: {
    safety: string[];
    comfort: string[];
    technology: string[];
  };
  warrantySummary?: string;
}

export interface Review {
  id: string;
  name: string;
  title: string;
  rating: number;
  quote: string;
  image: string;
  vehicleOwned: string;
  location: string;
}

export interface WhyFeature {
  id: string;
  title: string;
  description: string;
  iconType: 'warranty' | 'expertise' | 'service' | 'support';
}

export interface WarrantyItem {
  id: string;
  duration: string;
  label: string;
  description: string;
  iconType: 'shield' | 'battery' | 'drivetrain' | 'service';
}

// ==========================================
// CLIENT PORTAL TYPES
// ==========================================

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  avatar?: string;
  isEmailVerified?: boolean;
  role?: 'admin' | 'customer';
}

export interface PortalVehicle {
  id: string;
  userId: string;
  model: string;
  brand: string;
  registrationNumber: string;
  vin: string;
  purchaseDate: string;
  color: string;
  mileageKm: number;
  batteryHealthPercent: number;
  batteryCapacity: string;
  estimatedRangeKm: number;
  chargeStatusPercent: number;
  tirePressurePsi: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  warrantyStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  softwareVersion: string;
  imageUrl?: string;
}

export interface WarrantyDetails {
  id: string;
  userId: string;
  vehicleId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  partner: string; // e.g. 'YouGuard Warranty Services'
  certificateNumber: string;
  startDate?: string;
  vehicleWarrantyStartDate?: string;
  vehicleWarrantyYears: number;
  vehicleWarrantyKm?: number;
  vehicleWarrantyEndDate: string;
  batteryWarrantyStartDate?: string;
  batteryWarrantyYears: number;
  batteryWarrantyKm: number;
  batteryWarrantyEndDate: string;
  currentKm: number;
  coveredComponents: {
    name: string;
    coveragePeriod: string;
    status: 'ACTIVE' | 'EXPIRED';
  }[];
  recentClaims: {
    id: string;
    date: string;
    type: string;
    status: 'Approved' | 'In Review' | 'Completed' | 'Pending';
    resolution?: string;
  }[];
}

export interface ServiceRecord {
  id: string;
  userId: string;
  vehicleId: string;
  date: string;
  serviceType: string;
  vehicle: string;
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Cancelled';
  mileage: number;
  facility: string;
  technician: string;
  costETB: number;
  notes: string;
  itemsServiced: string[];
}

export interface Appointment {
  id: string;
  userId: string;
  vehicleId: string;
  serviceType: string;
  vehicle: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  message?: string;
  facility: string;
  createdAt: string;
}

export interface TestDriveRequest {
  id: string;
  userId: string;
  vehicleName: string;
  vehicleId?: string;
  preferredDate: string;
  preferredTime: string;
  status: 'Confirmed' | 'Pending Review' | 'Completed' | 'Cancelled';
  location: string;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'service' | 'warranty' | 'appointment' | 'system' | 'update';
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface CustomerDocumentItem {
  id: string;
  docType: 'faydaIdFront' | 'faydaIdBack' | 'drivingLicenceFront' | 'drivingLicenceBack';
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  dataUrl?: string;
  storagePath?: string;
  fileUrl?: string;
  status: 'Uploaded' | 'Verified' | 'Rejected' | 'Pending Review';
  rejectionReason?: string;
  verifiedAt?: string;
}

export interface CustomerDocuments {
  faydaIdFront?: CustomerDocumentItem | null;
  faydaIdBack?: CustomerDocumentItem | null;
  drivingLicenceFront?: CustomerDocumentItem | null;
  drivingLicenceBack?: CustomerDocumentItem | null;
}

export type OrderStatus =
  | 'Order Received'
  | 'Under Review'
  | 'Documents Verified'
  | 'Payment Processing'
  | 'Preparing Vehicle'
  | 'Ready for Delivery'
  | 'Completed'
  | 'Cancelled';

export interface VehicleOrder {
  id: string;
  orderNumber: string;
  userId: string;
  vehicleId: string;
  vehicleName: string;
  vehicleBrand: string;
  vehicleImage: string;
  priceFormatted?: string;
  priceETB?: number | null;
  priceFormattedETB?: string;
  selectedColor: string;
  notes?: string;
  orderDate: string;
  status: OrderStatus;
  stepProgress: number; // 1 to 6
  deliveryLocation?: string;
  vin?: string;
  history: {
    status: OrderStatus | string;
    date: string;
    note?: string;
  }[];
}

export interface PortalMessage {
  id: string;
  userId: string;
  sender: 'customer' | 'support' | 'admin' | 'ai';
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  channel?: 'ai' | 'concierge';
  subject?: string;
  senderRole?: 'CUSTOMER' | 'ADMIN' | 'AI' | string;
}

export interface PortalTestimonial {
  id: string;
  userId: string;
  customerName: string;
  vehicleOwned?: string;
  rating: number; // 1-5
  title: string;
  message: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
  reviewedAt?: string;
}

export interface PortalDashboardData {
  user: User;
  vehicle: PortalVehicle | null;
  warranty: WarrantyDetails | null;
  serviceHistory: ServiceRecord[];
  upcomingAppointment: Appointment | null;
  appointments: Appointment[];
  testDrives: TestDriveRequest[];
  notifications: NotificationItem[];
  orders: VehicleOrder[];
  documents: CustomerDocuments;
  messages: PortalMessage[];
  testimonials: PortalTestimonial[];
}

export interface SiteSettings {
  siteName?: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  showroomAddress: string;
  serviceCenterAddress?: string;
  mapEmbedUrl?: string;
  phones?: string[];
  emails?: string[];
  showroomPhone?: string; // legacy fallback
  showroomEmail?: string; // legacy fallback
  showroomHours?: string;
  operatingHours?: string;
  socialLinks?: Array<{
    platform: 'telegram' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'x' | string;
    url: string;
    label: string;
  }>;
  aboutShowroomImage?: string;
}

export interface AdminOverviewStats {
  totalClients: number;
  pendingOrders: number;
  acceptedOrders: number;
  completedOrders: number;
  pendingServices: number;
  scheduledServices: number;
  upcomingTestDrives: number;
  unverifiedDocuments: number;
  unreadMessages: number;
  totalCatalogVehicles: number;
  activeWarrantiesCount: number;
}

export interface AdminClientSummary extends User {
  ordersCount: number;
  documentsCount: number;
  hasAllDocs: boolean;
  documentsVerifiedCount: number;
  warrantyActive: boolean;
  testDrivesCount: number;
  vehicleName?: string;
}

export interface AdminClientDossier {
  user: User;
  documents: CustomerDocuments;
  hasAllDocs: boolean;
  orders: VehicleOrder[];
  vehicle: PortalVehicle | null;
  warranty: WarrantyDetails | null;
  serviceRecords: ServiceRecord[];
  appointments: Appointment[];
  testDrives: TestDriveRequest[];
  messages: PortalMessage[];
  notifications: NotificationItem[];
}

