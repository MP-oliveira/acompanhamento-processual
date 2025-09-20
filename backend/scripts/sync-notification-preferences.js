// backend/scripts/sync-notification-preferences.js

/**
 * Script para sincronizar a tabela de preferências de notificação
 */

import sequelize from '../src/config/database.js';
import NotificationPreferences from '../src/models/NotificationPreferences.js';

async function syncNotificationPreferences() {
  try {
    console.log('🔄 Sincronizando tabela notification_preferences...');
    await NotificationPreferences.sync({ alter: true });
    console.log('✅ Tabela notification_preferences sincronizada com sucesso!');

    // Opcional: Verificar se a tabela realmente existe
    const [results] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type LIKE '%TABLE' AND table_name != 'spatial_ref_sys';"
    );
    if (results.some(table => table.table_name === 'notification_preferences')) {
      console.log('✅ Tabela notification_preferences existe no banco de dados');
    } else {
      console.error('❌ Erro: Tabela notification_preferences não encontrada após sincronização.');
    }

  } catch (error) {
    console.error('❌ Erro ao sincronizar tabela notification_preferences:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

syncNotificationPreferences();
