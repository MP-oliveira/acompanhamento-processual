const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = 'https://hdjqsxwkmsyhiczmhwca.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkanFzeHdrbXN5aGljem1od2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNTY2MSwiZXhwIjoyMDczMTkxNjYxfQ.75a10J1amBxrvCDzt2YWubrv3IYyr9Hh9BklOcXOqo4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdminUser() {
  try {
    console.log('🔐 Criando usuário admin...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        nome: 'Maurício Oliveira',
        email: 'mauoliver@gmail.com',
        password: hashedPassword,
        role: 'admin',
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.log('❌ Erro ao criar usuário:', error);
    } else {
      console.log('✅ Usuário admin criado com sucesso:');
      console.log(`- Nome: ${data[0].nome}`);
      console.log(`- Email: ${data[0].email}`);
      console.log(`- Role: ${data[0].role}`);
      console.log(`- Senha: 123456`);
    }
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }
}

createAdminUser();
