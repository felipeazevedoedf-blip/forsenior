
import { User, Patient, UserRole } from '../types';

export const securityService = {
  // Mascaramento de dados sensíveis (LGPD)
  maskCPF: (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
  },

  maskPhone: (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) *****-$3');
  },

  // Auditoria de Acesso (Simulada)
  logAccess: (user: User, action: string, resourceId?: string) => {
    const log = {
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      action,
      resourceId
    };
    console.log('🛡️ [AUDITORIA LGPD]:', log);
    // Em produção, isso seria enviado para um log centralizado no Firebase
  },

  // Verificação de permissão granular
  canAccessClinicalData: (user: User, patient: Patient) => {
    if (user.role === UserRole.ADMIN) return true;
    if (user.role === UserRole.PROFESSIONAL) return true;
    return false; // Viewers não vêem dados brutos sem autorização
  },

  // Backup Automático (Simulação de Sync)
  triggerBackup: async (data: any) => {
    console.log('☁️ [BACKUP]: Sincronizando dados com nuvem segura...');
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
};
