// Script para debugar o problema de autenticação
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Simula o que o frontend está fazendo
async function testUserDeactivation() {
  try {
    console.log('🔍 Testando desativação de usuário...');
    
    // 1. Primeiro, fazer login para obter o token
    console.log('\n1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'guilherme@jurisacompanha.com',
      password: 'Bom@250908'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('🔑 Token obtido:', token.substring(0, 50) + '...');
    
    // 2. Testar a desativação de usuário
    console.log('\n2. Testando desativação de usuário ID 15...');
    const deactivateResponse = await axios.patch(
      `${API_BASE_URL}/users/15/deactivate`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Usuário desativado com sucesso');
    console.log('📋 Resposta:', deactivateResponse.data);
    
    // 3. Verificar se o usuário foi realmente desativado
    console.log('\n3. Verificando status do usuário...');
    const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const user15 = usersResponse.data.users.find(u => u.id === 15);
    console.log('👤 Usuário ID 15:', user15);
    console.log('📊 Status ativo:', user15?.ativo);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
      console.error('📋 Headers:', error.response.headers);
    }
  }
}

testUserDeactivation();
