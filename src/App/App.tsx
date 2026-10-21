import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.scss';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { AuthProvider } from '@/contexts/AuthProvider';
import { RegisterPage } from '@/pages/Auth/RegisterPage';
import { PrivateRoute } from '@/routes/PrivateRoute';
import { Board } from '@/components/board/Board/Board';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/*Публичныу роуты*/}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />

          {/* Защищенные роут */}
          <Route
            path='/'
            element={
              <PrivateRoute>
                <Layout>
                  <Board />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
