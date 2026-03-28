import { Alert } from "@mui/material";

interface ErrorBoxProps {
  message: string | null;
}

export const ErrorBox = ({ message }: ErrorBoxProps) => {
  if (!message) return null;
  return <Alert severity="error">{message}</Alert>;
};