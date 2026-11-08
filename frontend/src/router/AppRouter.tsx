import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import { EntityPage } from "../pages/EntityPage";
import { AuthPage } from "../pages/AuthPage";
import { DocumentsPage } from "../pages/DocumentsPage";
import { PrivateRoute } from "./SecuteRoute";
import { studentApi } from "../api/student.api";
// import { passportApi } from "../api/passport.api";
// import { visaApi } from "../api/visa.api";
// import { educationApi } from "../api/education.api";
// import { petitionApi } from "../api/petition.api";
// import { medicalReportApi } from "../api/medicalReport.api";
// import { migrationCardApi } from "../api/migrationCard.api";
// import { arrivalNoticeApi } from "../api/arrivalNotice.api";
// import { eduAgreementApi } from "../api/eduAgreement.api";
// import { termNoticeApi } from "../api/termNotice.api";
import { AdminRoute } from "../router/AdminRouter";
import { userApi } from "../api/user.api";

const api = import.meta.env.VITE_API_URL;

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route path="students" 
              element={
                <EntityPage 
                  config={{
                    title: "Students",
                    endpoint: `${api}/api/students`,
                    columns: [
                      { field: "photoUrl", headerName: "Фото" },
                      { field: "lastname", headerName: "Фамилия" },
                      { field: "firstname", headerName: "Имя" },
                      { field: "middlename", headerName: "Отчество" },
                      { field: "birthdate", headerName: "Дата рождения" },
                      { field: "country", headerName: "Страна" },
                      { field: "sex", headerName: "Пол" }
                    ],
                    fields: [
                      { name: "photoUrl", label: "Фото", type: "photo" },
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
                    ],
                    api: {
                      getAll: studentApi.getAll,
                      getById: studentApi.getById,
                      create: studentApi.create,
                      update: studentApi.update,
                      delete: studentApi.delete,
                    },
                    displayFields: ["lastname", "firstname", "middlename"],
                    cardType: "student",
                  }} 
                />} 
            />
            <Route
              path="passports"
              element={<DocumentsPage typeCode="passport" />}
            />

            <Route
              path="visas"
              element={<DocumentsPage typeCode="visa" />}
            />

            <Route
              path="education_documents"
              element={<DocumentsPage typeCode="education_document" />}
            />

            <Route
              path="petitions"
              element={<DocumentsPage typeCode="petition" />}
            />
            
            <Route
              path="medical_reports"
              element={<DocumentsPage typeCode="medical_report" />}
            />

            <Route
              path="migration_cards"
              element={<DocumentsPage typeCode="migration_card" />}
            />

            <Route
              path="arrival_notifications"
              element={<DocumentsPage typeCode="arrival_notice" />}
            />

            <Route
              path="education_agreements"
              element={<DocumentsPage typeCode="edu_agreement" />}
            />

            <Route
              path="termination_notifications"
              element={<DocumentsPage typeCode="term_notice" />}
            />
          <Route index element={<Navigate to="students" />} />
        </Route>
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<MainLayout />}>
          <Route
            path="users"
            element={
              <EntityPage
                config={{
                  title: "Пользователи",
                  endpoint: `${api}/api/users`,
                  columns: [
                    { field: "email",     headerName: "Email" },
                    { field: "role",      headerName: "Роль" },
                    { field: "createdAt", headerName: "Дата регистрации" },
                  ],
                  fields: [
                    { name: "email", label: "Email",  type: "string", required: true },
                    { name: "role",  label: "Роль",   type: "select", required: true,
                      options: [
                        { value: "user",  label: "Специалист" },
                        { value: "admin", label: "Администратор" },
                      ]
                    },
                  ],
                  api: {
                    getAll:  userApi.getAll,
                    getById: userApi.getById,
                    create:  userApi.create,
                    update:  userApi.update,
                    delete:  userApi.delete,
                  },
                  displayFields: ["email", "role"],
                  cardType: "user",
                }}
              />
            }
          />
          <Route index element={<Navigate to="users" />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
