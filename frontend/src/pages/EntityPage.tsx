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

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetch(config.endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ошибка! статус: ${res.status}`);
        return res.json();
      })
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Ошибка загрузки данных");
        setLoading(false);
      });
  };

  useEffect(() => {
    setData([]);
    setPage(0);
    loadData();
  }, [config.endpoint]);

  const applyFilters = (data: T[]) => {
    if (!Object.keys(filtersApplied).length || !config.filters?.length) return data;
    return data.filter((item) =>
      config.filters!.every((filter) => {
        const fieldKey = filter.field as keyof T;
        const value = filtersApplied[String(fieldKey)];
        if (value === "" || value === undefined || value === null) return true;
        const itemValue = item[fieldKey];
        if (filter.type === "string") return String(itemValue ?? "").toLowerCase().includes(String(value).toLowerCase());
        if (filter.type === "select") return itemValue === value;
        return true;
      })
    );
  };

  const filteredData = applyFilters(data);

  useEffect(() => {
    setPage(0);
  }, [query]);

  const handleAdd = (newItem: T) => {
    fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    }).then(() => {
      loadData();
      setEditingItem(null);
    });
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = (item: T) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
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
  };

  const handleFormSubmit = (newItem: T) => {
    if (editingItem) {
      const id = editingItem._id || editingItem.id;
      fetch(`${config.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      }).then(() => {
        loadData();
        handleFormClose();
      });
    } else {
      handleAdd(newItem);
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
        
      {!loading && data.length === 0 && !error && (
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


      {!loading && data.length > 0 && (
        <DataTable
          data={filteredData}
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
          toggleSelectAll={() => toggleSelectAll(filteredData.map(d => d.id || d._id))}
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

// import { useState, useEffect } from "react";
// import { SearchBar } from "../components/ui/SearchBar";
// import { FilterList } from "@mui/icons-material";
// import { DataTable } from "../components/ui/DataTable";
// import { EntityForm } from "../components/ui/EntityForm";
// import { DeleteConfirmDialog } from "../components/ui/DeleteConfirmDialog";
// import { FiltersForm } from "../components/ui/FiltersForm";
// import type { EntityConfig } from "../types/entities";
// import { Box, IconButton, Typography } from "@mui/material";
// import { Add, Delete, Cancel } from "@mui/icons-material";

// interface EntityPageProps<T> {
//   config: EntityConfig<T>;
// }

// export const EntityPage = <T extends Record<string, any>>({ config }: EntityPageProps<T>) => {
//   const [query, setQuery] = useState("");
//   const [data, setData] = useState<T[]>([]);
//   const [formOpen, setFormOpen] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [multiDeleteDialogOpen, setMultiDeleteDialogOpen] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [editingItem, setEditingItem] = useState<T | null>(null);
//   const [deletingItem, setDeletingItem] = useState<T | null>(null);
//   const [page, setPage] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [filtersApplied, setFiltersApplied] = useState<Record<string, any>>({});
//   const [filtersDraft, setFiltersDraft] = useState<Record<string, any>>({});

//   // Мультивыбор
//   const [multiSelectMode, setMultiSelectMode] = useState(false);
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);

//   const loadData = () => {
//     setLoading(true);
//     setError(null);
//     fetch(config.endpoint)
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//         return res.json();
//       })
//       .then((d) => {
//         setData(Array.isArray(d) ? d : []);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Fetch error:", err);
//         setError(`Failed to load data: ${err.message}`);
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     setData([]);
//     setPage(0);
//     loadData();
//   }, [config.endpoint]);

//   const applyFilters = (data: T[]) => {
//     if (!Object.keys(filtersApplied).length || !config.filters?.length) return data;
//     return data.filter((item) =>
//       config.filters!.every((filter) => {
//         const fieldKey = filter.field as keyof T;
//         const value = filtersApplied[String(fieldKey)];
//         if (value === "" || value === undefined || value === null) return true;
//         const itemValue = item[fieldKey];
//         if (filter.type === "string")
//           return String(itemValue ?? "").toLowerCase().includes(String(value).toLowerCase());
//         if (filter.type === "select") return itemValue === value;
//         return true;
//       })
//     );
//   };

//   const filteredData = applyFilters(data);

//   useEffect(() => {
//     setPage(0);
//   }, [query]);

//   const handleAdd = (newItem: T) => {
//     fetch(config.endpoint, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(newItem),
//     }).then(() => {
//       loadData();
//       setEditingItem(null);
//     });
//   };

//   const handleEdit = (item: T) => {
//     setEditingItem(item);
//     setFormOpen(true);
//   };

//   const handleDelete = (item: T) => {
//     setDeletingItem(item);
//     setDeleteDialogOpen(true);
//   };

//   const handleConfirmDelete = () => {
//     if (deletingItem) {
//       const id = deletingItem._id || deletingItem.id;
//       fetch(`${config.endpoint}/${id}`, { method: "DELETE" }).then(() => {
//         loadData();
//         setDeleteDialogOpen(false);
//         setDeletingItem(null);
//       });
//     }
//   };

//   const handleFormClose = () => {
//     setFormOpen(false);
//     setEditingItem(null);
//   };

//   const handleFormSubmit = (newItem: T) => {
//     if (editingItem) {
//       const id = editingItem._id || editingItem.id;
//       fetch(`${config.endpoint}/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newItem),
//       }).then(() => {
//         loadData();
//         handleFormClose();
//       });
//     } else {
//       handleAdd(newItem);
//     }
//   };

//   const handlePageChange = (_event: unknown, newPage: number) => {
//     setPage(newPage);
//   };

//   const activeFiltersCount = Object.values(filtersApplied).filter(
//     (v) => v !== undefined && v !== null && v !== ""
//   ).length;

//   // Мультивыбор
//   const toggleMultiSelectMode = () => {
//     setMultiSelectMode((v) => !v);
//     setSelectedRows([]);
//   };

//   const toggleSelectRow = (id: any) => {
//     setSelectedRows((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = (ids: any[]) => {
//     const allSelected = ids.every((id) => selectedRows.includes(id));
//     setSelectedRows(allSelected ? [] : [...new Set([...selectedRows, ...ids])]);
//   };

//   const cancelMultiSelect = () => {
//     setSelectedRows([]);
//     setMultiSelectMode(false);
//   };

//   const confirmMultiDelete = () => {
//     setMultiDeleteDialogOpen(true);
//   };

//   return (
//     <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
//       <Box display="flex" alignItems="flex-end" justifyContent="space-between" gap={2}>
//         {/* Фильтры */}
//         <Box>
//           <IconButton
//             color="primary"
//             onClick={() => setFiltersOpen((v) => !v)}
//             size="large"
//             sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" }, position: "relative" }}
//           >
//             <FilterList />
//             {activeFiltersCount > 0 && (
//               <Box
//                 sx={{
//                   position: "absolute",
//                   top: 4,
//                   right: 4,
//                   bgcolor: "secondary.main",
//                   color: "white",
//                   borderRadius: "50%",
//                   width: 18,
//                   height: 18,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: 10,
//                   fontWeight: "bold",
//                 }}
//               >
//                 {activeFiltersCount}
//               </Box>
//             )}
//           </IconButton>
//         </Box>

//         <Box sx={{ flex: 1 }}>
//           <SearchBar query={query} onChange={setQuery} />
//         </Box>

//         <Box display="flex" gap={1}>
//           <IconButton
//             color="primary"
//             onClick={() => setFormOpen(true)}
//             size="large"
//             sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}
//           >
//             <Add />
//           </IconButton>
//           <IconButton
//             color={multiSelectMode ? "secondary" : "primary"}
//             onClick={toggleMultiSelectMode}
//             size="large"
//             sx={{ bgcolor: multiSelectMode ? "secondary.main" : "primary.main", color: "white", "&:hover": { bgcolor: multiSelectMode ? "secondary.dark" : "primary.dark" } }}
//           >
//             <Delete />
//           </IconButton>
//         </Box>
//       </Box>

//       {config.filters && (
//         <FiltersForm
//           open={filtersOpen}
//           filters={config.filters}
//           values={filtersDraft}
//           onChange={(field, value) => setFiltersDraft((prev) => ({ ...prev, [field]: value }))}
//           onApply={() => {
//             setFiltersApplied(filtersDraft);
//             setFiltersOpen(false);
//           }}
//           onReset={() => {
//             setFiltersDraft({});
//             setFiltersApplied({});
//             setFiltersOpen(false);
//           }}
//           onClose={() => setFiltersOpen(false)}
//         />
//       )}

//       {error && <Box sx={{ bgcolor: "#ffebee", color: "#c62828", p: 2, borderRadius: 1 }}>{error}</Box>}
//       {loading && !error && (
//         <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
//           <Typography variant="body1">Загрузка...</Typography>
//         </Box>
//       )}
//       {!loading && data.length === 0 && !error && (
//         <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mt: 2 }}>
//           <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             Данные отсутствуют. Нажмите кнопку
//             <IconButton color="primary" onClick={() => setFormOpen(true)} size="small" sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}>
//               <Add />
//             </IconButton>
//             чтобы добавить новую запись.
//           </Typography>
//         </Box>
//       )}

//       {/* Панель мультивыбора — только здесь */}
//       {multiSelectMode && (
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
//           <Typography variant="body2">Выбрано {selectedRows.length} объектов</Typography>
//           <IconButton size="small" color="default" onClick={cancelMultiSelect}>
//             <Cancel />
//           </IconButton>
//           <IconButton size="small" color="error" onClick={confirmMultiDelete}>
//             <Delete />
//           </IconButton>
//         </Box>
//       )}

//       {!loading && data.length > 0 && (
//         <DataTable
//           data={filteredData}
//           columns={config.columns.map((col) => ({ field: String(col.field), headerName: col.headerName }))}
//           onEdit={handleEdit}
//           onDelete={handleDelete}
//           page={page}
//           onPageChange={handlePageChange}
//           rowsPerPage={10}
//           multiSelectMode={multiSelectMode}
//           selectedRows={selectedRows}
//           toggleSelectRow={toggleSelectRow}
//           toggleSelectAll={() => toggleSelectAll(filteredData.map((d) => d.id || d._id))}
//         />
//       )}

//       <EntityForm open={formOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} config={config} editingItem={editingItem} />

//       <DeleteConfirmDialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setDeletingItem(null); }} onConfirm={handleConfirmDelete} item={deletingItem ?? undefined} config={config} />

//       <DeleteConfirmDialog
//         open={multiDeleteDialogOpen}
//         onClose={() => setMultiDeleteDialogOpen(false)}
//         onConfirm={() => {
//           // Вызов API для удаления selectedRows
//           setMultiDeleteDialogOpen(false);
//           cancelMultiSelect();
//           loadData();
//         }}
//         item={{ _id: selectedRows.join(","), name: `${selectedRows.length} объектов` }}
//         config={config}
//       />
//     </Box>
//   );
// };
