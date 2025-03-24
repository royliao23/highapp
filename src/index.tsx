import React from 'react';
import ReactDOM from "react-dom/client";
import App from './App';
import { Provider } from 'react-redux';
import { store } from './state/store';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
          <App />
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);




