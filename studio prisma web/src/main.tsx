import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './CatalogApp.tsx';
import './index.css';
import './lighting.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
