
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, Modal } from '../components/ui';
import { IconTarget, IconAward, IconEdit, IconFlag } from '../components/icons';
import { store } from '../services/store';
import { MacroGoal, MicroGoal, MacroGoalStatus, MicroGoalStatus, User, UserRole, Patient, Professional } from '../types';

interface DemandsProps {
  user: User;
}

const Demands: React.FC<DemandsProps> = ({ user }) => {
  const [macroGoals, setMacroGoals] = useState<MacroGoal[]>(store.getMacroGoals());
  const [microGoals, setMicroGoals] = useState<MicroGoal[]>(store.getMicroGoals());
  const [patients] = useState<Patient[]>(store.getPatients());
  const [professionals] = useState<Professional[]>(store.getProfessionals());
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
  const [isMicroModalOpen, setIsMicroModalOpen] = useState(false);
  const [editingMacro, setEditingMacro] = useState<MacroGoal | null>(null);
  const [activeMacroId, setActiveMacroId] = useState<string | null>(null);

  const [macroForm, setMacroForm] = useState<Partial<MacroGoal>>({
    title: '',
    description: '',
    justification: '',
    startDate: new Date().toISOString().split('T')[0],
    reEvaluationDate: '',
    status: 'Planejado'
  });

  const [microForm, setMicroForm] = useState<Partial<MicroGoal>>({
    title: '',
    durationWeeks: 1,
    successCriteria: '',
    actions: '',
    status: 'Planejado'
  });

  const refreshData = () => {
    setMacroGoals(store.getMacroGoals(selectedPatientId || undefined));
    setMicroGoals(store.getMicroGoals());
  };

  useEffect(() => {
    refreshData();
  }, [selectedPatientId]);

  const handleSaveMacro = () => {
    if (!macroForm.title || !selectedPatientId) return;

    const prof = professionals.find(p => p.id === user.id) || professionals[0];

    const goal: MacroGoal = {
      ...macroForm as MacroGoal,
      id: editingMacro?.id || `macro-${Date.now()}`,
      clinicId: user.clinicId,
      patientId: selectedPatientId,
      professionalId: prof.id,
      professionalName: prof.name,
      createdAt: editingMacro?.createdAt || new Date().toISOString(),
      status: macroForm.status as MacroGoalStatus
    };

    if (editingMacro) {
      store.updateMacroGoal(goal);
    } else {
      store.addMacroGoal(goal);
    }

    setIsMacroModalOpen(false);
    setEditingMacro(null);
    setMacroForm({ title: '', description: '', justification: '', startDate: new Date().toISOString().split('T')[0], reEvaluationDate: '', status: 'Planejado' });
    refreshData();
  };

  const handleSaveMicro = () => {
    if (!microForm.title || !activeMacroId) return;

    const prof = professionals.find(p => p.id === user.id) || professionals[0];

    const goal: MicroGoal = {
      ...microForm as MicroGoal,
      id: `micro-${Date.now()}`,
      macroGoalId: activeMacroId,
      professionalId: prof.id,
      professionalName: prof.name,
      createdAt: new Date().toISOString(),
      status: microForm.status as MicroGoalStatus
    };

    store.addMicroGoal(goal);
    setIsMicroModalOpen(false);
    setMicroForm({ title: '', durationWeeks: 1, successCriteria: '', actions: '', status: 'Planejado' });
    refreshData();
  };

  const updateMicroStatus = (micro: MicroGoal, nextStatus: MicroGoalStatus) => {
    store.updateMicroGoal({ ...micro, status: nextStatus });
    refreshData();
  };

  const updateMacroStatus = (macro: MacroGoal, nextStatus: MacroGoalStatus) => {
    store.updateMacroGoal({ ...macro, status: nextStatus });
    refreshData();
  };

  const getMacroStatusBadge = (status: MacroGoalStatus) => {
    switch (status) {
      case 'Planejado': return <Badge variant="default">PLANEJADO</Badge>;
      case 'Em andamento': return <Badge variant="warning">EM ANDAMENTO</Badge>;
      case 'Concluído': return <Badge variant="success">CONCLUÍDO</Badge>;
      case 'Reavaliado': return <Badge variant="error">REAVALIADO</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0D4F6A] poppins flex items-center gap-2"><IconTarget className="w-6 h-6" /> Periodização Clínica</h2>
          <p className="text-gray-500 font-medium">Ciclos Maiores (Macros) e Microciclos (Etapas).</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            className="flex-1 md:w-64 px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0D4F6A] bg-white font-bold text-sm text-[#0D4F6A]"
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
          >
            <option value="">Filtrar por Paciente...</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
          </select>
          {user.role !== UserRole.VIEWER && (
            <Button onClick={() => { setEditingMacro(null); setIsMacroModalOpen(true); }} variant="primary" size="sm">
              + Novo Ciclo Maior
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {macroGoals.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
            <IconAward className="w-12 h-12 mb-4 mx-auto text-[#0D4F6A]/30" />
            <p className="text-gray-400 font-bold poppins">Inicie definindo um Ciclo Maior para este paciente.</p>
          </div>
        ) : (
          macroGoals.map(macro => {
            const patient = patients.find(p => p.id === macro.patientId);
            const macrosMicros = microGoals.filter(m => m.macroGoalId === macro.id);
            const progress = macrosMicros.length > 0 
              ? (macrosMicros.filter(m => m.status === 'Atingido').length / macrosMicros.length) * 100 
              : 0;

            return (
              <Card key={macro.id} className="border-l-8 border-[#0D4F6A] overflow-visible shadow-lg">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <Badge variant="default">{patient?.nomeCompleto}</Badge>
                           {getMacroStatusBadge(macro.status)}
                        </div>
                        <h3 className="text-xl font-black text-[#0D4F6A] poppins">{macro.title}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prof. Resp.</p>
                        <p className="text-xs font-bold text-[#2E9E6A]">{macro.professionalName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Quadro Clínico</p>
                        <p className="text-sm text-gray-600 leading-tight italic">"{macro.description}"</p>
                      </div>
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Justificativa Funcional</p>
                        <p className="text-sm text-blue-900 font-medium leading-tight">{macro.justification}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
                          <span>Aderência ao Plano</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-[#0D4F6A]'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 space-y-0.5">
                        <p>INÍCIO: {new Date(macro.startDate).toLocaleDateString()}</p>
                        <p>REAVALIAÇÃO: <span className="text-red-500 font-black">{new Date(macro.reEvaluationDate).toLocaleDateString()}</span></p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-50">
                       <Button size="sm" variant="ghost" onClick={() => { setActiveMacroId(macro.id); setIsMicroModalOpen(true); }} className="text-[10px]">
                         + Add Microciclo
                       </Button>
                       <Button size="sm" variant="ghost" onClick={() => { setMacroForm(macro); setEditingMacro(macro); setIsMacroModalOpen(true); }} className="text-[10px] gap-1">
                         <IconEdit className="w-3 h-3" /> Editar Macro
                       </Button>
                       <div className="flex-1"></div>
                       <select 
                        className="text-[10px] font-black uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-gray-200 outline-none cursor-pointer"
                        value={macro.status}
                        onChange={(e) => updateMacroStatus(macro, e.target.value as MacroGoalStatus)}
                       >
                         {Object.values(MacroGoalStatus).map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="w-full lg:w-96 space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <span className="flex items-center gap-1.5"><IconFlag className="w-3.5 h-3.5" /> Microciclos (1-2 semanas)</span>
                      <span className="w-5 h-5 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[8px] font-bold text-[#0D4F6A]">{macrosMicros.length}</span>
                    </h4>
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {macrosMicros.map(micro => (
                        <div key={micro.id} className={`p-3 rounded-xl border-2 transition-all ${micro.status === 'Atingido' ? 'bg-green-50/50 border-green-200 shadow-none' : 'bg-white border-white shadow-sm'}`}>
                          <div className="flex justify-between items-start mb-2">
                             <h5 className="text-xs font-bold text-[#0D4F6A] truncate flex-1 pr-2">{micro.title}</h5>
                             <Badge variant={micro.status === 'Atingido' ? 'success' : micro.status === 'Não atingido' ? 'error' : 'default'}>
                               {micro.status === 'Atingido' ? 'OK' : micro.status === 'Planejado' ? 'PLN' : micro.status === 'Em execução' ? 'EXE' : 'AJU'}
                             </Badge>
                          </div>
                          
                          <p className="text-[10px] text-gray-500 leading-tight mb-3">
                            <span className="font-black">Sucesso:</span> {micro.successCriteria}
                          </p>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => updateMicroStatus(micro, 'Planejado')}
                                className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase border transition-all ${micro.status === 'Planejado' ? 'bg-[#0D4F6A] text-white' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                              >
                                Planejar
                              </button>
                              <button 
                                onClick={() => updateMicroStatus(micro, 'Em execução')}
                                className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase border transition-all ${micro.status === 'Em execução' ? 'bg-amber-500 text-white' : 'bg-white text-amber-500 border-amber-100 hover:bg-amber-50'}`}
                              >
                                Executar
                              </button>
                              <button 
                                onClick={() => updateMicroStatus(micro, 'Atingido')}
                                className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase border transition-all ${micro.status === 'Atingido' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'}`}
                              >
                                Atingir
                              </button>
                            </div>
                            <button 
                              onClick={() => updateMicroStatus(micro, 'Não atingido')}
                              className={`w-full py-1 rounded-md text-[8px] font-black uppercase border transition-all ${micro.status === 'Não atingido' ? 'bg-red-500 text-white' : 'bg-white text-red-400 border-red-100 hover:bg-red-50'}`}
                            >
                              Não Atingido / Ajustar
                            </button>
                          </div>
                        </div>
                      ))}
                      {macrosMicros.length === 0 && (
                        <p className="text-center py-8 text-[10px] text-gray-400 italic bg-white rounded-xl border border-dashed border-gray-200">Sem microciclos definidos.</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Macro */}
      <Modal isOpen={isMacroModalOpen} onClose={() => setIsMacroModalOpen(false)} title={editingMacro ? "Editar Ciclo Maior" : "Configurar Novo Ciclo Maior (8-12 semanas)"}>
        <div className="space-y-4">
          <Input label="Título do Ciclo Maior" value={macroForm.title} onChange={e => setMacroForm({...macroForm, title: e.target.value})} placeholder="Ex: Ganho de Força e Mobilidade AVD" />
          <div className="grid grid-cols-2 gap-4">
             <Input label="Data de Início" type="date" value={macroForm.startDate} onChange={e => setMacroForm({...macroForm, startDate: e.target.value})} />
             <Input label="Previsão de Reavaliação" type="date" value={macroForm.reEvaluationDate} onChange={e => setMacroForm({...macroForm, reEvaluationDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Descrição do Quadro Clínico</label>
            <textarea 
              className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#0D4F6A] text-sm transition-all"
              rows={2}
              value={macroForm.description}
              onChange={e => setMacroForm({...macroForm, description: e.target.value})}
              placeholder="Descreva o status funcional atual do paciente..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Justificativa Funcional</label>
            <textarea 
              className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#0D4F6A] text-sm transition-all"
              rows={2}
              value={macroForm.justification}
              onChange={e => setMacroForm({...macroForm, justification: e.target.value})}
              placeholder="Por que esta intervenção é prioritária para a autonomia?"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Status do Ciclo</label>
            <select 
              className="w-full p-4 rounded-xl border border-gray-200 bg-white font-bold text-sm outline-none shadow-sm"
              value={macroForm.status}
              onChange={e => setMacroForm({...macroForm, status: e.target.value as MacroGoalStatus})}
            >
              {Object.values(MacroGoalStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="pt-4 flex gap-4">
             <Button variant="ghost" className="flex-1" onClick={() => setIsMacroModalOpen(false)}>Descartar</Button>
             <Button variant="primary" className="flex-1 shadow-xl" onClick={handleSaveMacro}>Salvar Periodização</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Micro */}
      <Modal isOpen={isMicroModalOpen} onClose={() => setIsMicroModalOpen(false)} title="Configurar Microciclo (Etapa)">
        <div className="space-y-4">
          <Input label="Objetivo do Microciclo" value={microForm.title} onChange={e => setMicroForm({...microForm, title: e.target.value})} placeholder="Ex: Treino de Equilíbrio Unipodal" />
          <div className="grid grid-cols-2 gap-4">
             <Input label="Duração (Semanas)" type="number" value={microForm.durationWeeks} onChange={e => setMicroForm({...microForm, durationWeeks: parseInt(e.target.value)})} />
             <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Status Inicial</label>
              <select 
                className="w-full p-4 rounded-xl border border-gray-200 bg-white font-bold text-sm outline-none shadow-sm"
                value={microForm.status}
                onChange={e => setMicroForm({...microForm, status: e.target.value as MicroGoalStatus})}
              >
                {Object.values(MicroGoalStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Critério de Sucesso (KPI)</label>
            <textarea 
              className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#0D4F6A] text-sm"
              rows={2}
              value={microForm.successCriteria}
              onChange={e => setMicroForm({...microForm, successCriteria: e.target.value})}
              placeholder="Ex: Permanecer 15s sem apoio externo."
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1 tracking-widest">Condutas e Exercícios</label>
            <textarea 
              className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-[#0D4F6A] text-sm"
              rows={2}
              value={microForm.actions}
              onChange={e => setMicroForm({...microForm, actions: e.target.value})}
              placeholder="Descreva as ações terapêuticas..."
            />
          </div>
          <div className="pt-4 flex gap-4">
             <Button variant="ghost" className="flex-1" onClick={() => setIsMicroModalOpen(false)}>Cancelar</Button>
             <Button variant="primary" className="flex-1 shadow-xl" onClick={handleSaveMicro}>Criar Etapa</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Demands;
