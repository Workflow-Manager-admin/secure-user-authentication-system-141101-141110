import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import DesktopOnly from './components/DesktopOnly';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <DesktopOnly>
        <App />
      </DesktopOnly>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#27272a',
            color: '#ffffff',
            border: '1px solid #3f3f46',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#f59e42',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);
