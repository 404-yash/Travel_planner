import { User, RouteDto, RouteSearchParams, BookingDto, AdminStats, AdminLeg, LiveTrainStatusDto, TrackableServiceSummary } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    let msg = errorText;
    try {
      const json = JSON.parse(errorText);
      msg = json.message || json.error || errorText;
    } catch (_) {}
    throw new Error(msg || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse<User>(res);
    },
    register: async (name: string, email: string, password: string): Promise<User> => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      return handleResponse<User>(res);
    },
    me: async (): Promise<User> => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<User>(res);
    },
  },

  routes: {
    getCities: async (): Promise<string[]> => {
      const res = await fetch(`${API_BASE}/routes/cities`);
      return handleResponse<string[]>(res);
    },
    getCoordinates: async (): Promise<Record<string, [number, number]>> => {
      const res = await fetch(`${API_BASE}/routes/coordinates`);
      return handleResponse<Record<string, [number, number]>>(res);
    },
    search: async (params: RouteSearchParams, signal?: AbortSignal): Promise<RouteDto[]> => {
      const res = await fetch(`${API_BASE}/routes/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal,
      });
      return handleResponse<RouteDto[]>(res);
    },
    getFareCalendar: async (from: string, to: string, start: string, days = 7): Promise<any[]> => {
      const res = await fetch(`${API_BASE}/routes/fare-calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&start=${encodeURIComponent(start)}&days=${days}`);
      return handleResponse<any[]>(res);
    },
    getDisruptions: async (): Promise<{ cancelledCount: number; delayedCount: number }> => {
      const res = await fetch(`${API_BASE}/routes/disruptions`);
      return handleResponse(res);
    },
  },

  bookings: {
    create: async (data: any): Promise<BookingDto> => {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse<BookingDto>(res);
    },
    getMyBookings: async (): Promise<BookingDto[]> => {
      const res = await fetch(`${API_BASE}/bookings`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<BookingDto[]>(res);
    },
    cancel: async (id: number): Promise<BookingDto> => {
      const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
      return handleResponse<BookingDto>(res);
    },
    getRefundPreview: async (id: number): Promise<{ percent: number; amount: number; message: string; eligible: boolean }> => {
      const res = await fetch(`${API_BASE}/bookings/${id}/refund-preview`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<{ percent: number; amount: number; message: string; eligible: boolean }>(res);
    },
    getStatus: async (id: number): Promise<any> => {
      const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any>(res);
    },
    rebook: async (id: number, data: { legIds: string[]; origin: string; destination: string }): Promise<BookingDto> => {
      const res = await fetch(`${API_BASE}/bookings/${id}/rebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse<BookingDto>(res);
    },
    getTicketUrl: (id: number): string => `${API_BASE}/bookings/${id}/ticket`,
  },

  admin: {
    getStats: async (): Promise<AdminStats> => {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<AdminStats>(res);
    },
    getLegs: async (): Promise<AdminLeg[]> => {
      const res = await fetch(`${API_BASE}/admin/legs`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<AdminLeg[]>(res);
    },
    disrupt: async (data: { legId?: string; action: string; delayMinutes?: number; description?: string }) => {
      const res = await fetch(`${API_BASE}/admin/disruptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    getAllBookings: async (): Promise<BookingDto[]> => {
      const res = await fetch(`${API_BASE}/admin/bookings`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<BookingDto[]>(res);
    },
  },

  tracking: {
    getServiceStatus: async (serviceId: string, progress?: number): Promise<LiveTrainStatusDto> => {
      const url = progress !== undefined
        ? `${API_BASE}/tracking/service/${encodeURIComponent(serviceId)}?progress=${progress}`
        : `${API_BASE}/tracking/service/${encodeURIComponent(serviceId)}`;
      const res = await fetch(url, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<LiveTrainStatusDto>(res);
    },
    getTrackableServices: async (): Promise<TrackableServiceSummary[]> => {
      const res = await fetch(`${API_BASE}/tracking/services`, {
        headers: { ...getAuthHeader() },
      });
      const data = await handleResponse<any[]>(res);
      return data.map((svc: any) => ({
        serviceId: svc.serviceId,
        name: svc.name,
        operator: svc.operator,
        mode: svc.mode,
        category: svc.category,
        from: svc.from,
        to: svc.to,
        departure: svc.departureTime || svc.departure,
        arrival: svc.arrivalTime || svc.arrival,
        durationMin: svc.durationMin ?? 0,
        isCancelled: svc.isCancelled ?? false,
        delayMin: svc.delayMin ?? 0,
      }));
    },
    getBookingTracking: async (bookingId: number, legIndex = 0, progress?: number): Promise<LiveTrainStatusDto> => {
      const url = progress !== undefined
        ? `${API_BASE}/tracking/booking/${bookingId}?legIndex=${legIndex}&progress=${progress}`
        : `${API_BASE}/tracking/booking/${bookingId}?legIndex=${legIndex}`;
      const res = await fetch(url, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<LiveTrainStatusDto>(res);
    },
  },
};
