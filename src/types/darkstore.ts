export interface DarkstoreProps {
  isNewUser: boolean,
  darkstoreRegistered: boolean,
  registrationPending: boolean,
  darkstoreId: string | null,
  darkstoreDetails: Darkstore | null,
  totalRevenue: number,
  fcmToken: string | null,
  setIsNewUser: (isNew: boolean) => void,
  setDarkstoreRegistered: (registered: boolean) => void,
  setRegistrationPending: (pending: boolean) => void,
  setDarkstoreDetails: (details: Darkstore) => void,
  setTotalRevenue: (revenue: number) => void,
  setDarkstoreId: (id: string) => void,
  setFcmToken: (token: string) => void,
  resetDarkstore: () => void,
}

interface Darkstore {
  _id: string,
  storename: string,
  email: string,
  location: Location,
  address: Address,
  totalRevenue: number,
  fcmToken: string,
  createdAt: Date,
  updatedAt: Date,
}

interface Location {
  type: string,
  coordinates: number[],
}

interface Address {
  city: string,
  street: string,
  district: string,
  state: string,
  pincode: string,
}