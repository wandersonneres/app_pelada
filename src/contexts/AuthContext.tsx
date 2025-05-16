import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User, AuthState } from '../types/index';

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (userData: {
    username: string;
    password: string;
    email?: string;
    phone?: string;
    playerInfo?: {
      name: string;
      position: 'defesa' | 'meio' | 'ataque';
      ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50';
      skillLevel: 1 | 2 | 3 | 4 | 5;
    };
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setAuthState({
            user: userData,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      // Buscar usuário pelo username (case-insensitive)
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      // Encontrar usuário com username case-insensitive
      const userDoc = querySnapshot.docs.find(doc => {
        const userData = doc.data();
        return userData.username.toLowerCase() === username.toLowerCase();
      });

      if (!userDoc) {
        throw new Error('Usuário não encontrado');
      }

      const userData = userDoc.data() as User;

      // Fazer login com o email associado ao username
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userData.email || `${username}@ibfc.com`,
        password
      );

      const token = await userCredential.user.getIdToken();
      
      setAuthState({
        user: userData,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (userData: {
    username: string;
    password: string;
    email?: string;
    phone?: string;
    playerInfo?: {
      name: string;
      position: 'defesa' | 'meio' | 'ataque';
      ageGroup: '15-20' | '21-30' | '31-40' | '41-50' | '+50';
      skillLevel: 1 | 2 | 3 | 4 | 5;
    };
  }) => {
    try {
      // Verificar se o username já existe
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', userData.username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error('Nome de usuário já está em uso');
      }

      // Criar email temporário baseado no username
      const tempEmail = `${userData.username}@ibfc.com`;
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        tempEmail,
        userData.password
      );
      
      const newUser: User = {
        id: userCredential.user.uid,
        username: userData.username,
        email: userData.email || tempEmail,
        phone: userData.phone,
        role: 'player',
        playerInfo: userData.playerInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const token = await userCredential.user.getIdToken();
      setAuthState({
        user: newUser,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 