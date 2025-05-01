import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80c9ff',
      300: '#4db2ff',
      400: '#1a9bff',
      500: '#0084e6',
      600: '#0067b3',
      700: '#004a80',
      800: '#002d4d',
      900: '#00101a',
    },
    teamA: {
      500: '#3182CE', // Azul
    },
    teamB: {
      500: '#E53E3E', // Vermelho
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        p: 4,
        borderRadius: 'lg',
        boxShadow: 'md',
      },
    },
  },
}); 