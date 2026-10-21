import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Placeholder from './pages/Placeholder';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="promozioni" element={<Placeholder title="Promozioni" />} />
          <Route path="chi-siamo" element={<Placeholder title="Chi siamo" />} />
          <Route path="contatti" element={<Placeholder title="Contatti" />} />
          <Route path="*" element={<Placeholder title="Pagina non trovata" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
