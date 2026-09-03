import {
  User,
  PortalDashboardData,
  PortalVehicle,
  WarrantyDetails,
  ServiceRecord,
  Appointment,
  TestDriveRequest,
  NotificationItem,
  VehicleOrder,
  CustomerDocuments,
  PortalMessage,
  PortalTestimonial,
} from '../types';

const TOKEN_STORAGE_KEY = 'kairos_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error: any = new Error(errorMsg);
    error.status = response.status;
    error.notFound = data.notFound;
    error.requireVerification = data.requireVerification;
    error.email = data.email;
    error.code = data.code;
    error.retryAfter = data.retryAfter;
    throw error;
  }

  return data as T;
}

export const api = {
  // Public Brand Settings
  async getPublicSettings(): Promise<{ settings: any }> {
    return request('/api/settings', { method: 'GET' });
  },

  // Auth
  async register(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
  }): Promise<{ message: string; requireVerification?: boolean; email?: string; user?: User }> {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyEmail(data: {
    email: string;
    token: string;
  }): Promise<{ message: string; token?: string; user?: User; isAlreadyVerified?: boolean }> {
    const res = await request<{ message: string; token?: string; user?: User; isAlreadyVerified?: boolean }>(
      '/api/auth/verify-email',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async resendVerification(email: string): Promise<{ message: string; email?: string; retryAfter?: number }> {
    return request('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async login(data: { email: string; password: string }): Promise<{ message: string; token: string; user: User }> {
    const res = await request<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async me(): Promise<{ user: User }> {
    return request('/api/auth/me', { method: 'GET' });
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during logout
    } finally {
      removeStoredToken();
    }
  },

  async forgotPassword(email: string): Promise<{ message: string; email?: string }> {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyResetCode(data: { email: string; code: string }): Promise<{ success: boolean; message: string }> {
    return request('/api/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async resetPassword(data: {
    email: string;
    code?: string;
    resetToken?: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<{ message: string }> {
    return request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Portal Data
  async getDashboard(): Promise<PortalDashboardData> {
    return request('/api/portal/dashboard', { method: 'GET' });
  },

  async getVehicle(): Promise<{ vehicle: PortalVehicle | null }> {
    return request('/api/portal/vehicle', { method: 'GET' });
  },

  async getWarranty(): Promise<{ warranty: WarrantyDetails | null }> {
    return request('/api/portal/warranty', { method: 'GET' });
  },

  async getServiceHistory(): Promise<{ serviceHistory: ServiceRecord[] }> {
    return request('/api/portal/service-history', { method: 'GET' });
  },

  async getAppointments(): Promise<{ appointments: Appointment[] }> {
    return request('/api/portal/appointments', { method: 'GET' });
  },

  async bookAppointment(data: {
    serviceType: string;
    vehicle?: string;
    date: string;
    time: string;
    message?: string;
  }): Promise<{ appointment: Appointment; message: string }> {
    return request('/api/portal/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAppointment(
    id: string,
    data: { date?: string; time?: string; status?: string; message?: string }
  ): Promise<{ appointment: Appointment; message: string }> {
    return request(`/api/portal/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async cancelAppointment(id: string): Promise<{ message: string }> {
    return request(`/api/portal/appointments/${id}`, {
      method: 'DELETE',
    });
  },

  async getTestDrives(): Promise<{ testDrives: TestDriveRequest[] }> {
    return request('/api/portal/test-drives', { method: 'GET' });
  },

  async bookTestDrive(data: {
    vehicleName: string;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
  }): Promise<{ testDrive: TestDriveRequest; message: string }> {
    return request('/api/portal/test-drives', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async cancelTestDrive(id: string): Promise<{ message: string }> {
    return request(`/api/portal/test-drives/${id}`, {
      method: 'DELETE',
    });
  },

  async getNotifications(): Promise<{ notifications: NotificationItem[] }> {
    return request('/api/portal/notifications', { method: 'GET' });
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request(`/api/portal/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request('/api/portal/notifications/mark-all-read', { method: 'PUT' });
  },

  async updateProfile(data: { fullName: string; phone: string }): Promise<{ user: User; message: string }> {
    return request('/api/portal/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<{ message: string }> {
    return request('/api/portal/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Documents
  async getDocuments(): Promise<{ documents: CustomerDocuments; isComplete: boolean }> {
    return request('/api/portal/documents', { method: 'GET' });
  },

  async uploadDocument(data: {
    docType: 'faydaIdFront' | 'faydaIdBack' | 'drivingLicenceFront' | 'drivingLicenceBack';
    fileName: string;
    fileSize?: string;
    dataUrl?: string;
  }): Promise<{ success: boolean; message: string; documents: CustomerDocuments; isComplete: boolean }> {
    return request('/api/portal/documents/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteDocument(
    docType: 'faydaIdFront' | 'faydaIdBack' | 'drivingLicenceFront' | 'drivingLicenceBack'
  ): Promise<{ success: boolean; message: string; documents: CustomerDocuments; isComplete: boolean }> {
    return request(`/api/portal/documents/${docType}`, {
      method: 'DELETE',
    });
  },

  // Vehicle Orders
  async getOrders(): Promise<{ orders: VehicleOrder[] }> {
    return request('/api/portal/orders', { method: 'GET' });
  },

  async createOrder(data: {
    vehicleId: string;
    vehicleName: string;
    vehicleBrand: string;
    vehicleImage: string;
    priceETB?: number | null;
    priceFormattedETB?: string;
    priceFormatted?: string;
    selectedColor?: string;
    notes?: string;
  }): Promise<{ order: VehicleOrder; message: string }> {
    return request('/api/portal/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Messages / Direct Chat
  async getMessages(): Promise<{ messages: PortalMessage[] }> {
    return request('/api/portal/messages', { method: 'GET' });
  },

  async sendMessage(
    payload: string | { subject?: string; message?: string; content?: string }
  ): Promise<{
    messages: PortalMessage[];
    sentMessage: PortalMessage;
    replyMessage?: PortalMessage;
  }> {
    const body = typeof payload === 'string' ? { content: payload } : { content: payload.content || payload.message, subject: payload.subject };
    return request('/api/portal/messages', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async markMessagesRead(): Promise<{ success: boolean }> {
    return request('/api/portal/messages/read', { method: 'PUT' });
  },

  // Testimonials
  async getTestimonials(): Promise<{ testimonials: PortalTestimonial[] }> {
    return request('/api/portal/testimonials', { method: 'GET' });
  },

  async submitTestimonial(data: {
    rating: number;
    title?: string;
    message?: string;
    text?: string;
    vehicleModel?: string;
  }): Promise<{ testimonial: PortalTestimonial; message: string }> {
    return request('/api/portal/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        rating: data.rating,
        title: data.title || data.vehicleModel || 'Customer Review',
        message: data.message || data.text || '',
        vehicleOwned: data.vehicleModel,
      }),
    });
  },

  async createTestimonial(data: {
    rating: number;
    title?: string;
    message?: string;
    text?: string;
    vehicleModel?: string;
  }): Promise<{ testimonial: PortalTestimonial; message: string }> {
    return this.submitTestimonial(data);
  },

  // Service Request
  async bookServiceRequest(data: {
    vin?: string;
    vehicle?: string;
    serviceType?: string;
    date: string;
    time?: string;
    description?: string;
  }): Promise<{ appointment: Appointment; serviceRecord: ServiceRecord; message: string }> {
    return request('/api/portal/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Public Catalog
  async getPublicVehicles(): Promise<{ vehicles: any[] }> {
    return request('/api/vehicles', { method: 'GET' });
  },

  // Portal AI Assistant (Kairos Addis AI)
  async getAiMessages(): Promise<{ messages: PortalMessage[] }> {
    return request('/api/portal/ai/messages', { method: 'GET' });
  },

  async portalAiChat(
    prompt: string,
    history?: Array<{ role: 'user' | 'model'; text: string }>
  ): Promise<{
    reply: string;
    userMessage: PortalMessage;
    aiMessage: PortalMessage;
    messages: PortalMessage[];
  }> {
    return request('/api/portal/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, history }),
    });
  },

  async clearAiMessages(): Promise<{ success: boolean; message: string }> {
    return request('/api/portal/ai/clear', { method: 'POST' });
  },

  // ==========================================
  // ADMIN DASHBOARD METHODS
  // ==========================================
  async adminGetOverview(): Promise<{ stats: any; recentActivities: any[]; settings: any }> {
    return request('/api/admin/overview', { method: 'GET' });
  },

  async adminGetClients(): Promise<{ clients: any[] }> {
    return request('/api/admin/clients', { method: 'GET' });
  },

  async adminGetClientDossier(id: string): Promise<{ dossier: any }> {
    return request(`/api/admin/clients/${id}`, { method: 'GET' });
  },

  async adminUpdateClient(id: string, data: any): Promise<{ message: string; user: any }> {
    return request(`/api/admin/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adminGetVehicles(): Promise<{ vehicles: any[] }> {
    return request('/api/admin/vehicles', { method: 'GET' });
  },

  async adminAddVehicle(data: any): Promise<{ message: string; vehicle: any }> {
    return request('/api/admin/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminUpdateVehicle(id: string, data: any): Promise<{ message: string; vehicle: any }> {
    return request(`/api/admin/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adminDeleteVehicle(id: string): Promise<{ message: string }> {
    return request(`/api/admin/vehicles/${id}`, { method: 'DELETE' });
  },

  async adminGetOrders(): Promise<{ orders: any[] }> {
    return request('/api/admin/orders', { method: 'GET' });
  },

  async adminDeleteOrder(id: string): Promise<{ message: string }> {
    return request(`/api/admin/orders/${id}`, { method: 'DELETE' });
  },

  async adminUpdateOrderStatus(
    id: string,
    data: { status: string; note?: string; vin?: string; stepProgress?: number; forceAccept?: boolean }
  ): Promise<{ message: string; order: any }> {
    return request(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adminGetServices(): Promise<{ appointments: any[]; serviceRecords: any[] }> {
    return request('/api/admin/services', { method: 'GET' });
  },

  async adminCreateService(data: any): Promise<{ message: string; appointment: any; serviceRecord: any }> {
    return request('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminUpdateService(id: string, data: any): Promise<{ message: string; appointment: any }> {
    return request(`/api/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adminDeleteService(id: string): Promise<{ message: string }> {
    return request(`/api/admin/services/${id}`, { method: 'DELETE' });
  },

  async adminGetWarranties(): Promise<{ warranties: any[] }> {
    return request('/api/admin/warranties', { method: 'GET' });
  },

  async adminCreateWarranty(data: any): Promise<{ message: string; warranty: any }> {
    return request('/api/admin/warranties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminGetTestDrives(): Promise<{ testDrives: any[] }> {
    return request('/api/admin/test-drives', { method: 'GET' });
  },

  async adminUpdateTestDrive(id: string, data: any): Promise<{ message: string; testDrive: any }> {
    return request(`/api/admin/test-drives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adminDeleteTestDrive(id: string): Promise<{ message: string }> {
    return request(`/api/admin/test-drives/${id}`, { method: 'DELETE' });
  },

  async adminGetVerifications(): Promise<{ verifications: any[] }> {
    return request('/api/admin/verifications', { method: 'GET' });
  },

  async adminVerificationAction(data: {
    userId: string;
    docType: string;
    action: 'verify' | 'reject';
    rejectionReason?: string;
  }): Promise<{ message: string; document: any }> {
    return request('/api/admin/verifications/action', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminGetMessages(): Promise<{ threads: any[] }> {
    return request('/api/admin/messages', { method: 'GET' });
  },

  async adminReplyMessage(data: { userId: string; content: string }): Promise<{ message: string; sentMessage: any }> {
    return request('/api/admin/messages/reply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminDeleteContact(userId: string): Promise<{ success: boolean; message: string }> {
    return request(`/api/admin/messages/contacts/${userId}`, {
      method: 'DELETE',
    });
  },

  async adminBroadcastNotification(data: {
    userId?: string;
    title: string;
    message: string;
    priority?: string;
    type?: string;
  }): Promise<{ message: string }> {
    return request('/api/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminGetSettings(): Promise<{ settings: any }> {
    return request('/api/admin/settings', { method: 'GET' });
  },

  async adminUpdateSettings(data: any): Promise<{ message: string; settings: any }> {
    return request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adminUploadMedia(data: {
    fileName: string;
    fileType: string;
    fileData: string;
    category?: string;
  }): Promise<{ message: string; url: string; asset?: any }> {
    return request('/api/admin/media/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminGetMediaLibrary(): Promise<{ assets: any[] }> {
    return request('/api/admin/media/library', { method: 'GET' });
  },

  async adminUpdateAccountSecurity(data: {
    currentPassword?: string;
    newEmail?: string;
    newPassword?: string;
    confirmPassword?: string;
  }): Promise<{ message: string; email?: string }> {
    return request('/api/admin/account/security', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
