import { useState, useEffect } from "react";
import { SearchBar } from "../components/ui/SearchBar";
import { FilterList } from "@mui/icons-material";
import { DataTable } from "../components/ui/DataTable";
import { EntityForm } from "../components/ui/EntityForm";
import { DeleteConfirmDialog } from "../components/ui/DeleteConfirmDialog";
import { FiltersForm } from "../components/ui/FiltersForm";
import type { EntityConfig } from "../types/entities";
import { Box, IconButton, Typography } from "@mui/material";
import { Add, Delete, Cancel } from "@mui/icons-material";
import { StudentCard } from "../components/ui/StudentCard";

interface EntityPageProps<T> {
  config: EntityConfig<T>;
}

export const EntityPage = <T extends Record<string, any>>({ config }: EntityPageProps<T>) => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<T[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [multiDeleteDialogOpen, setMultiDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState<Record<string, any>>({});
  const [filtersDraft, setFiltersDraft] = useState<Record<string, any>>({});

  // Состояния для мультивыбора
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Строим строку запроса с учетом пагинации, поиска и фильтров
  const buildQueryParams = () => {
    const params = new URLSearchParams(); // Используем URLSearchParams для удобства

    if (query) params.set("search", query); // предполагается, что API поддерживает параметр "search"
    params.set("page", String(page + 1)); // предполагается, что API использует 1-индексацию страниц
    params.set("limit", "10"); // фиксированное количество элементов на страницу

    Object.entries(filtersApplied).forEach(([key, value]) => { // добавляем только непустые фильтры
      if (value !== undefined && value !== null && value !== "") { // проверяем на непустое значение
        params.set(key, String(value)); // предполагается, что API поддерживает фильтрацию по этим параметрам
      }
    });

    return params.toString(); // возвращаем строку запроса
  };

  const loadData = () => {
    console.log("loadData: старт загрузки");
    setLoading(true); // меняем состояние загрузки
    setError(null); // сбрасываем ошибку перед загрузкой

    const qs = buildQueryParams(); // строим строку запроса
    console.log("loadData: query string", qs);

    // Выполняем запрос к API
    fetch(`${config.endpoint}?${qs}`) // используем endpoint из конфигурации
      .then(res => { // обрабатываем ответ
        console.log("loadData: получен ответ", res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`); // проверяем успешность ответа
        return res.json(); // парсим JSON из ответа
      })
      .then((d) => { // обрабатываем полученные данные
        console.log("loadData: данные из API", d);
        const items = Array.isArray(d) ? d : d.items ?? []; // адаптируем к разным форматам ответа
        setData(items);
      })
      .catch((err) => { // обрабатываем ошибки
        console.error("loadData: ошибка", err);
        setError("Ошибка загрузки данных");
      })
      .finally(() => setLoading(false)); // меняем состояние загрузки в любом случае
  };

  useEffect(() => {
    loadData();
  }, [config.endpoint, query, JSON.stringify(filtersApplied), page]); // перезагружаем данные при изменении endpoint, запроса, фильтров или страницы

  useEffect(() => {
    setPage(0); // сбрасываем страницу при изменении запроса или фильтров
  }, [query]);

  const handleEdit = (item: T) => {
    setEditingItem(item); // устанавливаем редактируемый элемент
    setFormOpen(true); // открываем форму
  };

  const handleDelete = (item: T) => {
    setDeletingItem(item); // устанавливаем удаляемый элемент
    setDeleteDialogOpen(true); // открываем диалог подтверждения удаления
  };

  const handleConfirmDelete = () => {
    if (deletingItem) {
      const id = deletingItem._id || deletingItem.id;
      fetch(`${config.endpoint}/${id}`, { method: "DELETE" }).then(() => {
        loadData();
        setDeleteDialogOpen(false);
        setDeletingItem(null);
      });
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
    setPhotoFile(null);
  };

  const handleFormSubmit = (newItem: T) => {
    const id = editingItem ? (editingItem._id || editingItem.id) : null;
    const url = id ? `${config.endpoint}/${id}` : config.endpoint;
    const method = editingItem ? "PATCH" : "POST";

    // If there's a photo file, use FormData; otherwise use JSON
    if (photoFile) {
      const formData = new FormData();

      // Add form fields, excluding photoUrl since we'll send the file instead
      Object.entries(newItem).forEach(([key, value]) => {
        if (key === "photoUrl") {
          // Skip photoUrl field, the photo file will be sent instead
          return;
        }
        if (value !== undefined && value !== null && typeof value !== "object") {
          formData.append(key, String(value));
        }
      });

      // Add the photo file with the expected field name "photo"
      formData.append("photo", photoFile);

      fetch(url, {
        method,
        body: formData,
      })
        .then(res => {
          if (!res.ok) throw new Error(`Request failed: ${res.status}`);
          return res.json();
        })
        .then(() => {
          loadData();
          handleFormClose();
        })
        .catch(err => {
          console.error("Form submission error:", err);
          setError(err.message);
        });
    } else {
      // Send as JSON when no photo
      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      })
        .then(res => {
          if (!res.ok) throw new Error(`Request failed: ${res.status}`);
          return res.json();
        })
        .then(() => {
          loadData();
          handleFormClose();
        })
        .catch(err => {
          console.error("Form submission error:", err);
          setError(err.message);
        });
    }
  };



  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const activeFiltersCount = Object.values(filtersApplied).filter(v => v !== undefined && v !== null && v !== "").length;

  // Мультивыбор
  const toggleMultiSelectMode = () => {
    setMultiSelectMode((v) => !v);
    setSelectedRows([]);
  };

  const toggleSelectRow = (id: any) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = (ids: any[]) => {
    const allSelected = ids.every(id => selectedRows.includes(id));
    setSelectedRows(allSelected ? [] : [...new Set([...selectedRows, ...ids])]);
  };


  const cancelMultiSelect = () => {
    setSelectedRows([]);
    setMultiSelectMode(false);
  };

  const confirmMultiDelete = () => {
    setMultiDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <Box display="flex" alignItems="flex-end" justifyContent="space-between" gap={2}>
        <Box>
          <IconButton
            color="primary"
            onClick={() => setFiltersOpen(v => !v)}
            size="large"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
              position: "relative",
            }}
          >
            <FilterList />
            {activeFiltersCount > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "secondary.main",
                  color: "white",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {activeFiltersCount}
              </Box>
            )}
          </IconButton>
        </Box>

        <Box sx={{ flex: 1 }}>
          <SearchBar query={query} onChange={setQuery} />
        </Box>

        <Box display="flex" gap={1}>
          <IconButton
            color="primary"
            onClick={() => setFormOpen(true)}
            size="large"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <Add />
          </IconButton>
          <IconButton
            color={multiSelectMode ? "secondary" : "primary"}
            onClick={toggleMultiSelectMode}
            size="large"
            sx={{
              bgcolor: multiSelectMode ? "secondary.main" : "primary.main",
              color: "white",
              "&:hover": { bgcolor: multiSelectMode ? "secondary.dark" : "primary.dark" },
            }}
          >
            <Delete />
          </IconButton>
        </Box>
      </Box>

      {config.filters && (
        <FiltersForm
          open={filtersOpen}
          filters={config.filters}
          values={filtersDraft}
          onChange={(field, value) => setFiltersDraft(prev => ({ ...prev, [field]: value }))}
          onApply={() => {
            setFiltersApplied(filtersDraft);
            setFiltersOpen(false);
          }}
          onReset={() => {
            setFiltersDraft({});
            setFiltersApplied({});
            setFiltersOpen(false);
          }}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      {error && 
        <Box sx={{ bgcolor: "#ffebee", color: "#c62828", p: 2, borderRadius: 1 }}>
          {error}
        </Box>}

      {loading && !error && 
        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="body1">
            Загрузка...
          </Typography>
        </Box>}
        
      {!loading && (data?.length ?? 0) === 0 && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mt: 2 }}>
          <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            Данные отсутствуют. Нажмите кнопку
            <IconButton color="primary" onClick={() => setFormOpen(true)} size="small" sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}>
              <Add />
            </IconButton>
            чтобы добавить новую запись.
          </Typography>
        </Box>
      )}

      {multiSelectMode && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="body2">Выбрано {selectedRows.length} объектов</Typography>
          <IconButton size="small" color="default" onClick={cancelMultiSelect}>
            <Cancel />
          </IconButton>
          <IconButton size="small" color="error" onClick={confirmMultiDelete}>
            <Delete />
          </IconButton>
        </Box>
      )}


      {!loading && (data?.length ?? 0) > 0 && (
        <DataTable
          data={data}
          columns={config.columns.map(col => ({ field: String(col.field), headerName: col.headerName }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
          page={page}
          onPageChange={handlePageChange}
          onRowClick={(row) => {
            console.log("Row clicked:", row);
            setSelectedStudent(row._id);
            setCardOpen(true);
          }}
          rowsPerPage={10}
          multiSelectMode={multiSelectMode}
          selectedRows={selectedRows}
          toggleSelectRow={toggleSelectRow}
          toggleSelectAll={() => toggleSelectAll(data.map(d => d.id || d._id))}
          cancelMultiSelect={cancelMultiSelect}
          confirmMultiDelete={confirmMultiDelete}
        />
        
      )}

      <StudentCard
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        studentId={selectedStudent!}
      />

      <EntityForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        config={config}
        photoFile={photoFile}
        onPhotoChange={setPhotoFile}
        editingItem={editingItem}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeletingItem(null); }}
        onConfirm={handleConfirmDelete}
        item={deletingItem ?? undefined}
        config={config}
      />

      <DeleteConfirmDialog
        open={multiDeleteDialogOpen}
        onClose={() => setMultiDeleteDialogOpen(false)}
        onConfirm={() => {
          // тут можно вызывать API удаления выбранных элементов
          setMultiDeleteDialogOpen(false);
          cancelMultiSelect();
          loadData();
        }}
        item={{ _id: selectedRows.join(","), name: `${selectedRows.length} объектов` }}
        config={config}
      />
    </Box>
  );
};