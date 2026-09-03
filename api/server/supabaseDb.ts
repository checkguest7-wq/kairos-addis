import { getSupabaseAdminClient } from './supabase';
import {
  UserAccount,
  UserDocumentsRecord,
  DatabaseSchema,
} from './db';
import {
  Vehicle,
  PortalVehicle,
  WarrantyDetails,
  ServiceRecord,
  Appointment,
  TestDriveRequest,
  NotificationItem,
  VehicleOrder,
  PortalMessage,
  PortalTestimonial,
  SiteSettings,
} from '../src/types';

// ============================================================================
// SUPABASE POSTGRESQL DATA LAYER
// Provides full persistence for Kairos Addis production on Vercel & Supabase
// ============================================================================

export function isSupabaseDatabaseEnabled(): boolean {
  if (process.env.DATABASE_MODE === 'local') return false;
  const admin = getSupabaseAdminClient();
  return !!admin;
}

// ----------------------------------------------------------------------------
// 1. PROFILES / USERS
// ----------------------------------------------------------------------------
export async function syncUserToSupabase(user: UserAccount): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.fullName || 'Kairos Customer',
      email: user.email.toLowerCase().trim(),
      phone: user.phone || '',
      role: user.role || 'customer',
      is_email_verified: !!user.isEmailVerified,
      verification_otp: user.verificationOtp || null,
      verification_otp_expires: user.verificationOtpExpires || null,
      password_hash: user.passwordHash || null,
      reset_token: user.resetToken || null,
      reset_token_expiry: user.resetTokenExpiry || null,
      last_resend_at: user.lastResendAt || null,
      last_reset_requested_at: user.lastResetRequestedAt || null,
      avatar: user.avatar || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[SUPABASE DB] syncUserToSupabase notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncUserToSupabase caught:', err?.message || err);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 2. CATALOG VEHICLES
// ----------------------------------------------------------------------------
export async function syncCatalogVehicleToSupabase(v: Vehicle): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('catalog_vehicles').upsert({
      id: v.id,
      name: v.name,
      brand: v.brand,
      category: v.category,
      body_type: v.bodyType,
      tagline: v.tagline || null,
      range_nedc: v.rangeNEDC || null,
      range_km: v.rangeKm || 0,
      seats: v.seats || 5,
      price_etb: typeof v.priceETB === 'number' ? v.priceETB : null,
      price_formatted_etb: v.priceFormattedETB || null,
      price_formatted: v.priceFormatted || v.priceFormattedETB || null,
      year: v.year || 2025,
      acceleration: v.acceleration || null,
      top_speed: v.topSpeed || null,
      battery_capacity: v.batteryCapacity || null,
      charging_time: v.chargingTime || null,
      drive_type: v.driveType || null,
      price_estimate: v.priceEstimate || null,
      thumbnail: v.thumbnail || null,
      side_image: v.sideImage || null,
      hero_image: v.heroImage || null,
      highlights: v.highlights || [],
      description: v.description || null,
      features: v.features || { safety: [], comfort: [], technology: [] },
      warranty_summary: v.warrantySummary || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[SUPABASE DB] syncCatalogVehicle notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncCatalogVehicle caught:', err?.message || err);
    return false;
  }
}

export async function deleteCatalogVehicleFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('catalog_vehicles').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// 3. PORTAL ORDERS
// ----------------------------------------------------------------------------
export async function syncOrderToSupabase(order: VehicleOrder): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_orders').upsert({
      id: order.id,
      order_number: order.orderNumber,
      user_id: order.userId,
      vehicle_id: order.vehicleId,
      vehicle_name: order.vehicleName,
      vehicle_brand: order.vehicleBrand,
      vehicle_image: order.vehicleImage,
      price_etb: typeof order.priceETB === 'number' ? order.priceETB : null,
      price_formatted_etb: order.priceFormattedETB || null,
      price_formatted: order.priceFormatted || order.priceFormattedETB || null,
      selected_color: order.selectedColor,
      notes: order.notes || null,
      order_date: order.orderDate,
      status: order.status,
      step_progress: order.stepProgress || 1,
      delivery_location: order.deliveryLocation || null,
      vin: order.vin || null,
      history: order.history || [],
    });

    if (error) {
      console.warn('[SUPABASE DB] syncOrder notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncOrder caught:', err?.message || err);
    return false;
  }
}

