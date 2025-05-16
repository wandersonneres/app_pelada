import { createAdminUser } from './utils/createAdminUser';

console.log('Iniciando script de criação do usuário admin...');

// Executar a criação do usuário admin
createAdminUser()
  .then((result) => {
    if (result.success) {
      console.log('✅ Script executado com sucesso!');
      console.log('📧 Email:', 'admin@ibfc.com');
      console.log('🔑 Senha:', 'ibfc123');
    } else {
      console.log('⚠️ ', result.message);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar o script:', error);
    process.exit(1);
  }); 