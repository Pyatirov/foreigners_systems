import { TextField } from "@mui/material";
import { SearchAdornment, ClearAdornment } from "../Adornments/Adornments";
import type { SearchBarProps } from "./SearchBar.types";

export const SearchBar = ({ query, onChange }: SearchBarProps) => {
  return (
    <TextField
      fullWidth
      value={query}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      slotProps={{
        input: {
          startAdornment: (                      // иконка поиска слева
            <SearchAdornment />
          ),
          endAdornment: (                        // кнопка очистки справа
            <ClearAdornment show={query !== ""} onClear={() => onChange("")}
            />
          ),
        },
      }}
    />
  );
};