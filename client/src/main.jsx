import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './styles/index.css';
import './styles/app.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <WatchlistProvider>
          <App />
        </WatchlistProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
