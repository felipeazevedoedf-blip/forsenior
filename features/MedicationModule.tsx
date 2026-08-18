
import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, Input, Modal, Badge } from '../components/ui';
import { store } from '../services/store';
import { Medication, Patient, User, UserRole, MedicationLog, MedicationStatus } from '../types';
import { COLORS } from '../constants';

interface MedicationModuleProps {
  user: User;
  patientId?: string;
  onSelectPatient?: (id: string) => void;
}

const MedicationModule: React.FC<MedicationModuleProps> = ({ user, patientId: initialPatientId, onSelectPatient }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || '');

  useEffect(() => {
    setSelectedPatientId(initialPatientId || '');
  }, [initialPatientId]);

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    onSelectPatient?.(id);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [selectedLogToJustify, setSelectedLogToJustify] = useState<{med: Medication, time: string} | null>(null);
  const [justification, setJustification] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const patients = store.getPatients();
  const medications = useMemo(() => 
    selectedPatientId ? store.getMedications(selectedPatientId) : [], 
    [selectedPatientId, isModalOpen]
  );

  const today = new Date().toISOString().split('T')[0];
  const logs = useMemo(() => 
    selectedPatientId ? store.getMedicationLogs(selectedPatientId) : [], 
    [selectedPatientId, isModalOpen, isJustifyModalOpen]
  );

  const todayLogs = useMemo(() => logs.filter(l => l.date === today), [logs, today]);

  const adherenceStats = useMemo(() => {
    const relevantLogs = logs.filter(l => l.status !== 'snoozed');
    if (relevantLogs.length === 0) return { score: 100, taken: 0, missed: 0 };
    const taken = relevantLogs.filter(l => l.status === 'taken').length;
    const total = relevantLogs.length;
    return {
      score: Math.round((taken / total) * 100),
      taken,
      missed: total - taken
    };
  }, [logs]);

  const filteredMeds = useMemo(() => {
    return medications.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (viewMode === 'active' ? m.active : !m.active)
    );
  }, [medications, searchTerm, viewMode]);

  const handleAction = (med: Medication, time: string, status: MedicationStatus) => {
    if (status === 'missed') {
      setSelectedLogToJustify({ med, time });
      setIsJustifyModalOpen(true);
      return;
    }

    const now = new Date();
    store.addMedicationLog({
      id: `log-${Date.now()}`,
      medicationId: med.id,
      patientId: selectedPatientId,
      scheduledTime: time,
      actualTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      status,
      date: today
    });
  };

  const handleSaveJustification = () => {
    if (!selectedLogToJustify) return;
    store.addMedicationLog({
      id: `log-${Date.now()}`,
      medicationId: selectedLogToJustify.med.id,
      patientId: selectedPatientId,
      scheduledTime: selectedLogToJustify.time,
      status: 'missed',
      date: today
    });
    
    store.addTimelineEvent({
      id: `tl-miss-${Date.now()}`,
      patientId: selectedPatientId,
      clinicId: user.clinicId,
      type: 'MEDICATION_ADHERENCE',
      title: `Recusa: ${selectedLogToJustify.med.name}`,
      description: `Motivo: ${justification}`,
      timestamp: new Date().toISOString(),
      professionalName: user.name
    });

    setIsJustifyModalOpen(false);
    setSelectedLogToJustify(null);
    setJustification('');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-6xl mx-auto">
      {/* HEADER E FILTROS */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-textDark poppins tracking-tight">Farmacologia & Aderência</h2>
          <p className="text-gray-500 font-medium">Controle rigoroso e humanizado da rotina medicamentosa.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {!initialPatientId && (
            <select 
              className="flex-1 md:w-64 px-4 py-3 rounded-xl border border-gray-100 bg-white font-bold text-sm text-deepBlue shadow-sm outline-none focus:ring-2 focus:ring-deepBlue/10"
              value={selectedPatientId}
              onChange={e => handleSelectPatient(e.target.value)}
            >
              <option value="">Selecione o Paciente...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
            </select>
          )}
          <Button variant="primary" onClick={() => setIsModalOpen(true)} className="px-6">+ Novo</Button>
        </div>
      </header>

      {selectedPatientId ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* COLUNA ESQUERDA: STATUS E BUSCA */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="text-center p-8 bg-deepBlue text-white border-none shadow-xl">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Aderência Semanal</p>
               <div className="text-5xl font-black poppins mb-2">{adherenceStats.score}%</div>
               <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-4">
                 <div className="bg-vitalGreen h-full transition-all duration-1000" style={{ width: `${adherenceStats.score}%` }}></div>
               </div>
               <p className="text-[10px] font-bold mt-4 opacity-70">Calculado via Log ForSênior</p>
            </Card>

            <Card className="p-4 bg-gray-50/50 border-none">
              <Input 
                label="Buscar Medicamento" 
                placeholder="Ex: Losartana..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              <div className="flex flex-col gap-2 mt-4">
                 <button 
                  onClick={() => setViewMode('active')}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'active' ? 'bg-white text-deepBlue shadow-sm' : 'text-gray-400'}`}
                 >
                   ✅ Ativos ({medications.filter(m => m.active).length})
                 </button>
                 <button 
                  onClick={() => setViewMode('history')}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'history' ? 'bg-white text-deepBlue shadow-sm' : 'text-gray-400'}`}
                 >
                   📁 Histórico
                 </button>
              </div>
            </Card>
          </div>

          {/* COLUNA DIREITA: LISTA DE MEDICAMENTOS */}
          <div className="lg:col-span-3 space-y-6">
            {filteredMeds.length === 0 ? (
              <Card className="py-24 text-center border-dashed border-2 border-gray-100 bg-gray-50/30">
                <span className="text-5xl mb-4 block opacity-20">💊</span>
                <p className="font-bold text-gray-400 poppins">Nenhum medicamento encontrado para os filtros selecionados.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMeds.map(med => (
                  <Card key={med.id} className={`group hover:shadow-lg transition-all border-l-4 ${med.isHighAlert ? 'border-red-500 bg-red-50/10' : 'border-vitalGreen'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-deepBlue poppins text-lg">{med.name}</h3>
                        <p className="text-xs font-bold text-gray-400">{med.dosage} • {med.frequency}</p>
                      </div>
                      {med.isHighAlert && <Badge variant="error">ALTO ALERTA</Badge>}
                    </div>

                    <div className="space-y-3 mt-6">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Horários e Status Hoje</p>
                      <div className="flex flex-wrap gap-2">
                        {med.times.map(time => {
                          const log = todayLogs.find(l => l.medicationId === med.id && l.scheduledTime === time);
                          const isTaken = log?.status === 'taken';
                          const isMissed = log?.status === 'missed';
                          
                          return (
                            <div key={time} className="flex flex-col gap-1">
                              <div className={`px-3 py-1.5 rounded-lg border font-black text-xs transition-all flex items-center gap-2 ${
                                isTaken ? 'bg-vitalGreen text-white border-vitalGreen' : 
                                isMissed ? 'bg-red-50 text-red-600 border-red-100' : 
                                'bg-gray-50 text-gray-400 border-gray-100'
                              }`}>
                                {time}
                                {isTaken && <span>✓</span>}
                              </div>
                              {!isTaken && !isMissed && (
                                <div className="flex gap-1">
                                  <button onClick={() => handleAction(med, time, 'taken')} className="text-[9px] font-black text-vitalGreen hover:underline">TOMAR</button>
                                  <button onClick={() => handleAction(med, time, 'missed')} className="text-[9px] font-black text-red-400 hover:underline">FALHA</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                       <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">{med.route}</span>
                       <div className="flex gap-2">
                          <button className="text-xs text-gray-400 hover:text-deepBlue font-bold">Editar</button>
                       </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <Card className="py-32 text-center text-gray-400 flex flex-col items-center gap-4">
          <span className="text-6xl opacity-20">⚕️</span>
          <p className="font-bold poppins max-w-sm">Selecione um paciente para gerenciar o plano farmacológico.</p>
        </Card>
      )}

      {/* MODAL DE JUSTIFICATIVA */}
      <Modal isOpen={isJustifyModalOpen} onClose={() => setIsJustifyModalOpen(false)} title="Justificar Falha na Medicação">
        <div className="space-y-6">
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
             <p className="text-sm font-bold text-red-700">O Sr(a) Recusou a medicação?</p>
             <p className="text-xs text-red-600 mt-1">Sua resposta será anexada ao relatório clínico.</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
             {['Recusa do Paciente', 'Paciente Dormindo', 'Falta de Estoque', 'Nauseas/Vômitos', 'Outros'].map(opt => (
               <button 
                key={opt}
                onClick={() => setJustification(opt)}
                className={`w-full p-4 rounded-xl border-2 text-left text-sm font-bold transition-all ${justification === opt ? 'border-deepBlue bg-deepBlue/5 text-deepBlue' : 'border-gray-100 text-gray-400'}`}
               >
                 {opt}
               </button>
             ))}
          </div>
          <textarea 
            className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-deepBlue/10 text-sm"
            placeholder="Detalhes adicionais (opcional)..."
            value={justification}
            onChange={e => setJustification(e.target.value)}
          />
          <div className="flex gap-3 pt-4">
             <Button variant="ghost" className="flex-1" onClick={() => setIsJustifyModalOpen(false)}>Cancelar</Button>
             <Button variant="danger" className="flex-1" onClick={handleSaveJustification}>Confirmar Registro</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MedicationModule;
