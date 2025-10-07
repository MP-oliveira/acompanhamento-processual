const bcrypt = require('bcryptjs');
const { User } = require('./src/models/index.js');
const sequelize = require('./src/config/database.js');

async function createDevUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');

    // Verificar se já existe um usuário admin
    const existingUser = await User.findOne({ where: { email: 'admin@dev.com' } });
    
    if (existingUser) {
      console.log('👤 Usuário admin já existe:', existingUser.email);
      return;
    }

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await User.create({
      nome: 'Admin Dev',
      email: 'admin@dev.com',
      password: hashedPassword,
      role: 'admin',
      ativo: true
    });

    console.log('✅ Usuário admin criado com sucesso:');
    console.log('📧 Email: admin@dev.com');
    console.log('🔑 Senha: 123456');
    console.log('🆔 ID:', user.id);

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await sequelize.close();
  }
}

createDevUser();
