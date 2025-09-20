// backend/src/models/NotificationPreferences.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

/**
 * Modelo para preferências de notificação dos usuários
 */
const NotificationPreferences = sequelize.define('NotificationPreferences', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    field: 'user_id',
  },
  
  // Preferências de Email
  emailEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'email_enabled',
  },
  emailAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'email_alerts',
  },
  emailProcessUpdates: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'email_process_updates',
  },
  emailReportCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'email_report_completed',
  },
  emailWeeklyDigest: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'email_weekly_digest',
  },
  
  // Preferências de Push Notifications
  pushEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'push_enabled',
  },
  pushAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'push_alerts',
  },
  pushProcessUpdates: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'push_process_updates',
  },
  pushReportCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'push_report_completed',
  },
  
  // Preferências de SMS (para implementação futura)
  smsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'sms_enabled',
  },
  smsAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'sms_alerts',
  },
  
  // Configurações de frequência
  alertFrequency: {
    type: DataTypes.ENUM('immediate', 'daily', 'weekly'),
    defaultValue: 'immediate',
    field: 'alert_frequency',
  },
  digestFrequency: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'never'),
    defaultValue: 'weekly',
    field: 'digest_frequency',
  },
  
  // Configurações de horário (para digest)
  preferredTime: {
    type: DataTypes.TIME,
    defaultValue: '09:00:00',
    field: 'preferred_time',
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'America/Sao_Paulo',
  },
  
}, {
  tableName: 'notification_preferences',
  timestamps: true,
  underscored: true,
});

// Associações
NotificationPreferences.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(NotificationPreferences, { foreignKey: 'userId', as: 'notificationPreferences' });

export default NotificationPreferences;
