import React from 'react';
import ReactDOM from 'react-dom/client';
import BlogWebApp from './BlogWebApp';
import './index.css';

const basename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BlogWebApp basename={basename} />
  </React.StrictMode>
);
