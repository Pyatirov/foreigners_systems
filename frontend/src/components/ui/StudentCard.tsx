import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Button,
  Box,
  CircularProgress,
  Paper
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import axios from "axios";

interface StudentCardProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
}

interface DocumentStatus {
  type: string;
  exists: boolean;
  url?: string;
  createUrl?: string;
}

interface StudentData {
  firstname: string;
  lastname: string;
  middlename?: string;
  birthdate: string;
  country?: string;
  sex?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({ open, onClose, studentId }) => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const fetchStudent = async () => {
      try {
        setLoading(true);
        const studentRes = await axios.get(`/api/students/${studentId}`);
        setStudent(studentRes.data);

        const docTypes = [
          { name: "Удостоверение личности", api: "/api/passports" },
          { name: "Виза", api: "/api/visas" },
          { name: "Документ об образовании", api: "/api/education_documents" },
          { name: "Ходатайства", api: "/api/petitions" },
          { name: "Медицинское заключение", api: "/api/medical_reports" },
          { name: "Миграционная карта", api: "/api/migration_cards" },
          { name: "Уведомление о прибытии", api: "/api/arrival_notifications" },
          { name: "Договор об образовании", api: "/api/education_agreements" },
          { name: "Уведомление о расторжении", api: "/api/termination_notifications" }
        ];

        const docsPromises = docTypes.map(async (doc) => {
          const res = await axios.get(doc.api, { params: { student: studentId } });
          if (res.data.length > 0) {
            return { type: doc.name, exists: true, url: `${doc.api}/${res.data[0]._id}` };
          } else {
            return { type: doc.name, exists: false, createUrl: `${doc.api}/create?student=${studentId}` };
          }
        });

        const docs = await Promise.all(docsPromises);
        setDocuments(docs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Карточка студента</DialogTitle>
      <Paper>
        
      </Paper>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : student ? (
          <Box>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography variant="subtitle2">Фамилия</Typography>
                <Typography>{student.lastname}</Typography>
              </Grid>

              <Grid size={6}>
                <Typography variant="subtitle2">Имя</Typography>
                <Typography>{student.firstname}</Typography>
              </Grid>

              {student.middlename && (
                <Grid size={6}>
                    <Typography variant="subtitle2">Отчество</Typography>
                    <Typography>{student.middlename}</Typography>
                </Grid>
              )}

              <Grid size={6}>
                <Typography variant="subtitle2">Дата рождения</Typography>
                <Typography>{new Date(student.birthdate).toLocaleDateString()}</Typography>
              </Grid>

              {student.country && (
                <Grid size={6}>
                  <Typography variant="subtitle2">Страна</Typography>
                  <Typography>{student.country}</Typography>
                </Grid>
              )}

              {student.sex !== undefined && (
                <Grid size={6}>
                  <Typography variant="subtitle2">Пол</Typography>
                  <Typography>{student.sex ? "М" : "Ж"}</Typography>
                </Grid>
              )}
            </Grid>

            <Box marginTop={3}>
              <Typography variant="h6">Документы</Typography>

              <Grid container spacing={2} marginTop={1}>
                {documents.map((doc) => (
                  <Grid size={12} key={doc.type}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap"
                      }}
                    >
                      {doc.exists ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )}

                      <Typography>{doc.type}</Typography>

                      {doc.exists ? (
                        <Button size="small" href={doc.url ?? "#"} target="_blank">
                          Открыть
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          href={doc.createUrl ?? "#"}
                          target="_blank"
                          variant="outlined"
                        >
                          Создать
                        </Button>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        ) : (
          <Typography>Студент не найден</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};
