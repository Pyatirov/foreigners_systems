export interface TMigrationCard {
  series: number;
  number: number;
  start_date: Date;
  end_date: Date;
  scanUrl?: string;
  student?: string;
}
