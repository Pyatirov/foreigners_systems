export interface TVisa {
  country: string;
  type: string;
  number: string;
  issued_date: Date;
  expiry_date: Date;
  scanUrl?: string;
  student?: string;
}
