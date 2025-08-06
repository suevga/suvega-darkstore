import { Location } from "./location";

interface User {
  _id: string,
  email: string,
  name: string,
  phoneNumber: string,
  storeId: string,
  location: Location,
  isOnboarded?: boolean,
  address?: Address[],
  createdAt?: string,
  updatedAt?: string,
}

export interface UserProps {
  users: User[];
  setUsers: (users: User[]) => void;
  clearUsers: () => void;
}

interface Address {
  _id:string,
  type: string,
  fullName: string,
  addressLine: string,
  city: string,
  pinCode: string,
  landmark: string,
}