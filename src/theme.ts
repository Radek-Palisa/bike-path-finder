import { createMuiTheme } from '@material-ui/core/styles';

interface CustomThemeFields {
  palette: any;
}

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    custom: CustomThemeFields;
  }
  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    custom: CustomThemeFields;
  }
}

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#7eb0ff',
      main: '#4181ec',
      dark: '#0055B9',
    },
    secondary: {
      light: '#FF8276',
      main: '#DB504A',
      dark: '#A31922',
    },
    text: {
      primary: '#333',
      secondary: '#757575',
    },
    background: {
      default: '#fff',
    },
    error: {
      main: '#DB504A',
      dark: '#A31922',
    },
    warning: {
      light: '#FFEB7A',
      main: '#FFC857',
      dark: '#C89825',
    },
  },
  typography: {
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  custom: {
    palette: {
      tertiary: {
        light: '#FFEB7A',
        main: '#FFC857',
        dark: '#C89825',
      },
    },
  },
});

export default theme;
