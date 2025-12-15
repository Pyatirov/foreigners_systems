import AppRouter from "./router/AppRouter";
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";
import theme from "./theme/theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ '*': { boxSizing: 'border-box' } }} />
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;
