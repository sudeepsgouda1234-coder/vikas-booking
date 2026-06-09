export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  notes: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Availability {
  id: string;
  date: string; // YYYY-MM-DD
  availableSlots: string[]; // e.g. ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number; // in INR, 0 means Free
  description: string;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  bookingsByService: { [service: string]: number };
  bookingsByDate: { [date: string]: number };
}
