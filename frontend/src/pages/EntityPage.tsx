import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { SearchBar } from "../components/ui/SearchBar/SearchBar";
import { FilterList } from "@mui/icons-material";
import { DataTable } from "../components/ui/DataTable/DataTable";
import { EntityForm } from "../components/ui/EntityForm/EntityForm";
import { DeleteConfirmDialog } from "../components/ui/DeleteConfirmDialog/DeleteConfirmDialog";
import { FiltersForm } from "../components/ui/FiltersForm";
import type { Entity, EntityApi, EntityConfig } from "../types/entities";
import { Box, Button, IconButton, Typography, Tooltip, CircularProgress } from "@mui/material";
import { Add, Delete, Cancel } from "@mui/icons-material";
import { StudentCard } from "../components/ui/StudentCard/StudentCard";
import { UserCard } from "../components/ui/UserCard/UserCard";
import { buildFormData } from "../api/buildFormData";
import { DEBOUNCE_MS, ROWS_PER_PAGE } from "../constants/index";
import { ErrorBox } from "../components/ui/ErrorBox";

export const EntityPage = <T extends Entity>({ config }: { config: EntityConfig<T> }) => {
  const [loading, setLoading]                                 = useState(false);
  const [error, setError]                                     = useState<string | null>(null);
  const [data, setData]                                       = useState<T[]>([]);
  const [query, setQuery]                                     = useState("");
  const [debouncedQuery]                                      = useDebounce(query, DEBOUNCE_MS);
  const [total, setTotal]                                     = useState(0);
  const [formOpen, setFormOpen]                               = useState(false);
  const [editingItem, setEditingItem]                         = useState<T | null>(null);
  const [deletingItem, setDeletingItem]                       = useState<T | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen]               = useState(false);
  const [multiDeleteDialogOpen, setMultiDeleteDialogOpen]     = useState(false);
  const [page, setPage]                                       = useState(0);

  const [filtersOpen, setFiltersOpen]                         = useState(false);
  const [filtersApplied, setFiltersApplied]                   = useState<Record<string, any>>({});
  const [filtersDraft, setFiltersDraft]                       = useState<Record<string, any>>({});

  // Состояния для мультивыбора
  const [multiSelectMode, setMultiSelectMode]                 = useState(false);
  const [selectedRows, setSelectedRows]                       = useState<any[]>([]);
  const [selectedRowId, setSelectedRowId]                       = useState<string | null>(null);
  const [multiDeleteDisplayText, setMultiDeleteDisplayText]   = useState("");

  const [cardOpen, setCardOpen]                               = useState(false);
  const [photoFile, setPhotoFile]                             = useState<File | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: page + 1,
        limit: ROWS_PER_PAGE,
        ...(debouncedQuery && { search: debouncedQuery }),
        ...Object.fromEntries(
        Object.entries(filtersApplied).filter(([, v]) => v != null && v !== ""))
      };

      const { items, total } = await config.api.getAll(params);
      setData(items);
      setTotal(total);
    } catch (err) {
      setError("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQuery, config.api, filtersApplied]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, filtersApplied]);

  const handleEdit = useCallback((item: T) => {
    setEditingItem(item);
    setFormOpen(true);        
  }, []);

  const handleDelete = useCallback((item: T) => {
    setDeletingItem(item);            
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    const id = deletingItem._id ?? deletingItem.id;
    try {
      await config.api.delete(id);
      setDeleteDialogOpen(false);
      setDeletingItem(null);
      loadData();
    } catch {
      setError("Ошибка удаления");
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
    setPhotoFile(null);
  };

  const handleFormSubmit = async (
    newItem: Record<string, any>,          // универсальный объект формы
    api: EntityApi<any>,                   // API для текущей сущности
    photoFile?: File | undefined,
  ) => {
    try {
      const data = buildFormData(newItem, photoFile);

      if (editingItem?.id || editingItem?._id) {
        const id = editingItem.id || editingItem._id;
        await api.update(id, data);
      } else {
        await api.create(data);
      }

      loadData();        // обновляем таблицу
      handleFormClose(); // закрываем форму
    } catch (err: any) {
      console.error("Form submission error:", err);
      setError(err.message || "Ошибка отправки данных");
    }
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleMultiDelete = async () => {
    try {
      await Promise.all(selectedRows.map(id => config.api.delete(id)));
      setMultiDeleteDialogOpen(false);
      cancelMultiSelect();
      loadData();
    } catch {
      setError("Ошибка удаления");
    }
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
    setSelectedRows(allSelected ? [] : ids);
  };


  const cancelMultiSelect = () => {
    setSelectedRows([]);
    setMultiSelectMode(false);
  };

  const confirmMultiDelete = () => {
    // Считаем текст пока selectedRows ещё не сброшен
    const text = data
      .filter(row => selectedRows.includes(row._id))
      .map(row => config.displayFields.map((f) => row[f]).filter(Boolean).join(" "))
      .join("\n");
    setMultiDeleteDisplayText(text);
    setMultiDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      <Box display="flex" alignItems="flex-end" justifyContent="space-between" gap={2}>
        <Box>
          <Tooltip title="Фильтры">
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
          </Tooltip>
        </Box>

        <Box sx={{ flex: 1 }}>
          <SearchBar query={query} onChange={setQuery} />
        </Box>

        <Box display="flex" gap={1}>

          <Tooltip title="Добавить запись">
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
              <Add/>
            </IconButton>
          </Tooltip>

          <Tooltip title="Удалить выбранные записи">
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
          </Tooltip>
        </Box>
      </Box>

      {config.filters && (  // фильтры есть
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

      <ErrorBox message={error} />

      {loading && !error &&  // загружаемся и ошибки нет
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
          <CircularProgress />
        </Box>}
        
      {!loading && (data?.length ?? 0) === 0 && !error && (  // загружаемся без ошибки, но данных нет
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mt: 2 }}>
          <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            Данные отсутствуют. Нажмите кнопку
            <IconButton color="primary" 
                        onClick={() => setFormOpen(true)} 
                        size="small" 
                        sx={{ 
                          bgcolor: "primary.main", 
                          color: "white", 
                          "&:hover": { 
                            bgcolor: "primary.dark" } 
                        }}
              >
              <Add />
            </IconButton>
            чтобы добавить новую запись.
          </Typography>
        </Box>
      )}

      {multiSelectMode && (
        <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 1.5,
          borderRadius: 1,
          bgcolor: "background.paper",
          boxShadow: 1,
        }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }}>
            Выбрано: {selectedRows.length}
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Cancel />}
            onClick={cancelMultiSelect}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={confirmMultiDelete}
            disabled={selectedRows.length === 0}
          >
            Удалить
          </Button>
        </Box>
      )}


      {!loading && (data?.length ?? 0) > 0 && (  // загружаемся без ошибки, данные есть
        <DataTable
          data={data}
          columns={config.columns.map(col => ({ field: String(col.field), headerName: col.headerName }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
          page={page}
          onPageChange={handlePageChange}
          onRowClick={config.cardType ? (row) => {
            setSelectedRowId(String(row._id ?? row.id));
            setCardOpen(true);
          } : undefined}
          rowsPerPage={ROWS_PER_PAGE}
          totalRows={total}
          multiSelectMode={multiSelectMode}
          selectedRows={selectedRows}
          toggleSelectRow={toggleSelectRow}
          toggleSelectAll={() => toggleSelectAll(data.map(d => d._id ?? d.id))}
          cancelMultiSelect={cancelMultiSelect}
          confirmMultiDelete={confirmMultiDelete}
        />
        
      )}

      {config.cardType === "student" && (
        <StudentCard
          open={cardOpen}
          onClose={() => setCardOpen(false)}
          studentId={selectedRowId!}
        />
      )}
      {config.cardType === "user" && (
        <UserCard
          open={cardOpen}
          onClose={() => setCardOpen(false)}
          userId={selectedRowId!}
          onUpdated={loadData}
        />
      )}

      <EntityForm
        open={formOpen}
        onClose={handleFormClose}
        //api={config.api}
        onSubmit={(formData, photo) => handleFormSubmit(formData, config.api, photo)}
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
        onConfirm={handleMultiDelete}
        item={{ _id: "multi" }}
        config={config}
        displayText={multiDeleteDisplayText}
        count={selectedRows.length}
      />
    </Box>
  );
};