// Importação otimizada dos modelos para ambiente serverless (Vercel)
// NÃO executa sync() pois as tabelas já existem no Supabase
import sequelize from '../config/database.js';
import User from './User.js';
import Processo from './Processo.js';
import Alert from './Alert.js';
import Consulta from './Consulta.js';
import Relatorio from './Relatorio.js';
import AuditLog from './AuditLog.js';
import PushSubscription from './PushSubscription.js';
import NotificationPreferences from './NotificationPreferences.js';
import Comment from './Comment.js';
import Custa from './Custa.js';
import Documento from './Documento.js';
import CalendarEvent from './CalendarEvent.js';
import Timesheet from './Timesheet.js';
import Cliente from './Cliente.js';

// Definindo associações (igual ao index.js, mas sem sync)
User.hasMany(Processo, { foreignKey: 'userId', as: 'processos' });
Processo.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Processo.hasMany(Alert, { foreignKey: 'processoId', as: 'alertas' });
Alert.belongsTo(Processo, { foreignKey: 'processoId', as: 'processo' });

User.hasMany(Alert, { foreignKey: 'userId', as: 'alertas' });
Alert.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Consulta, { foreignKey: 'userId', as: 'consultas' });
Consulta.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Relatorio, { foreignKey: 'userId', as: 'relatorios' });
Relatorio.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(PushSubscription, { foreignKey: 'userId', as: 'pushSubscriptions' });
PushSubscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Processo.hasMany(Comment, { foreignKey: 'processoId', as: 'comments' });
Comment.belongsTo(Processo, { foreignKey: 'processoId', as: 'processo' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Processo.hasMany(Custa, { foreignKey: 'processoId', as: 'custas' });
Custa.belongsTo(Processo, { foreignKey: 'processoId', as: 'processo' });

User.hasMany(Custa, { foreignKey: 'registradoPor', as: 'custasRegistradas' });
Custa.belongsTo(User, { foreignKey: 'registradoPor', as: 'registrador' });

Processo.hasMany(Documento, { foreignKey: 'processoId', as: 'documentos' });
Documento.belongsTo(Processo, { foreignKey: 'processoId', as: 'processo' });

User.hasMany(Documento, { foreignKey: 'uploadPor', as: 'documentosUpload' });
Documento.belongsTo(User, { foreignKey: 'uploadPor', as: 'uploader' });

Processo.hasMany(CalendarEvent, { foreignKey: 'processoId', as: 'eventos' });
CalendarEvent.belongsTo(Processo, { foreignKey: 'processoId', as: 'processo' });

User.hasMany(CalendarEvent, { foreignKey: 'userId', as: 'eventos' });
CalendarEvent.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Processo.hasMany(Timesheet, { foreignKey: 'processoId', as: 'timesheets' });
Timesheet.belongsTo(Processo, { foreignKey: 'processoId', as: 'processo' });

User.hasMany(Timesheet, { foreignKey: 'userId', as: 'timesheets' });
Timesheet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Timesheet, { foreignKey: 'aprovadoPor', as: 'timesheetsAprovados' });
Timesheet.belongsTo(User, { foreignKey: 'aprovadoPor', as: 'aprovador' });

User.hasMany(Timesheet, { foreignKey: 'pagoPor', as: 'timesheetsPagos' });
Timesheet.belongsTo(User, { foreignKey: 'pagoPor', as: 'pagador' });

User.hasMany(Cliente, { foreignKey: 'userId', as: 'clientes' });
Cliente.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Cliente.hasMany(Processo, { foreignKey: 'clienteId', as: 'processos' });
Processo.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

export { 
  sequelize, 
  User, 
  Processo, 
  Alert, 
  Consulta, 
  Relatorio, 
  AuditLog, 
  PushSubscription, 
  NotificationPreferences,
  Comment,
  Custa,
  Documento,
  CalendarEvent,
  Timesheet,
  Cliente
};

