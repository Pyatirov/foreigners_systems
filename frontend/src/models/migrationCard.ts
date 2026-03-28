export interface MigrationCard {
  series: number;
  number: number;
  start_date: Date;
  end_date: Date;
  scanUrl?: string;
  student?: string;
}
