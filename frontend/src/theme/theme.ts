import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#67000A',      // основной цвет приложения
    },
    secondary: {
      main: '#B7A284',      // акцентный цвет
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused fieldset': {
            borderColor: '#ff5722', // цвет рамки при фокусе для всех TextField и Select
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // отключаем автоматический капс
        },
      },
    },
  },
});

export default theme;
