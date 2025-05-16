import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export async function createAdminUser() {
  try {
    console.log('Iniciando criação do usuário admin...');
    
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@ibfc.com',
      'ibfc123'
    );

    console.log('Usuário criado no Firebase Auth com sucesso!');
    console.log('UID:', userCredential.user.uid);

    // Criar documento do usuário no Firestore
    const userData = {
      username: 'admin',
      email: 'admin@ibfc.com',
      role: 'administrador',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    console.log('Documento do usuário criado no Firestore com sucesso!');
    console.log('Dados salvos:', userData);

    return {
      success: true,
      message: 'Usuário administrador criado com sucesso!',
      user: userCredential.user
    };
  } catch (error) {
    const authError = error as AuthError;
    console.error('Erro detalhado:', {
      code: authError.code,
      message: authError.message
    });

    if (authError.code === 'auth/email-already-in-use') {
      console.log('O usuário admin já existe! Você pode fazer login com admin@ibfc.com e senha ibfc123');
      return {
        success: false,
        message: 'Usuário já existe',
        error: authError
      };
    }

    throw error;
  }
} 