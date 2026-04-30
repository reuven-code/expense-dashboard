import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============ TYPES ============

export interface Appointment {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  service: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  confirmedAt?: Date;
  notes?: string;
  waitlistPosition?: number;
}

export interface Staff {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email: string;
  specialties: string[];
  availability: Record<string, string[]>; // day -> [times]
  active: boolean;
  createdAt: Date;
}

export interface BusinessHours {
  businessId: string;
  Monday: { open: string; close: string; closed: boolean };
  Tuesday: { open: string; close: string; closed: boolean };
  Wednesday: { open: string; close: string; closed: boolean };
  Thursday: { open: string; close: string; closed: boolean };
  Friday: { open: string; close: string; closed: boolean };
  Saturday: { open: string; close: string; closed: boolean };
  Sunday: { open: string; close: string; closed: boolean };
  breakTime?: { start: string; end: string };
}

export interface AppointmentFilters {
  dateRange?: { from: string; to: string };
  status?: string;
  staffId?: string;
  customerId?: string;
}

// ============ STORE ============

interface AppointmentStore {
  appointments: Appointment[];
  filteredAppointments: Appointment[];
  filters: AppointmentFilters;
  loading: boolean;
  error: string | null;

  // Actions
  setAppointments: (appointments: Appointment[]) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  setFilters: (filters: AppointmentFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppointmentStore = create<AppointmentStore>()(
  devtools(
    (set, get) => ({
      appointments: [],
      filteredAppointments: [],
      filters: {},
      loading: false,
      error: null,

      setAppointments: (appointments) =>
        set((state) => ({
          appointments,
          filteredAppointments: applyFilters(appointments, state.filters),
        })),

      addAppointment: (appointment) =>
        set((state) => {
          const updated = [...state.appointments, appointment];
          return {
            appointments: updated,
            filteredAppointments: applyFilters(updated, state.filters),
          };
        }),

      updateAppointment: (id, updates) =>
        set((state) => {
          const updated = state.appointments.map((appt) =>
            appt.id === id ? { ...appt, ...updates } : appt
          );
          return {
            appointments: updated,
            filteredAppointments: applyFilters(updated, state.filters),
          };
        }),

      deleteAppointment: (id) =>
        set((state) => {
          const updated = state.appointments.filter((appt) => appt.id !== id);
          return {
            appointments: updated,
            filteredAppointments: applyFilters(updated, state.filters),
          };
        }),

      setFilters: (filters) =>
        set((state) => ({
          filters,
          filteredAppointments: applyFilters(state.appointments, filters),
        })),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    { name: 'AppointmentStore' }
  )
);

// ============ STAFF STORE ============

interface StaffStore {
  staff: Staff[];
  loading: boolean;
  error: string | null;

  setStaff: (staff: Staff[]) => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStaffStore = create<StaffStore>()(
  devtools(
    (set) => ({
      staff: [],
      loading: false,
      error: null,

      setStaff: (staff) => set({ staff }),

      addStaff: (staff) =>
        set((state) => ({
          staff: [...state.staff, staff],
        })),

      updateStaff: (id, updates) =>
        set((state) => ({
          staff: state.staff.map((member) =>
            member.id === id ? { ...member, ...updates } : member
          ),
        })),

      deleteStaff: (id) =>
        set((state) => ({
          staff: state.staff.filter((member) => member.id !== id),
        })),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    { name: 'StaffStore' }
  )
);

// ============ BUSINESS HOURS STORE ============

interface BusinessHoursStore {
  hours: BusinessHours | null;
  loading: boolean;
  error: string | null;

  setHours: (hours: BusinessHours) => void;
  updateHours: (day: keyof BusinessHours, hours: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBusinessHoursStore = create<BusinessHoursStore>()(
  devtools(
    (set) => ({
      hours: null,
      loading: false,
      error: null,

      setHours: (hours) => set({ hours }),

      updateHours: (day, hours) =>
        set((state) => ({
          hours: state.hours
            ? { ...state.hours, [day]: hours }
            : null,
        })),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    { name: 'BusinessHoursStore' }
  )
);

// ============ FILTER LOGIC ============

function applyFilters(appointments: Appointment[], filters: AppointmentFilters): Appointment[] {
  return appointments.filter((appt) => {
    if (filters.dateRange) {
      const date = new Date(appt.date);
      const from = new Date(filters.dateRange.from);
      const to = new Date(filters.dateRange.to);
      if (date < from || date > to) return false;
    }

    if (filters.status && appt.status !== filters.status) return false;
    if (filters.staffId && appt.staffId !== filters.staffId) return false;
    if (filters.customerId && appt.customerId !== filters.customerId) return false;

    return true;
  });
}
