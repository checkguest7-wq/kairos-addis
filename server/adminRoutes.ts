import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabase, UserAccount } from './db';
import {
  getSupabaseAdminClient,
  saveMessageToSupabase,
  deleteContactMessagesFromSupabase,
  getSupabaseMessages,
  createDocumentSignedUrl,
} from './supabase';
import {
  syncUserToSupabase,
  syncOrderToSupabase,
  deleteOrderFromSupabase,
  syncPortalVehicleToSupabase,
  syncWarrantyToSupabase,
  syncServiceRecordToSupabase,
  deleteServiceRecordFromSupabase,
  syncAppointmentToSupabase,
  syncTestDriveToSupabase,
  syncNotificationToSupabase,
  syncUserDocumentsToSupabase,
  syncCatalogVehicleToSupabase,
  deleteCatalogVehicleFromSupabase,
  syncSettingsToSupabase,
} from './supabaseDb';
import {
  Vehicle,
  VehicleOrder,
  Appointment,
  ServiceRecord,
  WarrantyDetails,
  TestDriveRequest,
  NotificationItem,
  PortalMessage,
  CustomerDocuments,
  CustomerDocumentItem,
  SiteSettings,
  AdminOverviewStats,
  AdminClientSummary,
  AdminClientDossier,
} from '../src/types';
import { AuthenticatedRequest } from './app';

