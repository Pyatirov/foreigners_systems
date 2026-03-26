export interface TPassport {
  type: string;
  series: number;
  number: number,
  valid_from: Date,
  valid_to: Date,
  scanUrl?: string;
  student?: string;
}
