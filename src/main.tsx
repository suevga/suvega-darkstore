import { createRoot } from 'react-dom/client';
import './index.css';
import { Toaster } from './components/ui/toaster';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('root element not found! reload the app')
}

createRoot(rootElement).render(
  <>
    <App />
    <Toaster />
  </>
);