export interface Notification {
  id: number;
  message: string;
  dateEnvoi: string;
  lue: boolean;
  ordreTravail?: { id: number; titre: string };
}