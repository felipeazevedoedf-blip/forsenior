
import React, { useState } from 'react';
import { Card, Button, Input, Modal, Badge } from '../components/ui';
import { store } from '../services/store';
import { Professional, UserRole, ProfessionalLog, User } from '../types';

interface ProfessionalsProps {
  user: User;
}

const Professionals: React.FC<ProfessionalsProps> = ({ user }) => {
  const [professionals, setProfessionals] = useState(store.getProfessionals());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProfLogs, setSelectedProfLogs] = useState<ProfessionalLog[]>([]);

  const [newProf, setNewProf] = useState<Partial<Professional>>({
    name: '',
    expertise: '',
    areaAtuacao: '',
    registroProfissional: '',
    phone: '',
    email: '',
    active: true,
    sbvAtivo: false,
    sbvVencimento: '',
    clinicId: user.clinicId
  });

  const handleOpenEdit = (prof: Professional) => {
    setEditingId(prof.id);
    setNewProf({ ...prof });
    setIsModalOpen(true);
  };

  const handleOpenHistory = (prof: Professional) => {
    const logs = store.getProfessionalLogs(prof.id);
    setSelectedProfLogs(logs);
    setIsHistoryModalOpen(true);
  };

  const calculateChanges = (oldProf: Professional, updatedProf: Professional) => {
    const changes: any[] = [];
    const fields = ['name', 'expertise', 'areaAtuacao', 'registroProfissional', 'phone', 'email', 'active', 'sbvAtivo', 'sbvVencimento'];
    
    fields.forEach(field => {
      if ((oldProf as any)[field] !== (updatedProf as any)[field]) {
        changes.push({
          field,
          oldValue: (oldProf as any)[field],
          newValue: (updatedProf as any)[field]
        });
      }
    });
    return changes;
  };

  const handleSave = () => {
    if (!newProf.name || !newProf.expertise || !newProf.registroProfissional) {
      alert("Por favor, preencha todos os campos obrigatórios (*)");
      return;
    }

    if (editingId) {
      const oldProf = professionals.find(p => p.id === editingId);
      if (oldProf) {
        const updatedProf = { ...newProf as Professional, id: editingId };
        const changes = calculateChanges(oldProf, updatedProf);
        
        if (changes.length > 0) {
          store.updateProfessional(updatedProf);
          
          const log: ProfessionalLog = {
            id: Date.now().toString(),
            professionalId: editingId,
            professionalName: updatedProf.name,
            changedByUserId: user.id,
            changedByUserName: user.name,
            timestamp: new Date().toISOString(),
            action: 'UPDATE',
            changes
          };
          store.addProfessionalLog(log);
        }
      }
    } else {
      const profId = Math.floor(Math.random() * 1000).toString();
      const prof: Professional = {
        ...newProf as Professional,
        id: profId,
        active: true
      };
      
      store.addProfessional(prof);
      
      const log: ProfessionalLog = {
        id: Date.now().toString(),
        professionalId: profId,
        professionalName: prof.name,
        changedByUserId: user.id,
        changedByUserName: user.name,
        timestamp: new Date().toISOString(),
        action: 'CREATE'
      };
      store.addProfessionalLog(log);
    }
    
    setProfessionals(store.getProfessionals());
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setNewProf({ 
      name: '', 
      expertise: '', 
      areaAtuacao: '', 
      registroProfissional: '',
      phone: '', 
      email: '', 
      active: true, 
      sbvAtivo: false, 
      sbvVencimento: '',
      clinicId: user.clinicId
    });
  };

  const filtered = professionals.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.expertise.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.areaAtuacao && p.areaAtuacao.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.registroProfissional && p.registroProfissional.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isEduFisica = newProf.expertise?.toLowerCase().includes('educação física') || 
                      newProf.areaAtuacao?.toLowerCase().includes('educação física');

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0D4F6A] poppins">Equipe Multiprofissional</h2>
          <p className="text-gray-500">Gestão de acesso e histórico de alterações de equipe.</p>
        </div>
        {(user.role === UserRole.ADMIN || user.role === UserRole.PROFESSIONAL) && (
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} variant="primary">
            + Cadastrar Profissional
          </Button>
        )}
      </div>

      <div className="relative group">
        <input 
          type="text"
          placeholder="Buscar por nome, especialidade, registro ou área de atuação..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#0D4F6A] outline-none transition-all shadow-sm group-hover:border-[#0D4F6A]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg className="w-6 h-6 absolute left-4 top-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <Card key={p.id} className="hover:shadow-xl transition-all border-l-4 border-[#2E9E6A]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F4F6F8] rounded-xl flex items-center justify-center text-[#0D4F6A] font-bold">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#0D4F6A] poppins truncate max-w-[150px]">{p.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="success">{p.expertise}</Badge>
                    {p.areaAtuacao && <Badge variant="default">{p.areaAtuacao}</Badge>}
                  </div>
                </div>
              </div>
              <span className={`w-3 h-3 rounded-full ${p.active ? 'bg-green-500' : 'bg-gray-300'}`} title={p.active ? 'Ativo' : 'Inativo'}></span>
            </div>
            
            <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
              {p.registroProfissional && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="p-2 bg-gray-50 rounded-lg">📄</span>
                  <span className="font-bold text-[#0D4F6A]">{p.registroProfissional}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="p-2 bg-gray-50 rounded-lg">📞</span>
                <span className="font-medium">{p.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="p-2 bg-gray-50 rounded-lg">✉️</span>
                <span className="truncate">{p.email}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button size="sm" variant="ghost" className="flex-1 text-[11px]" onClick={() => handleOpenHistory(p)}>🕒 Histórico</Button>
              {user.role !== UserRole.VIEWER && (
                <Button 
                  size="sm" 
                  variant="primary" 
                  className="flex-1 text-[11px] bg-[#0D4F6A]/10 text-[#0D4F6A] hover:bg-[#0D4F6A] hover:text-white" 
                  onClick={() => handleOpenEdit(p)}
                >
                  ✏️ Editar
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Profissional" : "Cadastrar Novo Profissional"}>
        <div className="space-y-4">
          <div className="relative">
            <Input 
              label="Nome Completo *" 
              placeholder="Nome do profissional" 
              value={newProf.name} 
              onChange={e => setNewProf({...newProf, name: e.target.value})} 
            />
            <span className="absolute right-0 top-0 text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1.5 mr-1">Obrigatório</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#33383D] mb-1">
                Especialidade Principal <span className="text-red-500 font-bold">*</span>
              </label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#0D4F6A] text-sm"
                value={newProf.expertise}
                onChange={e => setNewProf({...newProf, expertise: e.target.value})}
              >
                <option value="">Selecione...</option>
                <option value="Educação Física">Educação Física</option>
                <option value="Fisioterapia">Fisioterapia</option>
                <option value="Geriatria">Geriatria</option>
                <option value="Psicologia">Psicologia</option>
                <option value="Enfermagem">Enfermagem</option>
                <option value="Nutrição">Nutrição</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="relative">
              <Input 
                label="Registro Profissional *" 
                placeholder="Ex: CRM-SP 000000" 
                value={newProf.registroProfissional} 
                onChange={e => setNewProf({...newProf, registroProfissional: e.target.value})} 
              />
            </div>
          </div>

          <Input label="Área de Atuação Detalhada" placeholder="Ex: Musculação, Pilates, Reabilitação Cardíaca, etc." value={newProf.areaAtuacao} onChange={e => setNewProf({...newProf, areaAtuacao: e.target.value})} />

          {(newProf.expertise === 'Educação Física' || isEduFisica) && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-blue-800">Suporte Básico de Vida (SBV)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={newProf.sbvAtivo} 
                    onChange={e => setNewProf({...newProf, sbvAtivo: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D4F6A]"></div>
                </label>
              </div>
              
              {newProf.sbvAtivo && (
                <div className="animate-fade-in">
                  <Input 
                    label="Data de Vencimento do SBV" 
                    type="date" 
                    value={newProf.sbvVencimento} 
                    onChange={e => setNewProf({...newProf, sbvVencimento: e.target.value})} 
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefone" placeholder="(00) 00000-0000" value={newProf.phone} onChange={e => setNewProf({...newProf, phone: e.target.value})} />
            <Input label="E-mail" type="email" placeholder="email@exemplo.com" value={newProf.email} onChange={e => setNewProf({...newProf, email: e.target.value})} />
          </div>

          <div className="pt-4 flex gap-3">
            <Button className="flex-1" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" variant="primary" onClick={handleSave}>{editingId ? "Salvar Alterações" : "Salvar Registro"}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Histórico de Alterações">
        <div className="space-y-4">
          {selectedProfLogs.length === 0 ? (
            <p className="text-center py-8 text-gray-400 italic">Nenhum histórico disponível para este profissional.</p>
          ) : (
            <div className="space-y-3">
              {selectedProfLogs.sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map(log => (
                <div key={log.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={log.action === 'CREATE' ? 'success' : 'default'}>{log.action}</Badge>
                    <span className="text-[10px] text-gray-400 font-bold">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#33383D] mb-2">Realizado por: <span className="font-bold text-[#0D4F6A]">{log.changedByUserName}</span></p>
                  
                  {log.changes && (
                    <div className="mt-2 pl-3 border-l-2 border-[#2E9E6A] space-y-1">
                      {log.changes.map((c, i) => (
                        <p key={i} className="text-[10px] text-gray-500">
                          <span className="font-black uppercase">{c.field}:</span> {String(c.oldValue)} → <span className="font-bold text-[#2E9E6A]">{String(c.newValue)}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" className="w-full" onClick={() => setIsHistoryModalOpen(false)}>Fechar</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Professionals;