export async function deleteOrderFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_orders').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// 4. PORTAL VEHICLES (Customer Registered EVs)
// ----------------------------------------------------------------------------
export async function syncPortalVehicleToSupabase(v: PortalVehicle): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_vehicles').upsert({
      id: v.id,
      user_id: v.userId,
      model: v.model,
      brand: v.brand,
      registration_number: v.registrationNumber || null,
      vin: v.vin,
      purchase_date: v.purchaseDate || null,
      color: v.color || null,
      mileage_km: v.mileageKm || 0,
      battery_health_percent: v.batteryHealthPercent || 100,
      battery_capacity: v.batteryCapacity || null,
      estimated_range_km: v.estimatedRangeKm || 0,
      charge_status_percent: v.chargeStatusPercent || 100,
      tire_pressure_psi: v.tirePressurePsi || null,
      warranty_status: v.warrantyStatus || 'ACTIVE',
      software_version: v.softwareVersion || null,
      image_url: v.imageUrl || null,
    });

    if (error) {
      console.warn('[SUPABASE DB] syncPortalVehicle notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncPortalVehicle caught:', err?.message || err);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 5. WARRANTIES
// ----------------------------------------------------------------------------
export async function syncWarrantyToSupabase(w: WarrantyDetails): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_warranties').upsert({
      id: w.id,
      user_id: w.userId,
      vehicle_id: w.vehicleId,
      status: w.status,
      partner: w.partner,
      certificate_number: w.certificateNumber,
      start_date: w.startDate || null,
      vehicle_warranty_start_date: w.vehicleWarrantyStartDate || null,
      vehicle_warranty_years: w.vehicleWarrantyYears || 5,
      vehicle_warranty_km: w.vehicleWarrantyKm || 100000,
      vehicle_warranty_end_date: w.vehicleWarrantyEndDate,
      battery_warranty_start_date: w.batteryWarrantyStartDate || null,
      battery_warranty_years: w.batteryWarrantyYears || 8,
      battery_warranty_km: w.batteryWarrantyKm || 160000,
      battery_warranty_end_date: w.batteryWarrantyEndDate,
      current_km: w.currentKm || 0,
      covered_components: w.coveredComponents || [],
      recent_claims: w.recentClaims || [],
    });

    if (error) {
      console.warn('[SUPABASE DB] syncWarranty notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncWarranty caught:', err?.message || err);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 6. SERVICE RECORDS
// ----------------------------------------------------------------------------
export async function syncServiceRecordToSupabase(sr: ServiceRecord): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_service_records').upsert({
      id: sr.id,
      user_id: sr.userId,
      vehicle_id: sr.vehicleId,
      date: sr.date,
      service_type: sr.serviceType,
      vehicle: sr.vehicle,
      status: sr.status,
      mileage: sr.mileage || 0,
      facility: sr.facility,
      technician: sr.technician || null,
      cost_etb: sr.costETB || 0,
      notes: sr.notes || null,
      items_serviced: sr.itemsServiced || [],
    });

    if (error) {
      console.warn('[SUPABASE DB] syncServiceRecord notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncServiceRecord caught:', err?.message || err);
    return false;
  }
}

export async function deleteServiceRecordFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_service_records').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// 7. APPOINTMENTS
// ----------------------------------------------------------------------------
export async function syncAppointmentToSupabase(app: Appointment): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_appointments').upsert({
      id: app.id,
      user_id: app.userId,
      vehicle_id: app.vehicleId || null,
      service_type: app.serviceType,
      vehicle: app.vehicle,
      date: app.date,
      time: app.time,
      status: app.status,
      message: app.message || null,
      facility: app.facility,
      created_at: app.createdAt || new Date().toISOString(),
    });

    if (error) {
      console.warn('[SUPABASE DB] syncAppointment notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncAppointment caught:', err?.message || err);
    return false;
  }
}

