// import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { PageNavProvider } from './contexts/PageNavContext';
import { AppRoutes } from './AppRoutes';

export function App() {
  return (
    // <ChakraProvider theme={theme}>
      <AuthProvider>
        <PageNavProvider>
          <Router>
            <AppRoutes />
          </Router>
        </PageNavProvider>
      </AuthProvider>
    // </ChakraProvider>
  );
} 