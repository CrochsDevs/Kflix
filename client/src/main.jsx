import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './styles/index.css';
import './styles/app.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: '#fff', background: '#0a0a0a', minHeight: '100vh' }}>
          <h1 style={{ color: '#e50914' }}>Something went wrong</h1>
          <pre style={{ background: '#1a1a1a', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 12 }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={() => { window.location.href = '/'; }}
            style={{ marginTop: 16, padding: '10px 20px', background: '#e50914', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Back to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <WatchlistProvider>
            <App />
          </WatchlistProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);