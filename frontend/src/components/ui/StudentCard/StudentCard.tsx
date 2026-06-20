// components/ui/StudentCard.tsx
import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, Typography, Button, Box, 
  CircularProgress, Table, TableHead, TableBody, TableRow, TableCell, Chip } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { api } from "../../../api/axios";
import { CountryCell } from "../CountryCell/CountryCell";
import { formatDate, calculateAge, getAgeSuffix } from "../DataTable/DataTable.utils";
import type { StudentData, DocumentStatus } from "../StudentCard/StudentCard.types";
import { DOC_TYPES } from "../StudentCard/StudentCard.types";
import { API_BASE_URL } from "../../../constants/index";

interface StudentCardProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
}

export const StudentCard = ({ open, onClose, studentId }: StudentCardProps) => {
  const [student, setStudent]   = useState<StudentData | null>(null);
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!studentId || !open) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: studentData } = await api.get<StudentData>(`/students/${studentId}`);
        setStudent(studentData);

        const docs = await Promise.all(
          DOC_TYPES.map(async (doc) => {
            const path = doc.api.replace("/api", "");
            const { data } = await api.get(path, { params: { student: studentId } });
            return data.length > 0
              ? { type: doc.name, exists: true,  url: `${doc.api}/${data[0]._id}` }
              : { type: doc.name, exists: false, createUrl: `${doc.api}/create?student=${studentId}` };
          })
        );
        setDocuments(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Карточка студента</DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : student ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* ── Верхний блок: фото + данные ── */}
            <Box sx={{ display: "flex", gap: 3 }}>

              {/* Фото */}
              <Box sx={{ flexShrink: 0 }}>
                {student.photoUrl ? (
                  <Box
                    component="img"
                    src={student.photoUrl.startsWith("http")
                      ? student.photoUrl
                      : `${API_BASE_URL}${student.photoUrl}`}
                    alt="Фото студента"
                    sx={{ width: 130, height: 160, borderRadius: 2, objectFit: "cover", boxShadow: 2 }}
                  />
                ) : (
                  <Box sx={{ width: 130, height: 160, borderRadius: 2, bgcolor: "grey.200", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="caption" color="textSecondary">Нет фото</Typography>
                  </Box>
                )}
              </Box>

              {/* Данные — сетка 2х3 */}
              <Grid container spacing={2} sx={{ flex: 1, alignContent: "flex-start" }}>
                <Grid size={12}>
                  <Typography variant="h6">
                    {student.lastname} {student.firstname} {student.middlename}
                  </Typography>
                </Grid>

                <Grid size={6}>
                  <Typography variant="caption" color="textSecondary">Дата рождения</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>{formatDate(student.birthdate)}</Typography>
                    {(() => {
                      const age = calculateAge(student.birthdate);
                      return age !== null
                        ? <Typography variant="body2" color="textSecondary">{age} {getAgeSuffix(age)}</Typography>
                        : null;
                    })()}
                  </Box>
                </Grid>

                <Grid size={6}>
                  <Typography variant="caption" color="textSecondary">Пол</Typography>
                  <Typography>{student.sex ? "Мужской" : "Женский"}</Typography>
                </Grid>

                {student.country && (
                  <Grid size={6}>
                    <Typography variant="caption" color="textSecondary">Страна</Typography>
                    <CountryCell value={student.country} />
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* ── Документы ── */}
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>Документы</Typography>
              <Table size="small">
                <TableHead sx={{ bgcolor: "primary.main" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Документ</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Статус</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Действие</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.type} sx={{ ":hover": { bgcolor: "secondary.main" } }}>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell align="center">
                        {doc.exists
                          ? <Chip icon={<CheckCircle />} label="Есть" color="success" size="small" />
                          : <Chip icon={<Cancel />}      label="Нет"  color="error"   size="small" />
                        }
                      </TableCell>
                      <TableCell align="center">
                        {doc.exists ? (
                          <Button size="small" variant="outlined" href={doc.url ?? "#"} target="_blank">
                            Открыть
                          </Button>
                        ) : (
                          <Button size="small" variant="contained" onClick={() => window.open(doc.createUrl, "_blank")}>
                            Создать
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

          </Box>
        ) : (
          <Typography>Студент не найден</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};