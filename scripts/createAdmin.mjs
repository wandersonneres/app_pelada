import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAJosy4XydDqYTUFfIXhs80c6x5B3h-H9U",
  authDomain: "app-pelada.firebaseapp.com",
  projectId: "app-pelada",
  storageBucket: "app-pelada.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    console.log('Iniciando criação do usuário admin...');
    
    // Verificar se o username já existe
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', 'admin'));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log('O usuário admin já existe! Você pode fazer login com:');
      console.log('👤 Usuário: admin');
      console.log('🔑 Senha: ibfc123');
      return {
        success: false,
        message: 'Usuário já existe',
      };
    }

    // Criar email temporário para o admin
    const adminEmail = 'admin@ibfc.com';
    
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      'ibfc123'
    );

    console.log('Usuário criado no Firebase Auth com sucesso!');
    console.log('UID:', userCredential.user.uid);

    // Criar documento do usuário no Firestore
    const userData = {
      id: userCredential.user.uid,
      username: 'admin',
      email: adminEmail,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
    console.error('Erro detalhado:', {
      code: error.code,
      message: error.message
    });

    if (error.code === 'auth/email-already-in-use') {
      console.log('O usuário admin já existe! Você pode fazer login com:');
      console.log('👤 Usuário: admin');
      console.log('🔑 Senha: ibfc123');
      return {
        success: false,
        message: 'Usuário já existe',
        error
      };
    }

    throw error;
  }
}

// Executar a criação do usuário admin
console.log('Iniciando script de criação do usuário admin...');

createAdminUser()
  .then((result) => {
    if (result.success) {
      console.log('✅ Script executado com sucesso!');
      console.log('👤 Usuário: admin');
      console.log('🔑 Senha: ibfc123');
    } else {
      console.log('⚠️ ', result.message);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar o script:', error);
    process.exit(1);
  }); 