export interface User {
  email: string;
  name: string;
  role: 'ROLE_TRAVELER' | 'ROLE_ADMIN';
  token?: string;
}

export interface LegDto {
  id: string;
  mode: 'BUS' | 'TRAIN' | 'FLIGHT';
  operator: string;
  name: string;
  category: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  fare: number;
  distanceKm: number;
  co2Kg: number;
  travelTip: string;
  layoverBeforeMin: number;
  boardingBufferMin?: number;
  state?: 'ON_TIME' | 'DELAYED' | 'CANCELLED';
  delayMin?: number;
}

export interface RouteDto {
  id: string;
  signature: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  waitingMin: number;
  transfers: number;
  totalFare: number;
  co2Kg: number;
  risk: 'Low' | 'Medium' | 'High';
  modeSummary: string;
  highlights: string[];
  legs: LegDto[];
}

export interface RouteSearchParams {
  origin: string;
  destination: string;
  date: string;
  requiredStop?: string;
  strategy: string;
  maxLegs: number;
  maxFare?: number;
  allowedModes: string[];
  departureWindow: string;
}

export interface BookingDto {
  id: number;
  bookingRef: string;
  passengerName: string;
  passengerEmail: string;
  origin: string;
  destination: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  transfers: number;
  totalFare: number;
  co2Kg: number;
  modeSummary: string;
  itineraryDetails: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'CHANGED';
  bookedAt: string;
  passengers?: number;
  paymentStatus?: string;
  paymentRef?: string;
  refundAmount?: number;
  contactPhone?: string;
  travellers?: Passenger[];
  legIds?: string[];
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  seatPreference?: string;
}

export interface DayFare {
  date: string;
  dayOfWeek: string;
  cheapestFare: number;
  fastestDurationMin: number;
  routeCount: number;
}

export interface RefundPreview {
  percent: number;
  amount: number;
  message: string;
  eligible: boolean;
}

export interface TripStatusDto {
  bookingId: number;
  headline: string;
  overallState: 'ON_TIME' | 'DELAYED' | 'CANCELLED';
  totalDelayMinutes: number;
  departureTime: string;
  firstLegDepAbsMin: number;
  legs: {
    legId: string;
    from: string;
    to: string;
    state: 'ON_TIME' | 'DELAYED' | 'CANCELLED';
    delayMinutes: number;
    boardingBufferMin: number;
    departureTime?: string;
    arrivalTime?: string;
    mode?: string;
    name?: string;
    operator?: string;
  }[];
  alternatives: RouteDto[];
}

export interface AdminStats {
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  activeCancellations: number;
  activeDelays: number;
}

export interface AdminLeg {
  id: string;
  operator: string;
  name: string;
  mode: string;
  category: string;
  from: string;
  to: string;
  departureMin: number;
  durationMin: number;
  fare: number;
  isCancelled: boolean;
  delayMin: number;
}

export interface IntermediateStationDto {
  stationCode: string;
  stationName: string;
  distanceKm: number;
  scheduledArrival: string;
  scheduledDeparture: string;
  expectedArrival: string;
  expectedDeparture: string;
  delayMinutes: number;
  platformNumber: number;
  haltMinutes: number;
  status: 'PASSED' | 'CURRENT' | 'UPCOMING';
  latitude: number;
  longitude: number;
}

export interface LiveTrainStatusDto {
  serviceId: string;
  serviceName: string;
  operator: string;
  mode: 'TRAIN' | 'BUS' | 'FLIGHT';
  category: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  expectedDeparture: string;
  expectedArrival: string;
  overallStatus: 'ON_TIME' | 'DELAYED' | 'CANCELLED';
  delayMinutes: number;
  currentSpeedKmh: number;
  progressPercent: number;
  currentStatusHeadline: string;
  currentLocationDescription: string;
  currentLat: number;
  currentLng: number;
  nextStation?: IntermediateStationDto;
  previousStation?: IntermediateStationDto;
  stations: IntermediateStationDto[];
  lastUpdated: string;
}

export interface TrackableServiceSummary {
  serviceId: string;
  name: string;
  operator: string;
  mode: string;
  category?: string;
  from: string;
  to: string;
  departure: string;
  arrival?: string;
  durationMin: number;
  isCancelled?: boolean;
  delayMin?: number;
}

