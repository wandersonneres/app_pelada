import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const processPendingUsers = functions.firestore
  .document('pendingUsers/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    
    try {
      // Criar usuário no Firebase Auth
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.username,
      });

      // Criar documento do usuário no Firestore
      const { password, ...userDataWithoutPassword } = userData;
      await admin.firestore()
        .collection('users')
        .doc(userRecord.uid)
        .set({
          ...userDataWithoutPassword,
          id: userRecord.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Deletar o documento pendente
      await snap.ref.delete();

      return null;
    } catch (error) {
      console.error('Erro ao processar usuário pendente:', error);
      // Atualizar o documento pendente com o erro
      await snap.ref.update({
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      throw error;
    }
  }); 