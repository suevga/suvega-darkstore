export interface LocationProps {
  latitude: number,
  longitude: number,
  error: unknown | null,
  setLocation: (latitude: number, longitude: number) => void,
  setError: (error: unknown) => void,
}

export interface GoogleLocationResponse {
  location?: {
    lat: number;
    lng: number;
  };
  error?: {
    code: number;
    message: string;
  };
}