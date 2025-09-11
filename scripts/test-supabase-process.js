#!/usr/bin/env node

// Script para testar criação de processo no Supabase
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = 'https://hdjqsxwkmsyhiczmhwca.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkanFzeHdrbXN5aGljem1od2NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNTY2MSwiZXhwIjoyMDczMTkxNjYxfQ.75a10J1amBxrvCDzt2YWubrv3IYyr9Hh9BklOcXOqo4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testCreateProcess() {
  console.log('🚀 Testando criação de processo no Supabase...');
  
  try {
    // Primeiro, buscar o usuário admin
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@teste.com')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuário:', usersError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.error('❌ Usuário admin não encontrado');
      return;
    }
    
    const userId = users[0].id;
    console.log('✅ Usuário admin encontrado:', userId);
    
    // Criar processo de teste
    const processoData = {
      numero: 'TESTE-SUPABASE-001',
      classe: 'Ação de Cobrança',
      assunto: 'Cobrança de valores - Teste Supabase',
      tribunal: 'TJSP',
      comarca: 'São Paulo',
      status: 'ativo',
      data_distribuicao: '2025-01-15',
      data_sentenca: '2025-02-15',
      proxima_audiencia: '2025-03-15',
      observacoes: 'Processo criado via teste do Supabase',
      user_id: userId
    };
    
    const { data: processo, error: processoError } = await supabase
      .from('processos')
      .insert(processoData)
      .select();
    
    if (processoError) {
      console.error('❌ Erro ao criar processo:', processoError);
      return;
    }
    
    console.log('✅ Processo criado com sucesso!');
    console.log('📋 Dados do processo:', processo[0]);
    
    // Verificar se foi salvo
    const { data: processos, error: checkError } = await supabase
      .from('processos')
      .select('*')
      .eq('user_id', userId);
    
    if (checkError) {
      console.error('❌ Erro ao verificar processos:', checkError);
      return;
    }
    
    console.log('📊 Total de processos no Supabase:', processos.length);
    processos.forEach(p => {
      console.log(`  - ${p.numero}: ${p.classe} (${p.status})`);
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testCreateProcess();