export async function deleteAppointmentFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_appointments').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// 8. TEST DRIVES
// ----------------------------------------------------------------------------
export async function syncTestDriveToSupabase(td: TestDriveRequest): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_test_drives').upsert({
      id: td.id,
      user_id: td.userId || null,
      vehicle_name: td.vehicleName,
      vehicle_id: td.vehicleId || null,
      preferred_date: td.preferredDate,
      preferred_time: td.preferredTime,
      status: td.status,
      location: td.location,
      notes: td.notes || null,
      created_at: td.createdAt || new Date().toISOString(),
    });

    if (error) {
      console.warn('[SUPABASE DB] syncTestDrive notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncTestDrive caught:', err?.message || err);
    return false;
  }
}

export async function deleteTestDriveFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_test_drives').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// 9. NOTIFICATIONS
// ----------------------------------------------------------------------------
export async function syncNotificationToSupabase(n: NotificationItem): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_notifications').upsert({
      id: n.id,
      user_id: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      date: n.date,
      read: !!n.read,
      priority: n.priority || 'medium',
    });

    if (error) {
      console.warn('[SUPABASE DB] syncNotification notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncNotification caught:', err?.message || err);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 10. USER DOCUMENTS (Fayda ID & Driving Licence Uploads)
// ----------------------------------------------------------------------------
export async function syncUserDocumentsToSupabase(ud: UserDocumentsRecord): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    // Sanitized document record without raw huge base64 dataUrl if storagePath is present
    const sanitizedDocs = { ...ud.documents };

    const { error } = await supabase.from('user_documents').upsert({
      user_id: ud.userId,
      documents: sanitizedDocs,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[SUPABASE DB] syncUserDocuments notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncUserDocuments caught:', err?.message || err);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 11. SITE SETTINGS
// ----------------------------------------------------------------------------
export async function syncSettingsToSupabase(settings: SiteSettings): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('site_settings').upsert({
      id: 'current_config',
      data: settings,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[SUPABASE DB] syncSettings notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncSettings caught:', err?.message || err);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 12. TESTIMONIALS
// ----------------------------------------------------------------------------
export async function syncTestimonialToSupabase(t: PortalTestimonial): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return false;

  try {
    const { error } = await supabase.from('portal_testimonials').upsert({
      id: t.id,
      user_id: t.userId,
      customer_name: t.customerName,
      vehicle_owned: t.vehicleOwned || null,
      rating: t.rating || 5,
      title: t.title,
      message: t.message,
      status: t.status || 'Pending',
      submitted_at: t.submittedAt || new Date().toISOString(),
      reviewed_at: t.reviewedAt || null,
    });

    if (error) {
      console.warn('[SUPABASE DB] syncTestimonial notice:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DB] syncTestimonial caught:', err?.message || err);
    return false;
  }
}

// ============================================================================
// FULL DATABASE LOAD FROM SUPABASE
// ============================================================================
export async function loadAllFromSupabase(): Promise<Partial<DatabaseSchema> | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return null;

  try {
    const [
      { data: profiles },
      { data: catalogVehicles },
      { data: orders },
      { data: portalVehicles },
      { data: warranties },
      { data: services },
      { data: appointments },
      { data: testDrives },
      { data: notifications },
      { data: userDocs },
      { data: testimonials },
      { data: settingsRow },
    ] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('catalog_vehicles').select('*'),
      supabase.from('portal_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('portal_vehicles').select('*'),
      supabase.from('portal_warranties').select('*'),
      supabase.from('portal_service_records').select('*'),
      supabase.from('portal_appointments').select('*'),
      supabase.from('portal_test_drives').select('*'),
      supabase.from('portal_notifications').select('*').order('created_at', { ascending: false }),
      supabase.from('user_documents').select('*'),
      supabase.from('portal_testimonials').select('*'),
      supabase.from('site_settings').select('*').eq('id', 'current_config').maybeSingle(),
    ]);

    const result: Partial<DatabaseSchema> = {};

    if (profiles && profiles.length > 0) {
      result.users = profiles.map((p: any) => ({
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        phone: p.phone || '',
        role: p.role || 'customer',
        isEmailVerified: p.is_email_verified,
        verificationOtp: p.verification_otp,
        verificationOtpExpires: p.verification_otp_expires ? Number(p.verification_otp_expires) : undefined,
        passwordHash: p.password_hash || '',
        resetToken: p.reset_token,
        resetTokenExpiry: p.reset_token_expiry ? Number(p.reset_token_expiry) : undefined,
        lastResendAt: p.last_resend_at ? Number(p.last_resend_at) : undefined,
        lastResetRequestedAt: p.last_reset_requested_at ? Number(p.last_reset_requested_at) : undefined,
        avatar: p.avatar,
        createdAt: p.created_at || new Date().toISOString(),
      }));
    }

    if (catalogVehicles && catalogVehicles.length > 0) {
      result.catalogVehicles = catalogVehicles.map((v: any) => ({
        id: v.id,
        name: v.name,
        brand: v.brand,
        category: v.category,
        bodyType: v.body_type,
        tagline: v.tagline,
        rangeNEDC: v.range_nedc,
        rangeKm: v.range_km,
        seats: v.seats,
        priceETB: v.price_etb ? Number(v.price_etb) : 0,
        priceFormattedETB: v.price_formatted_etb || (v.price_etb ? `ETB ${Number(v.price_etb).toLocaleString()}` : 'ETB Price Pending Configuration'),
        priceFormatted: v.price_formatted || v.price_formatted_etb,
        year: v.year,
        acceleration: v.acceleration,
        topSpeed: v.top_speed,
        batteryCapacity: v.battery_capacity,
        chargingTime: v.charging_time,
        driveType: v.drive_type,
        priceEstimate: v.price_estimate,
        thumbnail: v.thumbnail,
        sideImage: v.side_image,
        heroImage: v.hero_image,
        highlights: v.highlights || [],
        description: v.description,
        features: v.features || { safety: [], comfort: [], technology: [] },
        warrantySummary: v.warranty_summary,
      }));
    }

    if (orders && orders.length > 0) {
      result.orders = orders.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        userId: o.user_id,
        vehicleId: o.vehicle_id,
        vehicleName: o.vehicle_name,
        vehicleBrand: o.vehicle_brand,
        vehicleImage: o.vehicle_image,
        priceETB: o.price_etb ? Number(o.price_etb) : null,
        priceFormattedETB: o.price_formatted_etb || (o.price_etb ? `ETB ${Number(o.price_etb).toLocaleString()}` : 'ETB Price Pending Configuration'),
        priceFormatted: o.price_formatted || o.price_formatted_etb,
        selectedColor: o.selected_color,
        notes: o.notes,
        orderDate: o.order_date,
        status: o.status,
        stepProgress: o.step_progress || 1,
        deliveryLocation: o.delivery_location,
        vin: o.vin,
        history: o.history || [],
      }));
    }

    if (portalVehicles && portalVehicles.length > 0) {
      result.vehicles = portalVehicles.map((pv: any) => ({
        id: pv.id,
        userId: pv.user_id,
        model: pv.model,
        brand: pv.brand,
        registrationNumber: pv.registration_number,
        vin: pv.vin,
        purchaseDate: pv.purchase_date,
        color: pv.color,
        mileageKm: pv.mileage_km,
        batteryHealthPercent: pv.battery_health_percent,
        batteryCapacity: pv.battery_capacity,
        estimatedRangeKm: pv.estimated_range_km,
        chargeStatusPercent: pv.charge_status_percent,
        tirePressurePsi: pv.tire_pressure_psi,
        warrantyStatus: pv.warranty_status,
        softwareVersion: pv.software_version,
        imageUrl: pv.image_url,
      }));
    }

    if (warranties && warranties.length > 0) {
      result.warranties = warranties.map((w: any) => ({
        id: w.id,
        userId: w.user_id,
        vehicleId: w.vehicle_id,
        status: w.status,
        partner: w.partner,
        certificateNumber: w.certificate_number,
        startDate: w.start_date,
        vehicleWarrantyStartDate: w.vehicle_warranty_start_date,
        vehicleWarrantyYears: w.vehicle_warranty_years,
        vehicleWarrantyKm: w.vehicle_warranty_km,
        vehicleWarrantyEndDate: w.vehicle_warranty_end_date,
        batteryWarrantyStartDate: w.battery_warranty_start_date,
        batteryWarrantyYears: w.battery_warranty_years,
        batteryWarrantyKm: w.battery_warranty_km,
        batteryWarrantyEndDate: w.battery_warranty_end_date,
        currentKm: w.current_km,
        coveredComponents: w.covered_components || [],
        recentClaims: w.recent_claims || [],
      }));
    }

    if (services && services.length > 0) {
      result.serviceRecords = services.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        vehicleId: s.vehicle_id,
        date: s.date,
        serviceType: s.service_type,
        vehicle: s.vehicle,
        status: s.status,
        mileage: s.mileage,
        facility: s.facility,
        technician: s.technician,
        costETB: s.cost_etb ? Number(s.cost_etb) : 0,
        notes: s.notes,
        itemsServiced: s.items_serviced || [],
      }));
    }

    if (appointments && appointments.length > 0) {
      result.appointments = appointments.map((a: any) => ({
        id: a.id,
        userId: a.user_id,
        vehicleId: a.vehicle_id,
        serviceType: a.service_type,
        vehicle: a.vehicle,
        date: a.date,
        time: a.time,
        status: a.status,
        message: a.message,
        facility: a.facility,
        createdAt: a.created_at,
      }));
    }

    if (testDrives && testDrives.length > 0) {
      result.testDrives = testDrives.map((td: any) => ({
        id: td.id,
        userId: td.user_id,
        vehicleName: td.vehicle_name,
        vehicleId: td.vehicle_id,
        preferredDate: td.preferred_date,
        preferredTime: td.preferred_time,
        status: td.status,
        location: td.location,
        notes: td.notes,
        createdAt: td.created_at,
      }));
    }

    if (notifications && notifications.length > 0) {
      result.notifications = notifications.map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        type: n.type,
        date: n.date,
        read: n.read,
        priority: n.priority,
      }));
    }

    if (userDocs && userDocs.length > 0) {
      result.userDocuments = userDocs.map((ud: any) => ({
        userId: ud.user_id,
        documents: ud.documents || {},
      }));
    }

    if (testimonials && testimonials.length > 0) {
      result.testimonials = testimonials.map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        customerName: t.customer_name,
        vehicleOwned: t.vehicle_owned,
        rating: t.rating,
        title: t.title,
        message: t.message,
        status: t.status,
        submittedAt: t.submitted_at,
        reviewedAt: t.reviewed_at,
      }));
    }

    if (settingsRow && settingsRow.data) {
      result.settings = settingsRow.data as SiteSettings;
    }

    console.log('[SUPABASE DB] Successfully loaded persistent state from Supabase PostgreSQL.');
    return result;
  } catch (err: any) {
    console.error('[SUPABASE DB ERROR] Failed to load data from Supabase:', err?.message || err);
    return null;
  }
}

