export interface Student {
  _id: string;           // вместо ObjectId
  photoUrl?: string;     // опциональное фото
  lastname: string;
  firstname: string;
  middlename?: string;
  birthdate: string;     // Date приходит как ISO строка
  country?: string;
  sex: boolean;
  createdAt: string;     // timestamps приходят как ISO строки
  updatedAt: string;
}
