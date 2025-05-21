import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { NewGame } from './pages/NewGame';
import { GameDetails } from './pages/GameDetails';
import { EditGame } from './pages/EditGame';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { PrivateRoute } from './components/PrivateRoute';
import { Navbar } from './components/Navbar';
import { EditUser } from './pages/EditUser';
import { Players } from './pages/Players';
import { Financeiro } from './pages/Financeiro';

export function AppRoutes() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register', '/player-confirmation'];
  const isAuthRoute = hideNavbarRoutes.includes(location.pathname);
  
  // Lista de rotas que devem ter layout centralizado
  const centeredRoutes = ['/login', '/register', '/profile', '/users/:userId/edit'];
  const shouldCenterContent = centeredRoutes.some(route => {
    const pattern = new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$');
    return pattern.test(location.pathname);
  });

  return (
    <>
      {!isAuthRoute && <Navbar />}
      <div 
        className={`${isAuthRoute ? 'flex items-center justify-center min-h-screen' : ''} ${shouldCenterContent ? 'flex items-center justify-center min-h-screen' : 'min-h-screen'}`}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-game"
            element={
              <PrivateRoute>
                <NewGame />
              </PrivateRoute>
            }
          />
          <Route
            path="/game/:id"
            element={
              <PrivateRoute>
                <GameDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/game/:id/edit"
            element={
              <PrivateRoute>
                <EditGame />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/:userId/edit"
            element={
              <PrivateRoute>
                <EditUser />
              </PrivateRoute>
            }
          />
          <Route
            path="/players"
            element={
              <PrivateRoute requireAdmin>
                <Players />
              </PrivateRoute>
            }
          />
          <Route
            path="/financeiro"
            element={
              <PrivateRoute requireAdmin>
                <Financeiro />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
} 