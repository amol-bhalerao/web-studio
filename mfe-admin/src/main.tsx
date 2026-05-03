import React from 'react';
import ReactDOM from 'react-dom/client';
import BlogAdminApp from './BlogAdminApp';
import './index.css';

const basename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BlogAdminApp basename={basename} />
  </React.StrictMode>
);
