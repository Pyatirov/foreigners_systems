import { Search, Clear } from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";
import type { ClearAdornmentProps } from "./Adornments.types";

export const SearchAdornment = () => (
    <InputAdornment position="start">
        <Search fontSize="small" />
    </InputAdornment>
);

export const ClearAdornment = ({ show, onClear }: ClearAdornmentProps) => {
  if (!show) return null;
  return (
    <InputAdornment position="end">
        <IconButton
          size="small"
          onClick={onClear}
          edge="end"
          aria-label="Очистить поле"
        >
          <Clear fontSize="small" />
        </IconButton>
      </InputAdornment>
    );
  };