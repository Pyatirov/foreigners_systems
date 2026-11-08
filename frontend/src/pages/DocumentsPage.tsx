import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, ArchiveOutlined, Cancel } from "@mui/icons-material";

import { SearchBar } from "../components/ui/SearchBar/SearchBar";
import { DataTable } from "../components/ui/DataTable/DataTable";
import { EntityForm } from "../components/ui/EntityForm/EntityForm";
import { ErrorBox } from "../components/ui/ErrorBox";
import { documentApi, type DocumentRecord, type DocumentPayload } from "../api/document.api";
import {
  documentTypeApi,
  type DocumentType,
  type DocumentTypeField,
} from "../api/documentType.api";
import { studentApi } from "../api/student.api";
import type {
  Entity,
  EntityApi,
  EntityConfig,
  EntityField,
} from "../types/entities";
import { DEBOUNCE_MS, ROWS_PER_PAGE } from "../constants/index";

const COMMON_FIELD_NAMES = new Set([
  "id",
  "_id",
  "studentId",
  "studentName",
  "documentTypeId",
  "typeCode",
  "typeName",
  "series",
  "number",
  "issuedDate",
  "expiryDate",
  "scanUrl",
  "notes",
  "uploadedAt",
  "status",
  "data",
  "createdAt",
  "updatedAt",
]);

type DocumentRow = Record<string, any> & {
  id: string;
  _id: string;
  studentId: string;
  studentName: string;
  typeCode: string;
  typeName: string;
  data: Record<string, unknown>;
};

type StudentOptionSource = {
  id?: string;
  _id?: string;
  lastname?: string;
  firstname?: string;
  middlename?: string | null;
};

type SelectOption = { label: string; value: string | number | boolean };

function flattenDocument(document: DocumentRecord): DocumentRow {
  return {
    ...(document.data ?? {}),
    ...document,
    _id: document.id,
    student: document.studentName,
  } as DocumentRow;
}

function normalizeOptions(options: DocumentTypeField["options"]): SelectOption[] {
  if (Array.isArray(options)) {
    return options.flatMap((option): SelectOption[] => {
      if (typeof option === "string" || typeof option === "number") {
        return [{ value: option, label: String(option) }];
      }

      if (typeof option === "object" && option !== null) {
        const record = option as Record<string, unknown>;
        const value = record.value;
        const label = record.label;
        if (
          (typeof value === "string" || typeof value === "number" || typeof value === "boolean") &&
          (typeof label === "string" || typeof label === "number")
        ) {
          return [{ value, label: String(label) }];
        }
      }
      return [];
    });
  }

  if (options && typeof options === "object") {
    return Object.entries(options).map(([value, label]) => ({
      value,
      label: typeof label === "string" || typeof label === "number"
        ? String(label)
        : value,
    }));
  }

  return [];
}

function toEntityFieldType(field: DocumentTypeField): EntityField<DocumentRow>["type"] {
  switch (field.dataType || field.type) {
    case "number":
      return "number";
    case "date":
      return "date";
    case "select":
      // Поле select без заданных options разрешаем вводить текстом,
      // иначе форма отобразит пустой список, из которого ничего нельзя выбрать.
      return normalizeOptions(field.options).length > 0 ? "select" : "string";
    case "boolean":
      return "select";
    case "text":
    case "textarea":
    case "datetime":
    default:
      return "string";
  }
}

function toEntityFieldOptions(field: DocumentTypeField): SelectOption[] | undefined {
  if (field.dataType === "boolean" || field.type === "boolean") {
    return [
      { label: "Да", value: "true" },
      { label: "Нет", value: "false" },
    ];
  }
  const options = normalizeOptions(field.options);
  return options.length > 0 ? options : undefined;
}

function buildPayload(
  values: Record<string, unknown>,
  typeCode: string,
  fields: DocumentTypeField[]
): DocumentPayload {
  const data: Record<string, unknown> = {};

  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(values, field.name)) {
      data[field.name] = values[field.name];
    }
  }

  const emptyToNull = (value: unknown) => value === "" || value === undefined ? null : value;

  return {
    typeCode,
    studentId: values.studentId,
    series: emptyToNull(values.series),
    number: emptyToNull(values.number),
    issuedDate: emptyToNull(values.issuedDate),
    expiryDate: emptyToNull(values.expiryDate),
    scanUrl: emptyToNull(values.scanUrl),
    notes: emptyToNull(values.notes),
    data,
  };
}