export function registerAdminRoutes(app: express.Express, requireAuth: any) {
  // Helper for admin role checking
  const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      const db = getDatabase();
      const user = db.users.find((u) => u.id === req.user!.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
      }
      next();
    });
  };

  // ==========================================
  // PUBLIC GENERAL CATALOG & SETTINGS
  // ==========================================
  app.get('/api/vehicles', (req: Request, res: Response) => {
    const db = getDatabase();
    res.json({ vehicles: db.catalogVehicles || [] });
  });

  app.get('/api/settings', (req: Request, res: Response) => {
    const db = getDatabase();
    res.json({ settings: db.settings });
  });

  // ==========================================
  // ADMIN DASHBOARD OVERVIEW STATS
  // ==========================================
  app.get('/api/admin/overview', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();

    const clients = db.users.filter((u) => u.role !== 'admin');
    const pendingOrders = db.orders.filter(
      (o) => o.status === 'Order Received' || o.status === 'Under Review'
    ).length;
    const acceptedOrders = db.orders.filter(
      (o) => o.status !== 'Order Received' && o.status !== 'Under Review' && o.status !== 'Cancelled'
    ).length;
    const completedOrders = db.orders.filter((o) => o.status === 'Completed').length;
    const pendingServices = db.appointments.filter((a) => a.status === 'Pending').length;
    const scheduledServices = db.appointments.filter(
      (a) => (a.status as string) === 'Confirmed' || (a.status as string) === 'Scheduled' || (a.status as string) === 'In Progress'
    ).length;
    const upcomingTestDrives = db.testDrives.filter(
      (t) => t.status === 'Confirmed' || t.status === 'Pending Review'
    ).length;

    // Count unverified docs
    let unverifiedDocuments = 0;
    db.userDocuments.forEach((docRec) => {
      const docs = docRec.documents;
      Object.values(docs).forEach((docItem) => {
        if (docItem && (docItem.status === 'Uploaded' || docItem.status === 'Pending Review')) {
          unverifiedDocuments++;
        }
      });
    });

    const unreadMessages = db.messages.filter((m) => m.sender === 'customer' && !m.read).length;
    const totalCatalogVehicles = db.catalogVehicles ? db.catalogVehicles.length : 0;
    const activeWarrantiesCount = db.warranties.filter((w) => w.status === 'ACTIVE').length;

    const stats: AdminOverviewStats = {
      totalClients: clients.length,
      pendingOrders,
      acceptedOrders,
      completedOrders,
      pendingServices,
      scheduledServices,
      upcomingTestDrives,
      unverifiedDocuments,
      unreadMessages,
      totalCatalogVehicles,
      activeWarrantiesCount,
    };

    // Recent activities feed
    const recentActivities = [
      ...db.orders.slice(0, 4).map((o) => ({
        id: o.id,
        type: 'order',
        title: `Order #${o.orderNumber}: ${o.vehicleName}`,
        date: o.orderDate,
        status: o.status,
      })),
      ...db.testDrives.slice(0, 3).map((t) => ({
        id: t.id,
        type: 'test_drive',
        title: `Test Drive: ${t.vehicleName}`,
        date: t.preferredDate,
        status: t.status,
      })),
      ...db.appointments.slice(0, 3).map((a) => ({
        id: a.id,
        type: 'service',
        title: `Service: ${a.vehicle}`,
        date: a.date,
        status: a.status,
      })),
    ].sort((a, b) => b.id.localeCompare(a.id));

    res.json({
      stats,
      recentActivities,
      settings: db.settings,
    });
  });

  // ==========================================
  // CLIENTS MANAGEMENT
  // ==========================================
  app.get('/api/admin/clients', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const customers = db.users.filter((u) => u.role !== 'admin');

    const clientSummaries: AdminClientSummary[] = customers.map((c) => {
      const orders = db.orders.filter((o) => o.userId === c.id);
      const userDoc = db.userDocuments.find((d) => d.userId === c.id);
      const docs = userDoc?.documents || {};
      
      let documentsCount = 0;
      let documentsVerifiedCount = 0;
      ['faydaIdFront', 'faydaIdBack', 'drivingLicenceFront', 'drivingLicenceBack'].forEach((key) => {
        const item = docs[key as keyof CustomerDocuments];
        if (item) {
          documentsCount++;
          if (item.status === 'Verified') {
            documentsVerifiedCount++;
          }
        }
      });

      const hasAllDocs = documentsCount === 4;
      const warranty = db.warranties.find((w) => w.userId === c.id);
      const testDrives = db.testDrives.filter((t) => t.userId === c.id);
      const vehicle = db.vehicles.find((v) => v.userId === c.id);

      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        createdAt: c.createdAt,
        isEmailVerified: c.isEmailVerified,
        role: c.role || 'customer',
        ordersCount: orders.length,
        documentsCount,
        hasAllDocs,
        documentsVerifiedCount,
        warrantyActive: warranty?.status === 'ACTIVE',
        testDrivesCount: testDrives.length,
        vehicleName: vehicle?.model || (orders[0]?.vehicleName ?? undefined),
      };
    });

    res.json({ clients: clientSummaries });
  });

  app.get('/api/admin/clients/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const db = getDatabase();

    const user = db.users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'Client account not found.' });
    }

    const docRecord = db.userDocuments.find((d) => d.userId === id);
    const documents: CustomerDocuments = docRecord?.documents || {
      faydaIdFront: null,
      faydaIdBack: null,
      drivingLicenceFront: null,
      drivingLicenceBack: null,
    };

    const hasAllDocs = !!(
      documents.faydaIdFront &&
      documents.faydaIdBack &&
      documents.drivingLicenceFront &&
      documents.drivingLicenceBack
    );

    const orders = db.orders.filter((o) => o.userId === id);
    const vehicle = db.vehicles.find((v) => v.userId === id) || null;
    const warranty = db.warranties.find((w) => w.userId === id) || null;
    const serviceRecords = db.serviceRecords.filter((s) => s.userId === id);
    const appointments = db.appointments.filter((a) => a.userId === id);
    const testDrives = db.testDrives.filter((t) => t.userId === id);
    const messages = db.messages.filter((m) => m.userId === id);
    const notifications = db.notifications.filter((n) => n.userId === id);

    const dossier: AdminClientDossier = {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        isEmailVerified: user.isEmailVerified,
        role: user.role || 'customer',
      },
      documents,
      hasAllDocs,
      orders,
      vehicle,
      warranty,
      serviceRecords,
      appointments,
      testDrives,
      messages,
      notifications,
    };

    res.json({ dossier });
  });

  app.put('/api/admin/clients/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { fullName, phone, role, isEmailVerified } = req.body;
    const db = getDatabase();

    const user = db.users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'Client account not found.' });
    }

    if (fullName) user.fullName = fullName.trim();
    if (phone) user.phone = phone.trim();
    if (role) user.role = role;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

    saveDatabase();
    syncUserToSupabase(user).catch(() => {});
    res.json({ message: 'Client profile updated successfully.', user });
  });

  // ==========================================
  // VEHICLES CATALOG MANAGEMENT (ADD / EDIT / DELETE)
  // ==========================================
  app.get('/api/admin/vehicles', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    res.json({ vehicles: db.catalogVehicles || [] });
  });

  app.post('/api/admin/vehicles', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const newVeh: Vehicle = req.body;

    if (!newVeh.name || !newVeh.brand) {
      return res.status(400).json({ error: 'Vehicle name and brand are required.' });
    }

    const cleanId = newVeh.id || newVeh.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const etbPrice = newVeh.priceETB ? Number(newVeh.priceETB) : null;
    const formattedETB = newVeh.priceFormattedETB || (etbPrice && etbPrice > 0 ? `ETB ${etbPrice.toLocaleString()}` : 'ETB Price Pending Configuration');

    const vehicleToAdd: Vehicle = {
      ...newVeh,
      id: cleanId,
      highlights: Array.isArray(newVeh.highlights) ? newVeh.highlights : [],
      features: newVeh.features || { safety: [], comfort: [], technology: [] },
      priceETB: etbPrice,
      priceFormattedETB: formattedETB,
      priceFormatted: formattedETB,
    };

    // Prevent duplicate IDs
    const existingIndex = db.catalogVehicles.findIndex((v) => v.id === vehicleToAdd.id);
    if (existingIndex >= 0) {
      db.catalogVehicles[existingIndex] = vehicleToAdd;
    } else {
      db.catalogVehicles.unshift(vehicleToAdd);
    }

    saveDatabase();
    syncCatalogVehicleToSupabase(vehicleToAdd).catch((err) => console.warn('[SUPABASE CATALOG SYNC]', err));
    res.status(201).json({ message: 'Vehicle added to catalog successfully.', vehicle: vehicleToAdd });
  });

  app.put('/api/admin/vehicles/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const db = getDatabase();
    const idx = db.catalogVehicles.findIndex((v) => v.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Vehicle not found in catalog.' });
    }

    db.catalogVehicles[idx] = {
      ...db.catalogVehicles[idx],
      ...req.body,
      id, // Preserve id
    };

    saveDatabase();
    syncCatalogVehicleToSupabase(db.catalogVehicles[idx]).catch((err) => console.warn('[SUPABASE CATALOG UPDATE SYNC]', err));
    res.json({ message: 'Vehicle updated successfully.', vehicle: db.catalogVehicles[idx] });
  });

  app.delete('/api/admin/vehicles/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const db = getDatabase();
    db.catalogVehicles = db.catalogVehicles.filter((v) => v.id !== id);
    saveDatabase();
    deleteCatalogVehicleFromSupabase(id).catch((err) => console.warn('[SUPABASE CATALOG DELETE SYNC]', err));
    res.json({ message: 'Vehicle removed from catalog successfully.' });
  });

  // ==========================================
  // ORDERS MANAGEMENT & WORKFLOW ENFORCEMENT
  // ==========================================
  app.get('/api/admin/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();

    // Enrich orders with user details and doc verification flags
    const enrichedOrders = db.orders.map((order) => {
      const customer = db.users.find((u) => u.id === order.userId);
      const userDoc = db.userDocuments.find((d) => d.userId === order.userId);
      const docs = userDoc?.documents || {};

      const isFaydaVerified = docs.faydaIdFront?.status === 'Verified' && docs.faydaIdBack?.status === 'Verified';
      const isDlVerified = docs.drivingLicenceFront?.status === 'Verified' && docs.drivingLicenceBack?.status === 'Verified';
      const allDocsUploaded = !!(docs.faydaIdFront && docs.faydaIdBack && docs.drivingLicenceFront && docs.drivingLicenceBack);
      const allDocsVerified = isFaydaVerified && isDlVerified;

      return {
        ...order,
        customer: customer
          ? {
              id: customer.id,
              fullName: customer.fullName,
              email: customer.email,
              phone: customer.phone,
            }
          : null,
        documentsStatus: {
          allDocsUploaded,
          allDocsVerified,
          isFaydaVerified,
          isDlVerified,
          faydaFront: docs.faydaIdFront,
          faydaBack: docs.faydaIdBack,
          dlFront: docs.drivingLicenceFront,
          dlBack: docs.drivingLicenceBack,
        },
      };
    });

    res.json({ orders: enrichedOrders });
  });

  app.put('/api/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, note, vin, stepProgress, forceAccept } = req.body;
    const db = getDatabase();

    const orderIndex = db.orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const order = db.orders[orderIndex];
    const customer = db.users.find((u) => u.id === order.userId);
    const userDoc = db.userDocuments.find((d) => d.userId === order.userId);
    const docs = userDoc?.documents || {};

    // STRICT BUSINESS RULE:
    // To advance beyond 'Order Received' / 'Under Review' to 'Documents Verified', 'Payment Processing',
    // 'Preparing Vehicle', 'Ready for Delivery', or 'Completed', Fayda & DL must be verified!
    const advancingStatuses = [
      'Documents Verified',
      'Payment Processing',
      'Preparing Vehicle',
      'Ready for Delivery',
      'Completed',
    ];

    if (advancingStatuses.includes(status) && !forceAccept) {
      const isFaydaOk = docs.faydaIdFront && docs.faydaIdBack;
      const isDlOk = docs.drivingLicenceFront && docs.drivingLicenceBack;

      if (!isFaydaOk || !isDlOk) {
        return res.status(400).json({
          error: 'Document verification incomplete: Customer must upload Fayda National ID (Front & Back) and Driving Licence (Front & Back) before accepting this order.',
          code: 'DOCUMENTS_INCOMPLETE',
        });
      }
    }

    // Update status
    order.status = status;
    if (stepProgress !== undefined) {
      order.stepProgress = stepProgress;
    } else {
      const stepMap: Record<string, number> = {
        'Order Received': 1,
        'Under Review': 1,
        'Documents Verified': 2,
        'Payment Processing': 3,
        'Preparing Vehicle': 4,
        'Ready for Delivery': 5,
        'Completed': 6,
        'Cancelled': 1,
      };
      if (stepMap[status]) order.stepProgress = stepMap[status];
    }

    if (vin) order.vin = vin;

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    order.history.unshift({
      status,
      date: dateStr,
      note: note || `Order status updated to "${status}" by Kairos concierge administration.`,
    });

    // Notify customer in portal
    db.notifications.unshift({
      id: `notif_ord_${Date.now()}`,
      userId: order.userId,
      title: `Order Update: ${status}`,
      message: `Your order #${order.orderNumber} for ${order.vehicleName} has been updated to "${status}". ${note || ''}`,
      type: 'update',
      date: 'Just now',
      read: false,
      priority: 'high',
    });

    // If order reaches Completed, auto-register customer vehicle and warranty if not already present
    let newlyRegisteredVehicle: any = null;
    let newlyRegisteredWarranty: any = null;
    if (status === 'Completed' && order.vin) {
      const existingVehicle = db.vehicles.find((v) => v.vin === order.vin);
      if (!existingVehicle) {
        newlyRegisteredVehicle = {
          id: `veh_${Date.now()}`,
          userId: order.userId,
          model: order.vehicleName,
          brand: order.vehicleBrand,
          registrationNumber: `AA 3-${Math.floor(10000 + Math.random() * 90000)}`,
          vin: order.vin,
          purchaseDate: dateStr,
          color: order.selectedColor,
          mileageKm: 15,
          batteryHealthPercent: 100,
          batteryCapacity: '100% Factory Nominal',
          estimatedRangeKm: 530,
          chargeStatusPercent: 100,
          tirePressurePsi: { frontLeft: 36, frontRight: 36, rearLeft: 38, rearRight: 38 },
          warrantyStatus: 'ACTIVE',
          softwareVersion: 'DiLink / Flyme OS v4.3.0',
          imageUrl: order.vehicleImage,
        };
        db.vehicles.push(newlyRegisteredVehicle);
      }

      const vehicleForWarranty = existingVehicle || newlyRegisteredVehicle;
      if (vehicleForWarranty) {
        const existingWarranty = db.warranties.find(
          (w) => w.vehicleId === vehicleForWarranty.id || (w.userId === order.userId && w.status === 'ACTIVE')
        );
        if (!existingWarranty) {
          const currentYear = new Date().getFullYear();
          newlyRegisteredWarranty = {
            id: `war_${Date.now()}`,
            userId: order.userId,
            vehicleId: vehicleForWarranty.id,
            status: 'ACTIVE' as const,
            partner: 'YouGuard Warranty Services (Official Partner)',
            certificateNumber: `YG-ETH-${currentYear}-${Math.floor(10000 + Math.random() * 90000)}`,
            startDate: dateStr,
            vehicleWarrantyStartDate: dateStr,
            vehicleWarrantyYears: 5,
            vehicleWarrantyKm: 100000,
            vehicleWarrantyEndDate: `${dateStr.split(',')[0]}, ${currentYear + 5}`,
            batteryWarrantyStartDate: dateStr,
            batteryWarrantyYears: 8,
            batteryWarrantyKm: 160000,
            batteryWarrantyEndDate: `${dateStr.split(',')[0]}, ${currentYear + 8}`,
            currentKm: 15,
            coveredComponents: [
              { name: 'High-Voltage Blade Battery Pack & BMS', coveragePeriod: '8 Years / 160,000 KM', status: 'ACTIVE' },
              { name: 'Dual Electric Motors & Power Electronics', coveragePeriod: '5 Years / 100,000 KM', status: 'ACTIVE' },
              { name: 'Integrated Onboard Charger & Inverter', coveragePeriod: '5 Years / 100,000 KM', status: 'ACTIVE' },
              { name: 'Chassis, Suspension & Active Dampers', coveragePeriod: '3 Years / 60,000 KM', status: 'ACTIVE' },
              { name: 'DiLink / Flyme Intelligent Cockpit', coveragePeriod: '3 Years / 60,000 KM', status: 'ACTIVE' },
            ],
            recentClaims: [],
          };
          db.warranties.unshift(newlyRegisteredWarranty);
        }
      }
    }

    saveDatabase();
    syncOrderToSupabase(order).catch((err) => console.warn('[SUPABASE ORDER STATUS SYNC]', err));
    syncNotificationToSupabase(db.notifications[0]).catch(() => {});
    if (newlyRegisteredVehicle) {
      syncPortalVehicleToSupabase(newlyRegisteredVehicle).catch(() => {});
    }
    if (newlyRegisteredWarranty) {
      syncWarrantyToSupabase(newlyRegisteredWarranty).catch(() => {});
    }
    res.json({ message: `Order updated to ${status}.`, order });
  });

  app.delete('/api/admin/orders/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const db = getDatabase();

    const orderIndex = db.orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const order = db.orders[orderIndex];
    const orderNum = order.orderNumber;
    db.orders.splice(orderIndex, 1);

    saveDatabase();
    deleteOrderFromSupabase(id).catch((err) => console.warn('[SUPABASE ORDER DELETE SYNC]', err));
    res.json({ message: `Order #${orderNum} has been permanently deleted.` });
  });

  // ==========================================
  // SERVICES & APPOINTMENTS MANAGEMENT
  // ==========================================
  app.get('/api/admin/services', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();

    const appointmentsEnriched = db.appointments.map((apt) => {
      const customer = db.users.find((u) => u.id === apt.userId);
      return {
        ...apt,
        customer: customer ? { fullName: customer.fullName, email: customer.email, phone: customer.phone } : null,
      };
    });

    const serviceRecordsEnriched = db.serviceRecords.map((srv) => {
      const customer = db.users.find((u) => u.id === srv.userId);
      return {
        ...srv,
        customer: customer ? { fullName: customer.fullName, email: customer.email, phone: customer.phone } : null,
      };
    });

    res.json({ appointments: appointmentsEnriched, serviceRecords: serviceRecordsEnriched });
  });

  app.post('/api/admin/services', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { userId, vehicle, serviceType, date, time, facility, technician, costETB, notes, itemsServiced, status } = req.body;
    const db = getDatabase();

    if (!userId || !date) {
      return res.status(400).json({ error: 'Customer ID and appointment date are required.' });
    }

    const customer = db.users.find((u) => u.id === userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      userId,
      vehicleId: 'assigned_veh',
      serviceType: serviceType || 'Routine EV Diagnostic & Service',
      vehicle: vehicle || 'Electric Vehicle',
      date,
      time: time || '10:00 AM',
      status: status || 'Confirmed',
      facility: facility || 'Kairos Addis Bole Medhanialem EV Center',
      message: notes || 'Service scheduled by master technician',
      createdAt: new Date().toISOString(),
    };
    db.appointments.unshift(newApt);

    // Create companion service record
    const newRecord: ServiceRecord = {
      id: `srv_${Date.now()}`,
      userId,
      vehicleId: 'assigned_veh',
      date,
      serviceType: serviceType || 'Routine EV Diagnostic & Service',
      vehicle: vehicle || 'Electric Vehicle',
      status: (status === 'Completed' ? 'Completed' : 'Scheduled') as any,
      mileage: 0,
      facility: facility || 'Kairos Addis Bole Medhanialem EV Center',
      technician: technician || 'Yonas Getachew (Master EV Tech)',
      costETB: Number(costETB) || 0,
      notes: notes || 'Scheduled service appointment created by admin.',
      itemsServiced: Array.isArray(itemsServiced) ? itemsServiced : ['High-Voltage Diagnostic Scan', 'Brake & Regeneration Calibration'],
    };
    db.serviceRecords.unshift(newRecord);

    // Send customer notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId,
      title: 'Service Appointment Scheduled',
      message: `A service session for your ${vehicle || 'EV'} has been scheduled on ${date} at ${time || '10:00 AM'} at ${facility || 'Bole Medhanialem Center'}.`,
      type: 'service',
      date: 'Just now',
      read: false,
      priority: 'high',
    });

    saveDatabase();
    syncAppointmentToSupabase(newApt).catch(() => {});
    syncServiceRecordToSupabase(newRecord).catch(() => {});
    syncNotificationToSupabase(db.notifications[0]).catch(() => {});
    res.status(201).json({ message: 'Service scheduled successfully.', appointment: newApt, serviceRecord: newRecord });
  });

  app.put('/api/admin/services/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, date, time, technician, costETB, notes, itemsServiced, facility } = req.body;
    const db = getDatabase();

    const aptIndex = db.appointments.findIndex((a) => a.id === id);
    const srvIndex = db.serviceRecords.findIndex((s) => s.id === id);

    let updatedApt = null;
    let userId = '';

    if (aptIndex !== -1) {
      const apt = db.appointments[aptIndex];
      userId = apt.userId;
      if (status) apt.status = status;
      if (date) apt.date = date;
      if (time) apt.time = time;
      if (facility) apt.facility = facility;
      if (notes) apt.message = notes;
      updatedApt = apt;
    }

    if (srvIndex !== -1) {
      const srv = db.serviceRecords[srvIndex];
      userId = srv.userId;
      if (status) srv.status = status;
      if (date) srv.date = date;
      if (technician) srv.technician = technician;
      if (costETB !== undefined) srv.costETB = Number(costETB);
      if (notes) srv.notes = notes;
      if (facility) srv.facility = facility;
      if (itemsServiced) srv.itemsServiced = itemsServiced;
    }

    if (userId) {
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId,
        title: `Service Status: ${status || 'Updated'}`,
        message: `Your service record has been updated by the Bole Medhanialem technical team: status is now "${status}".`,
        type: 'service',
        date: 'Just now',
        read: false,
        priority: 'medium',
      });
    }

    saveDatabase();
    if (updatedApt) syncAppointmentToSupabase(updatedApt).catch(() => {});
    if (srvIndex !== -1) syncServiceRecordToSupabase(db.serviceRecords[srvIndex]).catch(() => {});
    if (userId) syncNotificationToSupabase(db.notifications[0]).catch(() => {});
    res.json({ message: 'Service record updated successfully.', appointment: updatedApt });
  });

  app.delete('/api/admin/services/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const db = getDatabase();

    const aptIndex = db.appointments.findIndex((a) => a.id === id);
    const srvIndex = db.serviceRecords.findIndex((s) => s.id === id);

    if (aptIndex === -1 && srvIndex === -1) {
      return res.status(404).json({ error: 'Service record or appointment not found.' });
    }

    if (aptIndex !== -1) {
      db.appointments.splice(aptIndex, 1);
    }
    if (srvIndex !== -1) {
      db.serviceRecords.splice(srvIndex, 1);
    }

    saveDatabase();
    deleteServiceRecordFromSupabase(id).catch(() => {});
    res.json({ message: 'Service record deleted successfully.' });
  });

  // ==========================================
  // WARRANTIES MANAGEMENT (YOUGUARD PARTNERSHIP)
  // ==========================================
  app.get('/api/admin/warranties', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const enriched = db.warranties.map((w) => {
      const customer = db.users.find((u) => u.id === w.userId);
      const vehicle = db.vehicles.find((v) => v.id === w.vehicleId || v.userId === w.userId);
      return {
        ...w,
        customer: customer ? { fullName: customer.fullName, email: customer.email, phone: customer.phone } : null,
        vehicleModel: vehicle?.model || 'Electric Vehicle',
      };
    });
    res.json({ warranties: enriched });
  });

  app.post('/api/admin/warranties', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const {
      userId,
      vehicleId,
      certificateNumber,
      startDate,
      vehicleWarrantyYears,
      vehicleWarrantyKm,
      batteryWarrantyYears,
      batteryWarrantyKm,
      currentKm,
      coveredComponents,
    } = req.body;
    const db = getDatabase();

    if (!userId) {
      return res.status(400).json({ error: 'Customer ID is required.' });
    }

    const customer = db.users.find((u) => u.id === userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer account not found.' });
    }

    // STRICT RULE: Cannot register warranty unless vehicle order is ACCEPTED or customer has a vehicle!
    const hasAcceptedOrder = db.orders.some(
      (o) => o.userId === userId && o.status !== 'Order Received' && o.status !== 'Cancelled'
    );
    const hasVehicle = db.vehicles.some((v) => v.userId === userId);

    if (!hasAcceptedOrder && !hasVehicle) {
      return res.status(400).json({
        error: 'Cannot register warranty: Customer does not have an accepted vehicle order or registered vehicle on file.',
      });
    }

    const start = startDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const startYear = new Date(start).getFullYear() || new Date().getFullYear();
    const vYears = Number(vehicleWarrantyYears) || 5;
    const bYears = Number(batteryWarrantyYears) || 8;

    const certNum = certificateNumber || `YG-ETH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newWarranty: WarrantyDetails = {
      id: `war_${Date.now()}`,
      userId,
      vehicleId: vehicleId || 'user_veh',
      status: 'ACTIVE',
      partner: 'YouGuard Warranty Services (Official Partner)',
      certificateNumber: certNum,
      startDate: start,
      vehicleWarrantyStartDate: start,
      vehicleWarrantyYears: vYears,
      vehicleWarrantyKm: Number(vehicleWarrantyKm) || 100000,
      vehicleWarrantyEndDate: `${start.split(',')[0]}, ${startYear + vYears}`,
      batteryWarrantyStartDate: start,
      batteryWarrantyYears: bYears,
      batteryWarrantyKm: Number(batteryWarrantyKm) || 160000,
      batteryWarrantyEndDate: `${start.split(',')[0]}, ${startYear + bYears}`,
      currentKm: Number(currentKm) || 0,
      coveredComponents: coveredComponents || [
        { name: 'High-Voltage Blade Battery Pack & BMS', coveragePeriod: `${bYears} Years / ${batteryWarrantyKm || 160000} KM`, status: 'ACTIVE' },
        { name: 'Dual Electric Motors & Power Electronics', coveragePeriod: `${vYears} Years / ${vehicleWarrantyKm || 100000} KM`, status: 'ACTIVE' },
        { name: 'Integrated Onboard Charger & Inverter', coveragePeriod: `${vYears} Years / ${vehicleWarrantyKm || 100000} KM`, status: 'ACTIVE' },
        { name: 'Chassis, Suspension & Active Dampers', coveragePeriod: '3 Years / 60,000 KM', status: 'ACTIVE' },
        { name: 'DiLink / Flyme Intelligent Cockpit', coveragePeriod: '3 Years / 60,000 KM', status: 'ACTIVE' },
      ],
      recentClaims: [],
    };

    // Remove old or replace
    db.warranties = db.warranties.filter((w) => w.userId !== userId);
    db.warranties.unshift(newWarranty);

    // Notify customer
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId,
      title: 'YouGuard Warranty Certificate Issued',
      message: `Your official YouGuard Warranty Certificate (#${certNum}) is now active: ${vYears}-Year Vehicle & ${bYears}-Year Battery Protection.`,
      type: 'warranty',
      date: 'Just now',
      read: false,
      priority: 'high',
    });

    saveDatabase();
    syncWarrantyToSupabase(newWarranty).catch(() => {});
    syncNotificationToSupabase(db.notifications[0]).catch(() => {});
    res.status(201).json({ message: 'Warranty certificate registered and active.', warranty: newWarranty });
  });

  // ==========================================
  // TEST DRIVES MANAGEMENT
  // ==========================================
  app.get('/api/admin/test-drives', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    const enriched = db.testDrives.map((td) => {
      const customer = db.users.find((u) => u.id === td.userId);
      return {
        ...td,
        customer: customer ? { fullName: customer.fullName, email: customer.email, phone: customer.phone } : null,
      };
    });
    res.json({ testDrives: enriched });
  });

  app.put('/api/admin/test-drives/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, preferredDate, preferredTime, location, notes } = req.body;
    const db = getDatabase();

    const idx = db.testDrives.findIndex((t) => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Test drive booking not found.' });
    }

    const td = db.testDrives[idx];

    // Status workflow restrictions:
    // If a test drive booking is Cancelled, no status transitions are permitted.
    if (td.status === 'Cancelled' && status && status !== 'Cancelled') {
      return res.status(400).json({ error: 'Cancelled test drive bookings cannot be re-activated or transitioned.' });
    }
    // If already Completed, cannot revert
    if (td.status === 'Completed' && status && status !== 'Completed') {
      return res.status(400).json({ error: 'Completed test drives are archived and cannot be modified.' });
    }

    if (status) td.status = status;
    if (preferredDate) td.preferredDate = preferredDate;
    if (preferredTime) td.preferredTime = preferredTime;
    if (location) td.location = location;
    if (notes) td.notes = notes;

    // Send customer notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: td.userId,
      title: `Test Drive ${status || 'Updated'}`,
      message: `Your test drive booking for ${td.vehicleName} is now "${td.status}" for ${td.preferredDate} at ${td.preferredTime}. Location: ${td.location}`,
      type: 'appointment',
      date: 'Just now',
      read: false,
      priority: 'high',
    });

    saveDatabase();
    syncTestDriveToSupabase(td).catch(() => {});
    syncNotificationToSupabase(db.notifications[0]).catch(() => {});
    res.json({ message: 'Test drive updated successfully.', testDrive: td });
  });

  app.delete('/api/admin/test-drives/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const db = getDatabase();

    const idx = db.testDrives.findIndex((t) => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Test drive booking not found.' });
    }

    const td = db.testDrives[idx];
    td.status = 'Cancelled';
    db.testDrives.splice(idx, 1);
    saveDatabase();
    syncTestDriveToSupabase(td).catch(() => {});
    res.json({ message: 'Test drive booking deleted successfully.' });
  });

  // ==========================================
  // DOCUMENT VERIFICATION MANAGEMENT (FAYDA & DRIVING LICENCE)
  // ==========================================
  app.get('/api/admin/verifications', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();

    const pendingList: Array<{
      userId: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      docType: string;
      document: CustomerDocumentItem;
    }> = [];

    for (const docRecord of db.userDocuments) {
      const user = db.users.find((u) => u.id === docRecord.userId);
      if (!user) continue;

      const docs = docRecord.documents;
      for (const [docType, docItem] of Object.entries(docs)) {
        if (docItem) {
          if (docItem.storagePath) {
            try {
              const signedUrl = await createDocumentSignedUrl(docItem.storagePath, 3600);
              if (signedUrl) {
                docItem.fileUrl = signedUrl;
                docItem.dataUrl = signedUrl;
              }
            } catch {}
          }
          pendingList.push({
            userId: user.id,
            customerName: user.fullName,
            customerEmail: user.email,
            customerPhone: user.phone,
            docType,
            document: docItem,
          });
        }
      }
    }

    res.json({ verifications: pendingList });
  });

  app.get('/api/admin/documents/:userId/:docType/view', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const { userId, docType } = req.params;
    const db = getDatabase();
    const docRecord = db.userDocuments.find((d) => d.userId === userId);
    const docItem = docRecord?.documents[docType as keyof CustomerDocuments];

    if (!docItem) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (docItem.storagePath) {
      const signedUrl = await createDocumentSignedUrl(docItem.storagePath, 3600);
      if (signedUrl) {
        return res.redirect(signedUrl);
      }
    }

    if (docItem.dataUrl && docItem.dataUrl.startsWith('data:')) {
      const match = docItem.dataUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        res.setHeader('Content-Type', match[1]);
        return res.send(Buffer.from(match[2], 'base64'));
      }
    }

    return res.status(404).json({ error: 'Document file could not be retrieved.' });
  });

  app.post('/api/admin/verifications/action', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { userId, docType, action, rejectionReason } = req.body;
    const db = getDatabase();

    if (!userId || !docType || !action) {
      return res.status(400).json({ error: 'User ID, document type, and action (verify/reject) are required.' });
    }

    const docRecord = db.userDocuments.find((d) => d.userId === userId);
    if (!docRecord || !docRecord.documents[docType as keyof CustomerDocuments]) {
      return res.status(404).json({ error: 'Document record not found.' });
    }

    const docItem = docRecord.documents[docType as keyof CustomerDocuments]!;
    const docLabels: Record<string, string> = {
      faydaIdFront: 'Fayda National ID (Front)',
      faydaIdBack: 'Fayda National ID (Back)',
      drivingLicenceFront: 'Driving Licence (Front)',
      drivingLicenceBack: 'Driving Licence (Back)',
    };
    const label = docLabels[docType] || 'Document';

    if (action === 'verify') {
      docItem.status = 'Verified';
      docItem.verifiedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      delete docItem.rejectionReason;

      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId,
        title: 'Document Verified',
        message: `Your ${label} has been reviewed and verified by Kairos Addis administration.`,
        type: 'system',
        date: 'Just now',
        read: false,
        priority: 'medium',
      });
    } else if (action === 'reject') {
      docItem.status = 'Rejected';
      docItem.rejectionReason = rejectionReason || 'Document image is blurry or expired. Please re-upload a clear copy.';

      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId,
        title: 'Document Action Required',
        message: `Your ${label} could not be verified: "${docItem.rejectionReason}". Please re-upload in Profile.`,
        type: 'system',
        date: 'Just now',
        read: false,
        priority: 'high',
      });
    }

    saveDatabase();
    syncUserDocumentsToSupabase(docRecord).catch((err) => console.warn('[SUPABASE DOC VERIFY SYNC]', err));
    syncNotificationToSupabase(db.notifications[0]).catch(() => {});
    res.json({
      message: `Document ${action === 'verify' ? 'verified' : 'rejected'} successfully.`,
      document: docItem,
    });
  });

  // ==========================================
  // MESSAGING & CONCIERGE CHAT
  // ==========================================
  app.get('/api/admin/messages', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();

    // Fetch and synchronize any new messages from Supabase
    try {
      const suMsgs = await getSupabaseMessages();
      if (suMsgs && suMsgs.length > 0) {
        let hasNew = false;
        suMsgs.forEach((sm) => {
          if (!db.messages.some((m) => m.id === sm.id)) {
            db.messages.push(sm);
            hasNew = true;
          }
        });
        if (hasNew) {
          saveDatabase();
        }
      }
    } catch (err) {
      console.warn('[ADMIN GET MESSAGES] Supabase sync notice:', err);
    }

    const deletedContacts = new Set(db.deletedMessagingContacts || []);

    // Group messages by customer
    const userThreads: Record<string, { user: UserAccount; messages: PortalMessage[]; unreadCount: number }> = {};

    db.users.forEach((u) => {
      if (u.role !== 'admin' && !u.deletedFromMessaging && !deletedContacts.has(u.id)) {
        const uMsgs = db.messages
          .filter((m) => m.userId === u.id)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // Only display contacts that have legitimate conversation history
        if (uMsgs.length > 0) {
          const unread = uMsgs.filter((m) => m.sender === 'customer' && !m.read).length;
          userThreads[u.id] = {
            user: u,
            messages: uMsgs,
            unreadCount: unread,
          };
        }
      }
    });

    res.json({ threads: Object.values(userThreads) });
  });

  app.post('/api/admin/messages/reply', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const { userId, content } = req.body;
    const db = getDatabase();

    if (!userId || !content || !content.trim()) {
      return res.status(400).json({ error: 'Customer ID and reply content are required.' });
    }

    const customer = db.users.find((u) => u.id === userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer account not found.' });
    }

    const adminMsg: PortalMessage = {
      id: `msg_${Date.now()}_a`,
      userId,
      sender: 'admin',
      senderName: 'Kairos Addis Executive Concierge',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    db.messages.push(adminMsg);

    // Notify customer
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId,
      title: 'New Concierge Message',
      message: `You have received a new reply from Kairos Addis Concierge: "${content.slice(0, 70)}..."`,
      type: 'update',
      date: 'Just now',
      read: false,
      priority: 'high',
    });

    saveDatabase();

    // Persist to Supabase
    await saveMessageToSupabase(adminMsg);

    res.status(201).json({ message: 'Reply sent successfully.', sentMessage: adminMsg });
  });

  // DELETE CONTACT & CONVERSATION FROM EXECUTIVE CONCIERGE MESSAGING
  // Scoped ONLY to the selected contact - preserves all vehicle records, orders, warranties, services, etc.
  app.delete('/api/admin/messages/contacts/:userId', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Contact ID is required.' });
    }

    const db = getDatabase();
    const targetUser = db.users.find((u) => u.id === userId);

    // 1. Delete associated messages from Supabase database
    await deleteContactMessagesFromSupabase(userId);

    // 2. Remove associated conversation messages belonging ONLY to this contact from local db
    db.messages = db.messages.filter((m) => m.userId !== userId);

    // 3. Mark contact as permanently removed from messaging list
    if (!db.deletedMessagingContacts) {
      db.deletedMessagingContacts = [];
    }
    if (!db.deletedMessagingContacts.includes(userId)) {
      db.deletedMessagingContacts.push(userId);
    }

    if (targetUser) {
      targetUser.deletedFromMessaging = true;
    }

    // Explicitly preserve all orders, vehicles, warranties, services, test drives, documents, and notifications!
    saveDatabase();

    console.log(`[ADMIN MESSAGING] Successfully removed contact ${userId} and associated conversation.`);

    return res.json({
      success: true,
      message: 'Contact and conversation removed successfully.',
      deletedUserId: userId,
    });
  });

  // ==========================================
  // NOTIFICATIONS BROADCAST / TARGETED
  // ==========================================
  app.post('/api/admin/notifications/broadcast', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { userId, title, message, priority, type } = req.body;
    const db = getDatabase();

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }

    const recipients = userId
      ? db.users.filter((u) => u.id === userId)
      : db.users.filter((u) => u.role !== 'admin');

    recipients.forEach((rec) => {
      db.notifications.unshift({
        id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: rec.id,
        title,
        message,
        type: type || 'update',
        date: 'Just now',
        read: false,
        priority: priority || 'medium',
      });
    });

    saveDatabase();
    for (const n of db.notifications.slice(0, recipients.length)) {
      syncNotificationToSupabase(n).catch(() => {});
    }
    res.json({ message: `Notification delivered to ${recipients.length} customer(s).` });
  });

  // ==========================================
  // BRANDING & SHOWROOM SETTINGS
  // ==========================================
  app.get('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    res.json({ settings: db.settings });
  });

  app.put('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = getDatabase();
    db.settings = {
      ...db.settings,
      ...req.body,
    };
    saveDatabase();
    syncSettingsToSupabase(db.settings).catch((err) => console.warn('[SUPABASE SETTINGS SYNC]', err));
    res.json({ message: 'Settings and branding updated successfully.', settings: db.settings });
  });

  // ==========================================
  // ADMIN ACCOUNT & SECURITY (CREDENTIALS)
  // ==========================================
  app.put('/api/admin/account/security', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newEmail, newPassword, confirmPassword } = req.body;
    const db = getDatabase();

    const adminUser = db.users.find((u) => u.id === req.user!.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Administrative session invalid.' });
    }

    // Verify current password
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to authorize security updates.' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, adminUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password does not match.' });
    }

    // Email update
    if (newEmail && newEmail.trim().toLowerCase() !== adminUser.email.toLowerCase()) {
      const trimmedEmail = newEmail.trim().toLowerCase();
      const emailExists = db.users.some((u) => u.id !== adminUser.id && u.email.toLowerCase() === trimmedEmail);
      if (emailExists) {
        return res.status(400).json({ error: 'This email address is already assigned to another account.' });
      }
      adminUser.email = trimmedEmail;
    }

    // Password update
    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must contain at least 8 characters.' });
      }
      if (!confirmPassword || newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New password and confirmation do not match.' });
      }
      adminUser.passwordHash = bcrypt.hashSync(newPassword, 10);
    }

    // Ensure role remains firmly 'admin'
    adminUser.role = 'admin';

    // Sync with Supabase Auth Admin if available
    try {
      const supabaseAdmin = getSupabaseAdminClient();
      if (supabaseAdmin && (newEmail || newPassword)) {
        const updatePayload: any = {};
        if (newEmail) updatePayload.email = adminUser.email;
        if (newPassword) updatePayload.password = newPassword;
        // In Supabase, if user exists with this ID:
        await supabaseAdmin.auth.admin.updateUserById(adminUser.id, updatePayload).catch(() => {
          // Ignore if user was created locally
        });
      }
    } catch (e) {
      console.log('[SUPABASE ADMIN SYNC INFO]', e);
    }

    saveDatabase();
    syncUserToSupabase(adminUser).catch(() => {});
    res.json({
      message: 'Admin credentials and security profile updated successfully.',
      email: adminUser.email,
    });
  });

  // ==========================================
  // MEDIA & IMAGE ASSET MANAGEMENT (SUPABASE STORAGE & FALLBACK)
  // ==========================================
  app.post('/api/admin/media/upload', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { fileName, fileType, fileData, category } = req.body;
      if (!fileData) {
        return res.status(400).json({ error: 'No image data provided.' });
      }

      // Image uploads are intentionally limited to JPG/JPEG and PNG.
      // Validate both the declared MIME type and the filename extension so
      // drag-and-drop and browsers with inconsistent MIME reporting work.
      const extension = String(fileName || '').split('.').pop()?.toLowerCase() || '';
      const normalizedType = String(fileType || '').toLowerCase();
      const isJpg = normalizedType === 'image/jpeg' || extension === 'jpg' || extension === 'jpeg';
      const isPng = normalizedType === 'image/png' || extension === 'png';

      if (!isJpg && !isPng) {
        return res.status(400).json({ error: 'Only JPG/JPEG and PNG images are supported.' });
      }

      if (!/^data:image\/(jpeg|png);base64,/i.test(fileData)) {
        return res.status(400).json({ error: 'Invalid JPG/PNG image data.' });
      }

      // If Supabase Storage is configured, upload to storage bucket
      const supabaseAdmin = getSupabaseAdminClient();
      let publicUrl = '';

      if (supabaseAdmin) {
        try {
          const buffer = Buffer.from(fileData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
          const cleanName = `${Date.now()}_${(fileName || 'image.jpg').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const bucketName = 'kairos-assets';

          const { data: uploadRes, error: uploadErr } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(`uploads/${cleanName}`, buffer, {
              contentType: fileType || 'image/jpeg',
              upsert: true,
            });

          if (!uploadErr && uploadRes) {
            const { data: urlData } = supabaseAdmin.storage
              .from(bucketName)
              .getPublicUrl(`uploads/${cleanName}`);
            if (urlData?.publicUrl) {
              publicUrl = urlData.publicUrl;
            }
          }
        } catch (storageErr) {
          console.warn('[SUPABASE STORAGE UPLOAD WARNING]', storageErr);
        }
      }

      if (!publicUrl) {
        publicUrl = fileData;
      }

      res.json({
        message: 'Media asset uploaded successfully.',
        url: publicUrl,
        asset: {
          name: fileName || 'Uploaded Asset',
          category: category || 'uploads',
          url: publicUrl,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[ADMIN MEDIA UPLOAD ERROR]', err);
      res.status(500).json({ error: 'Failed to process media upload.' });
    }
  });
}
