import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Search, Clear } from "@mui/icons-material";

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
}

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
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (                        // кнопка очистки справа
            <InputAdornment position="end">
              {query && (                        // только если есть текст
                <IconButton
                  onClick={() => onChange("")}   // очищаем через onChange родителя
                  edge="end"
                  size="small"
                >
                  <Clear fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  );
};
