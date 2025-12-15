import { TextField } from "@mui/material";

interface Props {
  query: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ query, onChange }: Props) => {
  return (
    <TextField
      fullWidth
      label="Поиск"
      value={query}
      onChange={(e) => onChange(e.target.value)}
      size="small"
    />
  );
};
