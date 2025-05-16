import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config/firebase.ts';

async function createAdminUser() {
  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@ibfc.com',
      'ibfc123'
    );

    // Criar documento do usuário no Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      username: 'admin',
      email: 'admin@ibfc.com',
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    console.log('Usuário administrador criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
  }
}

// Executar a criação do usuário admin
createAdminUser()
  .then(() => {
    console.log('Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro ao executar o script:', error);
    process.exit(1);
  }); 