// ----------------------------------------------------------------------------
// SEED INITIAL DATA TO SUPABASE (Runs once if Supabase tables are empty)
// ----------------------------------------------------------------------------
export async function seedSupabaseInitialData(db: DatabaseSchema): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase || process.env.DATABASE_MODE === 'local') return;

  try {
    // Check if catalog_vehicles is empty
    const { count: vehicleCount } = await supabase
      .from('catalog_vehicles')
      .select('*', { count: 'exact', head: true });

    if (!vehicleCount || vehicleCount === 0) {
      console.log('[SUPABASE DB] Seeding initial vehicle catalog into Supabase...');
      for (const v of db.catalogVehicles) {
        await syncCatalogVehicleToSupabase(v);
      }
    }

    // Check if site_settings is empty
    const { data: existingSettings } = await supabase
      .from('site_settings')
      .select('id')
      .eq('id', 'current_config')
      .maybeSingle();

    if (!existingSettings) {
      console.log('[SUPABASE DB] Seeding initial site settings into Supabase...');
      await syncSettingsToSupabase(db.settings);
    }

    // Check if profiles are empty
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if ((!profileCount || profileCount === 0) && db.users.length > 0) {
      console.log('[SUPABASE DB] Seeding initial admin and seed users into Supabase...');
      for (const u of db.users) {
        await syncUserToSupabase(u);
      }
    }
  } catch (err: any) {
    console.warn('[SUPABASE DB SEED NOTICE]', err?.message || err);
  }
}
