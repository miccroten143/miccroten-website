import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Admin_App from '../src/Admin/Admin_App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />} />
      <Route path='/admin/*' element={<Admin_App />} />
    </Routes>
  </BrowserRouter>
);
