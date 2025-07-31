import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import DesktopOnly from './components/DesktopOnly';
import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <DesktopOnly>
          <App />
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </DesktopOnly>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
