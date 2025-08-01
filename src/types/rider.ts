import { OrderProps } from "./orders";

export interface RiderProps {
  allRiders: Rider[],
  totalRiders: number,
  rejectedRiders: Array<Rider>,
  setAllRiders: (riders: Rider[]) => void,
  setTotalRiders: (total: number) => void,
  resetAllRiders: () => void,
  addRejectedRider: (rider:Rider) => void,
  getRejectedCount: () => number,
}

interface Rider {
  _id: string,
  id?: string,
  fullName: string,
  email: string,
  phoneNumber: string,
  storeId: string,
  panNumber: string,
  dob: Date,
  identityImage: string,
  vehicleType: string,
  ownershipType: string,
  isApproved: boolean,
  isOnboarded: boolean,
  isRejected: boolean,
  rejectReason: string,
  rejectionReason?: string,
  gender: string,
  fatherName: string,
  currentLocation: LocationProps,
  isAvailable: boolean,
  activeOrders: OrderProps[],
  totalDeliveries: number,
  earnings: EarningProps,
  ratings: RatingProps[],
  createdAt: Date,
  updatedAt: Date,
}

interface LocationProps {
  type: string,
  coordinates: number[],
}

interface EarningProps {
  dailyEarning: number,
  weeklyEarning: number,
  monthlyEarning: number,
  totalLifetimeEarning: number,
  lastDailyReset: Date,
  lastWeeklyReset: Date,
  lastMonthlyReset: Date,
  paymentHistory: PaymentProps[],
}

interface PaymentProps {
  amount: number,
  date: Date,
  method: string,
}

interface RatingProps {
  riderId: string,
  storeId: string,
  rating: number,
  comment: string,
  date: Date,
}