import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { EntityPage } from "../pages/EntityPage";
import { AuthPage } from "../pages/AuthPage";
import { PrivateRoute } from "./SecuteRoute";
import { createStudent, deleteStudent, getStudentById, getStudents, updateStudent } from "../api/student.api";
import { createPassport, deletePassport, getPassportById, getPassports, updatePassport } from "../api/passport.api";
import { createVisa, deleteVisa, getVisaById, getVisas, updateVisa } from "../api/visa.api";
import { deleteEducation, getEducation, getEducationById, updateEducation, createEducation } from "../api/education.api";
import { createPetition, deletePetition, getPetitionById, updatePetition, getPetitions } from "../api/petition.api";
import { createMedicalReport, deleteMedicalReport, getMedicalReportById, getMedicalReports, updateMedicalReport } from "../api/medicalReport";
import { createMigrationCard, deleteMigrationCard, getMigrationCardById, updateMigrationCard, getMigrationCards } from "../api/migrationCard";
import { createArrivalNotice, deleteArrivalNotice, getArrivalNotices, getArrivalNoticeById, updateArrivalNotice } from "../api/arrivalNotice.api";
import { createEduAgreement, deleteEduAgreement, getEduAgreementById, getEduAgreements, updateEduAgreement } from "../api/eduAgreement.api";
import { createTermNotice, deleteTermNotice, getTermNoticeById, getTermNotices, updateTermNotice } from "../api/termNotice.api";

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
                      getAll: getStudents,
                      getById: getStudentById,
                      create: createStudent,
                      update: updateStudent,
                      delete: deleteStudent,
                    },
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
                    ],
                    api: {
                      getAll: getPassports,
                      getById: getPassportById,
                      create: createPassport,
                      update: updatePassport,
                      delete: deletePassport,
                    },
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
                    ],
                    api: {
                      getAll: getVisas,
                      getById: getVisaById,
                      create: createVisa,
                      update: updateVisa,
                      delete: deleteVisa,
                    },
                  }} 
                />} 
            />
            <Route path="education_documents" 
              element={
                <EntityPage 
                  config={{
                    title: "Education Documents",
                    endpoint: `${api}/api/education_documents`,
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
                      { name: "graduation_date", label: "Дата окончания", type: "date", required: true }
                    ],
                    api: {
                      getAll: getEducation,
                      getById: getEducationById,
                      create: createEducation,
                      update: updateEducation,
                      delete: deleteEducation,
                    },
                  }} 
                />} 
            />
            <Route path="/petitions" 
              element={
                <EntityPage 
                  config={{
                    title: "Ходатайства",
                    endpoint: `${api}/api/petitions`,
                    columns: [
                      { field: "district", headerName: "Район УМВД" },
                      { field: "object", headerName: "Цель подачи" },
                      { field: "reason", headerName: "В связи с" }
                    ],
                    fields: [
                      { name: "district", label: "Район УМВД", type: "select", options:[
                          {value: "Адмиралтейскому", label: "Адмиралтейский"},
                          {value: "Выборгскому", label: "Выборгский"},
                        ]
                      },
                      { name: "object", label: "Цель подачи", type: "string", required: true },
                      { name: "reason", label: "В связи с", type: "string", required: true }
                    ],
                    api: {
                      getAll: getPetitions,
                      getById: getPetitionById,
                      create: createPetition,
                      update: updatePetition,
                      delete: deletePetition,
                    },  
                  }} 
                />} 
            />
            <Route path="/medical_reports" 
              element={
                <EntityPage 
                  config={{
                    title: "Медицинские заключения",
                    endpoint: `${api}/api/medical_reports`,
                    columns: [
                      { field: "organization", headerName: "Организация" },
                      { field: "series", headerName: "Серия" },
                      { field: "number", headerName: "Номер" }
                    ],
                    fields: [
                      { name: "organization", label: "Организация", type: "string"},
                      { name: "series", label: "Серия", type: "number", required: true },
                      { name: "number", label: "Номер", type: "number", required: true }
                    ],
                    api: {
                      getAll: getMedicalReports,
                      getById: getMedicalReportById,
                      create: createMedicalReport,
                      update: updateMedicalReport,
                      delete: deleteMedicalReport,
                    },  
                  }} 
                />} 
            />
            <Route path="/migration_cards" 
              element={
                <EntityPage 
                  config={{
                    title: "Миграционные карты",
                    endpoint: `${api}/api/migration_cards`,
                    columns: [
                      { field: "series", headerName: "Серия" },
                      { field: "number", headerName: "Номер" },
                      { field: "start_date", headerName: "Начало срока пребывания" },
                      { field: "end_date", headerName: "Конец срока пребывания" },
                    ],
                    fields: [
                      { name: "series", label: "Серия", type: "number", required: true },
                      { name: "number", label: "Номер", type: "number", required: true },
                      { name: "start_date", label: "Начало срока пребывания", type: "date", required: true },
                      { name: "end_date", label: "Конец срока пребывания", type: "date" }
                    ],
                    api: {
                      getAll: getMigrationCards,
                      getById: getMigrationCardById,
                      create: createMigrationCard,
                      update: updateMigrationCard,
                      delete: deleteMigrationCard,
                    },  
                  }} 
                />} 
            />
            <Route path="/arrival_notifications" 
              element={
                <EntityPage 
                  config={{
                    title: "Уведомления о прибытии",
                    endpoint: `${api}/api/arrival_notifications`,
                    columns: [
                      { field: "student", headerName: "Владелец" },
                    ],
                    fields: [
                      { name: "student", label: "Владелец", type: "string", required: true },
                    ],
                    api: {
                      getAll: getArrivalNotices,
                      getById: getArrivalNoticeById,
                      create: createArrivalNotice,
                      update: updateArrivalNotice,
                      delete: deleteArrivalNotice,
                    },  
                  }} 
                />} 
            />
            <Route path="/education_agreements" 
              element={
                <EntityPage 
                  config={{
                    title: "Договоры об образовании",
                    endpoint: `${api}/api/education_agreements`,
                    columns: [
                      { field: "number", headerName: "Номер" },
                    ],
                    fields: [
                      { name: "number", label: "Номер", type: "number", required: true },
                    ],
                    api: {
                      getAll: getEduAgreements,
                      getById: getEduAgreementById,
                      create: createEduAgreement,
                      update: updateEduAgreement,
                      delete: deleteEduAgreement,
                    }, 
                  }} 
                />} 
            />
            <Route path="/termination_notifications" 
              element={
                <EntityPage 
                  config={{
                    title: "Уведомления о предоставлении академического отпуска, {'\n'} о завершении или досрочном прекращении обучения",
                    endpoint: `${api}/api/termination_notifications`,
                    columns: [
                      { field: "district", headerName: "Район УМВД" },
                      { field: "object", headerName: "Цель подачи" },
                      { field: "reason", headerName: "Основание" }
                    ],
                    fields: [
                      { name: "district", label: "Район УМВД", type: "select", options:[
                          {value: "Адмиралтейскому", label: "Адмиралтейский"},
                          {value: "Выборгскому", label: "Выборгский"},
                        ]
                      },
                      { name: "object", label: "Цель подачи", type: "string", required: true },
                      { name: "reason", label: "Основание", type: "string", required: true }
                    ],
                    api: {
                      getAll: getTermNotices,
                      getById: getTermNoticeById,
                      create: createTermNotice,
                      update: updateTermNotice,
                      delete: deleteTermNotice,
                    }, 
                  }} 
                />} 
            />
          <Route index element={<Navigate to="students" />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