function recordFromFormData(data: FormData | DocumentRow): Record<string, unknown> {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return Object.fromEntries(data.entries());
  }
  return data as Record<string, unknown>;
}

export type DocumentsPageProps = {
  typeCode: string;
};

export const DocumentsPage = ({ typeCode }: DocumentsPageProps) => {
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [students, setStudents] = useState<StudentOptionSource[]>([]);
  const [loadingType, setLoadingType] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStudentsError, setLoadingStudentsError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<DocumentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_MS);
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DocumentRow | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [archivingItem, setArchivingItem] = useState<DocumentRow | null>(null);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingType(true);
    setDocumentType(null);
    setError(null);
    setPage(0);

    documentTypeApi.getByCode(typeCode)
      .then((result) => {
        if (active) setDocumentType(result);
      })
      .catch((requestError: unknown) => {
        console.error("Document type loading failed:", requestError);
        if (active) {
          setError("Не удалось загрузить конфигурацию типа документа");
        }
      })
      .finally(() => {
        if (active) setLoadingType(false);
      });

    return () => {
      active = false;
    };
  }, [typeCode]);

  useEffect(() => {
    let active = true;

    studentApi.getAll({ page: 1, limit: 100 })
      .then(({ items }) => {
        if (active) {
          setStudents(items as StudentOptionSource[]);
          setLoadingStudentsError("");
        }
      })
      .catch((requestError: unknown) => {
        console.error("Student options loading failed:", requestError);
        if (active) {
          setLoadingStudentsError("Не удалось загрузить список студентов для формы документа");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await documentApi.getAll({
        type: typeCode,
        page: page + 1,
        limit: ROWS_PER_PAGE,
        ...(debouncedQuery.trim() ? { search: debouncedQuery.trim() } : {}),
      });

      setRows(result.items.map(flattenDocument));
      setTotal(result.total);
    } catch (requestError: unknown) {
      console.error("Document list loading failed:", requestError);
      setError("Не удалось загрузить документы");
    } finally {
      setLoading(false);
    }
  }, [typeCode, page, debouncedQuery]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, typeCode]);

  const activeFields = useMemo(
    () => (documentType?.fields ?? []).filter((field) => field.isActive),
    [documentType]
  );

  const studentOptions = useMemo<SelectOption[]>(() => {
    return students.flatMap((student) => {
      const id = student.id ?? student._id;
      if (!id) return [];
      const fullName = [student.lastname, student.firstname, student.middlename]
        .filter((part) => typeof part === "string" && part.trim())
        .join(" ");
      return [{ value: id, label: fullName || id }];
    });
  }, [students]);

  const columns = useMemo(() => {
    const common = [
      { field: "studentName", headerName: "Студент" },
      { field: "series", headerName: "Серия" },
      { field: "number", headerName: "Номер" },
      { field: "issuedDate", headerName: "Дата выдачи" },
      { field: "expiryDate", headerName: "Действителен до" },
    ];

    const dynamic = activeFields
      .filter((field) => !COMMON_FIELD_NAMES.has(field.name))
      .map((field) => ({ field: field.name, headerName: field.label }));

    return [
      ...common,
      ...dynamic,
      { field: "status", headerName: "Статус" },
    ];
  }, [activeFields]);

  const entityApi = useMemo<EntityApi<DocumentRow>>(() => ({
    getAll: async (params) => {
      const result = await documentApi.getAll({
        type: typeCode,
        ...(params ?? {}),
      });
      return {
        items: result.items.map(flattenDocument),
        total: result.total,
      };
    },
    getById: async (id) => flattenDocument(await documentApi.getById(id)),
    create: async (data) => {
      const values = recordFromFormData(data);
      const payload = buildPayload(values, typeCode, activeFields);
      return flattenDocument(await documentApi.create(payload));
    },
    update: async (id, data) => {
      const values = recordFromFormData(data);
      const payload = buildPayload(values, typeCode, activeFields);
      return flattenDocument(await documentApi.update(id, payload));
    },
    delete: async (id) => {
      await documentApi.archive(id);
    },
  }), [typeCode, activeFields]);

  const config = useMemo<EntityConfig<DocumentRow> | null>(() => {
    if (!documentType) return null;

    const fields: EntityField<DocumentRow>[] = [
      {
        name: "studentId",
        label: "Студент",
        type: "select",
        required: true,
        options: studentOptions,
      },
      { name: "series", label: "Серия", type: "string" },
      { name: "number", label: "Номер", type: "string" },
      { name: "issuedDate", label: "Дата выдачи", type: "date" },
      { name: "expiryDate", label: "Дата окончания действия", type: "date" },
      ...activeFields
        .filter((field) => !COMMON_FIELD_NAMES.has(field.name))
        .map((field): EntityField<DocumentRow> => ({
          name: field.name,
          label: field.label,
          type: toEntityFieldType(field),
          required: field.required,
          options: toEntityFieldOptions(field),
        })),
      { name: "scanUrl", label: "Путь к скану", type: "string" },
      { name: "notes", label: "Примечания", type: "string" },
    ];

    return {
      title: documentType.name,
      endpoint: "/documents",
      columns,
      fields,
      api: entityApi,
      displayFields: ["studentName", "series", "number"],
    };
  }, [documentType, studentOptions, activeFields, columns, entityApi]);

  const handleEdit = useCallback((item: DocumentRow) => {
    setEditingItem(item);
    setPhotoFile(null);
    setFormOpen(true);
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setPhotoFile(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
    setPhotoFile(null);
  };

  const handleFormSubmit = async (
    formValues: Record<string, unknown>,
    _unusedPhoto?: File
  ) => {
    if (!documentType) return;

    setError(null);

    try {
      const payload = buildPayload(formValues, typeCode, activeFields);

      if (editingItem?.id) {
        await documentApi.update(editingItem.id, payload);
      } else {
        await documentApi.create(payload);
      }

      handleFormClose();
      await loadDocuments();
    } catch (requestError: unknown) {
      console.error("Document form submission failed:", requestError);
      const message =
        typeof requestError === "object" && requestError !== null &&
        "response" in requestError
          ? (requestError as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || "Не удалось сохранить документ");
    }
  };

  const handleArchive = useCallback((item: DocumentRow) => {
    setArchivingItem(item);
  }, []);

  const handleConfirmArchive = async () => {
    if (!archivingItem) return;

    setArchiving(true);
    setError(null);

    try {
      await documentApi.archive(archivingItem.id ?? archivingItem._id);
      setArchivingItem(null);
      await loadDocuments();
    } catch (requestError: unknown) {
      console.error("Document archive failed:", requestError);
      const message =
        typeof requestError === "object" && requestError !== null &&
        "response" in requestError
          ? (requestError as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || "Не удалось архивировать документ");
    } finally {
      setArchiving(false);
    }
  };

  if (loadingType && !documentType) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!documentType) {
    return <ErrorBox message={error || "Тип документа не найден"} />;
  }

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", md: "flex-end" },
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ color: "#393433", fontWeight: 600, mb: 0.5 }}>
            {documentType.name}
          </Typography>
          {documentType.description && (
            <Typography variant="body2" color="text.secondary">
              {documentType.description}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1, flex: { xs: "1 1 100%", md: "0 0 420px" } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SearchBar query={query} onChange={setQuery} />
          </Box>

          <Tooltip title={`Добавить: ${documentType.name}`}>
            <IconButton
              color="primary"
              onClick={handleOpenCreate}
              aria-label="Добавить документ"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                borderRadius: "10px",
                width: 44,
                height: 44,
                flexShrink: 0,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loadingStudentsError && <Alert severity="warning">{loadingStudentsError}</Alert>}
      <ErrorBox message={error} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleArchive}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          rowsPerPage={ROWS_PER_PAGE}
          totalRows={total}
        />
      )}

      {config && (
        <EntityForm<DocumentRow>
          open={formOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          config={config}
          photoFile={photoFile}
          onPhotoChange={setPhotoFile}
          editingItem={editingItem}
        />
      )}

      <Dialog
        open={Boolean(archivingItem)}
        onClose={() => !archiving && setArchivingItem(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Архивировать документ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Документ будет скрыт из активного списка. Его можно будет найти в архиве;
            запись не будет физически удалена из базы данных.
          </DialogContentText>
          {archivingItem && (
            <Typography sx={{ mt: 1.5, fontWeight: 600 }}>
              {archivingItem.typeName}: {archivingItem.number || archivingItem.studentName}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setArchivingItem(null)}
            disabled={archiving}
            startIcon={<Cancel />}
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirmArchive}
            disabled={archiving}
            variant="contained"
            startIcon={archiving ? undefined : <ArchiveOutlined />}
          >
            {archiving ? "Архивация..." : "В архив"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
