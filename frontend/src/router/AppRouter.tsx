import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { EntityPage } from "../pages/EntityPage";
import { AuthPage } from "../pages/AuthPage";

const api = import.meta.env.VITE_API_URL;

const isAuth = () => true;

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={isAuth() ? <MainLayout /> : <Navigate to="/auth" />}>
        <Route path="students" 
          element={
            <EntityPage 
              config={{
                title: "Students",
                endpoint: `${api}/api/students`,
                columns: [
                  { field: "lastname", headerName: "Фамилия" },
                  { field: "firstname", headerName: "Имя" },
                  { field: "middlename", headerName: "Отчество" },
                  { field: "birthdate", headerName: "Дата рождения" },
                  { field: "country", headerName: "Страна" },
                  { field: "sex", headerName: "Пол" }
                ],
                fields: [
                  { name: "lastname", label: "Фамилия", type: "string", required: true },
                  { name: "firstname", label: "Имя (имена)", type: "string", required: true },
                  { name: "middlename", label: "Отчество", type: "string" },
                  { name: "birthdate", label: "Дата рождения", type: "date", required: true },
                  { name: "country", label: "Страна", type: "select" },
                  { name: "sex", label: "Пол", type: "select", required: true, options: [
                    { value: "М", label: "Мужской" },
                    { value: "Ж", label: "Женский" }
                  ]}
                ],
                filters: [
                  { field: "firstname", label: "Имя", type: "string" },
                  { field: "country", label: "Страна", type: "select", options: [
                    { value: "Россия", label: "Россия" },
                    { value: "США", label: "США" },
                    { value: "Канада", label: "Канада" }
                  ]}
                ]
              }} 
            />} 
        />
        <Route path="passports" 
          element={
            <EntityPage 
              config={{
                title: "Passports",
                endpoint: `${api}/api/passports`,
                columns: [
                  { field: "type", headerName: "Документ, удостоверяющий личность" },
                  { field: "series", headerName: "Серия" },
                  { field: "number", headerName: "Номер №" },
                  { field: "valid_from", headerName: "Срок начала действия" },
                  { field: "valid_to", headerName: "Срок окончания действия" }
                ],
                fields: [
                  { name: "type", label: "Документ, удостоверяющий личность", type: "string", required: true },
                  { name: "series", label: "Серия", type: "number" },
                  { name: "number", label: "Номер №", type: "number", required: true },
                  { name: "valid_from", label: "Срок начала действия", type: "date" },
                  { name: "valid_to", label: "Срок окончания действия", type: "date" }
                ]
              }} 
            />} 
          />
        <Route path="visas" 
          element={
            <EntityPage 
              config={{
                title: "Visas",
                endpoint: `${api}/api/visas`,
                columns: [
                  { field: "country", headerName: "Страна" },
                  { field: "type", headerName: "Тип визы" },
                  { field: "number", headerName: "Номер визы" },
                  { field: "issued_date", headerName: "Дата выдачи" },
                  { field: "expiry_date", headerName: "Дата истечения" }
                ],
                fields: [
                  { name: "country", label: "Страна", type: "string", required: true },
                  { name: "type", label: "Тип визы", type: "string", required: true },
                  { name: "number", label: "Номер визы", type: "string", required: true },
                  { name: "issued_date", label: "Дата выдачи", type: "date" },
                  { name: "expiry_date", label: "Дата истечения", type: "date" }
                ]
              }} 
            />} 
          />
        <Route path="education" 
          element={
            <EntityPage 
              config={{
                title: "Education",
                endpoint: `${api}/api/education`,
                columns: [
                  { field: "institution", headerName: "Учебное заведение" },
                  { field: "degree", headerName: "Степень" },
                  { field: "field_of_study", headerName: "Направление обучения" },
                  { field: "graduation_date", headerName: "Дата окончания" }
                ],
                fields: [
                  { name: "institution", label: "Учебное заведение", type: "string", required: true },
                  { name: "degree", label: "Степень", type: "string", required: true },
                  { name: "field_of_study", label: "Направление обучения", type: "string" },
                  { name: "graduation_date", label: "Дата окончания", type: "date" }
                ]
              }} 
            />} 
          />
        <Route index element={<Navigate to="students" />} />
      </Route>

      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
