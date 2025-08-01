interface User {
  _id: string,
  name: string,
  email: string,
  createdAt: string,
  updatedAt: string,
}

export interface UserProps {
  users: User[];
  setUsers: (users: User[]) => void;
  clearUsers: () => void;
}