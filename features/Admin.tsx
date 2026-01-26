
import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '../components/ui';
import { store } from '../services/store';
import { User, UserRole, Professional } from '../types';
import { securityService } from '../services/security';

interface AdminProps {
  user: User;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
  const [professionals, setProfessionals] = useState<Professional[]>(store.getProfessionals());
  const [logs] = useState([
    { id: '1', user: 'Dra. Helena', action: 'Visualizou Prontuário #123', time: '10:45' },
    { id: '2', user: 'Dr. Lucas', action: 'Cadastrou Teste TUG', time: '11:20' },
    { id: '3', user: 'Admin', action: 'Exportou Relatório Mensal', time: '09:00' },
  ]);

  const toggleProfessionalStatus = (prof: Professional) => {
    const updated = { ...prof, active: !prof.active };
    store.updateProfessional(updated);
    setProfessionals(store.getProfessionals());
    securityService.logAccess(user, `${updated.active ? 'Ativou' : 'Desativou'} profissional ${prof.name}`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0D4F6A] poppins">⚙️ Gestão e Auditoria</h2>
          <p className="text-gray-500">Controle centralizado de permissões e logs de segurança (LGPD).</p>
        </div>
        <Badge variant="error">Módulo Restrito: ADMIN</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gestão de Acessos */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Usuários do Sistema (Equipe)">
            <div className="divide-y">
              {professionals.map(p => (
                <div key={p.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[#0D4F6A]">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#33383D]">{p.name}</p>
                      <p className="text-xs text-gray-400 font-medium uppercase">{p.expertise} • {p.registroProfissional}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={p.active ? 'success' : 'default'}>{p.active ? 'ATIVO' : 'SUSPENSO'}</Badge>
                    <Button 
                      size="sm" 
                      variant={p.active ? 'danger' : 'secondary'} 
                      onClick={() => toggleProfessionalStatus(p)}
                    >
                      {p.active ? 'Bloquear' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Logs de Auditoria em Tempo Real">
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="text-xs p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-[#0D4F6A]">{log.time}</span>
                    <span className="text-gray-400">|</span>
                    <span className="font-bold text-[#2E9E6A]">{log.user}</span>
                    <span className="text-gray-600 font-medium">{log.action}</span>
                  </div>
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Verificado</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Status LGPD */}
        <div className="space-y-6">
          <Card className="bg-[#0D4F6A] text-white border-none shadow-xl">
             <h4 className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-4">Compliance Score</h4>
             <div className="text-4xl font-black poppins mb-2">98%</div>
             <p className="text-xs opacity-80 leading-relaxed mb-6">
               Sua clínica está em conformidade com as diretrizes da LGPD (Brasil).
             </p>
             <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-bold">
                 <span>Consentimentos OK</span>
                 <span>100%</span>
               </div>
               <div className="w-full bg-white/20 h-1.5 rounded-full">
                 <div className="bg-[#2E9E6A] h-full w-full rounded-full"></div>
               </div>
             </div>
          </Card>

          <Card title="Ações de Segurança">
            <div className="space-y-3">
              <Button variant="ghost" className="w-full text-xs font-bold text-left justify-start">🔐 Trocar Chaves de Criptografia</Button>
              <Button variant="ghost" className="w-full text-xs font-bold text-left justify-start">📥 Baixar Backup Estruturado</Button>
              <Button variant="ghost" className="w-full text-xs font-bold text-left justify-start text-red-600 border-red-100">🚫 Anonimizar Dados Inativos</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
