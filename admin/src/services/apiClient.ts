import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ============ APPOINTMENTS ============

  async getAppointments(businessId: string, params?: any) {
    const response = await this.client.get(`/appointments/${businessId}`, { params });
    return response.data.appointments;
  }

  async getAppointment(businessId: string, appointmentId: string) {
    const response = await this.client.get(`/appointments/${businessId}/${appointmentId}`);
    return response.data.appointment;
  }

  async createAppointment(businessId: string, data: any) {
    const response = await this.client.post(`/appointments/${businessId}`, data);
    return response.data.appointment;
  }

  async updateAppointment(businessId: string, appointmentId: string, data: any) {
    const response = await this.client.patch(`/appointments/${businessId}/${appointmentId}`, data);
    return response.data.appointment;
  }

  async confirmAppointment(businessId: string, appointmentId: string) {
    const response = await this.client.patch(`/appointments/${businessId}/${appointmentId}/confirm`);
    return response.data.appointment;
  }

  async cancelAppointment(businessId: string, appointmentId: string, reason?: string) {
    const response = await this.client.patch(`/appointments/${businessId}/${appointmentId}/cancel`, {
      reason,
    });
    return response.data;
  }

  // ============ AVAILABILITY ============

  async getAvailability(businessId: string, date: string) {
    const response = await this.client.get(`/availability/${businessId}/${date}`);
    return response.data;
  }

  async getAvailabilityBulk(businessId: string, dates: string[]) {
    const response = await this.client.post(`/availability/${businessId}/bulk`, { dates });
    return response.data.availability;
  }

  // ============ STAFF ============

  async getStaff(businessId: string) {
    const response = await this.client.get(`/staff/${businessId}`);
    return response.data.staff;
  }

  async createStaff(businessId: string, data: any) {
    const response = await this.client.post(`/staff/${businessId}`, data);
    return response.data.staff;
  }

  async updateStaff(businessId: string, staffId: string, data: any) {
    const response = await this.client.patch(`/staff/${businessId}/${staffId}`, data);
    return response.data.staff;
  }

  async deleteStaff(businessId: string, staffId: string) {
    await this.client.delete(`/staff/${businessId}/${staffId}`);
  }

  // ============ BUSINESS HOURS ============

  async getBusinessHours(businessId: string) {
    const response = await this.client.get(`/business-hours/${businessId}`);
    return response.data;
  }

  async updateBusinessHours(businessId: string, hours: any) {
    const response = await this.client.patch(`/business-hours/${businessId}`, hours);
    return response.data;
  }

  // ============ WAITLIST ============

  async getWaitlist(businessId: string) {
    const response = await this.client.get(`/appointments/${businessId}/waitlist/list`);
    return response.data.waitlist;
  }

  async promoteFromWaitlist(businessId: string, date: string, time: string) {
    const response = await this.client.post(`/appointments/${businessId}/waitlist/promote`, {
      date,
      time,
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
