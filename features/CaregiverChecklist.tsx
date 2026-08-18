
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { IconClipboardList, IconEdit, IconCheck } from '../components/icons';
import { store } from '../services/store';
import { CareTask, Patient, User, CareTaskStatus } from '../types';

interface CaregiverChecklistProps {
  user: User;
}

const CaregiverChecklist: React.FC<CaregiverChecklistProps> = ({ user }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const patients = store.getPatients();

  useEffect(() => {
    if (selectedPatientId) {
      const pTasks = store.getCareTasks(selectedPatientId);
      if (pTasks.length === 0) {
        // Mock inicial para demonstração
        const initialTasks: CareTask[] = [
          { id: 't1', patientId: selectedPatientId, title: 'Medicação Hipertensão', time: '08:00', category: 'Medicação', status: 'pending' },
          { id: 't2', patientId: selectedPatientId, title: 'Banho e Higiene', time: '09:30', category: 'Higiene', status: 'pending' },
          { id: 't3', patientId: selectedPatientId, title: 'Caminhada Assistida', time: '16:00', category: 'Mobilidade', status: 'pending' },
        ];
        initialTasks.forEach(t => store.addCareTask(t));
        setTasks(initialTasks);
      } else {
        setTasks(pTasks);
      }
    }
  }, [selectedPatientId]);

  const handleToggle = (task: CareTask) => {
    // Fix: Cast nextStatus and updated object to ensure compatibility with CareTask type
    const nextStatus: CareTaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updated: CareTask = { ...task, status: nextStatus, performedBy: user.name };
    store.updateCareTask(updated);
    setTasks(tasks.map(t => t.id === task.id ? updated : t));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0D4F6A] poppins flex items-center gap-2"><IconClipboardList className="w-6 h-6" /> Rotina Diária</h2>
          <p className="text-gray-500">Checklist de cuidados e atividades essenciais.</p>
        </div>
        <select 
          className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0D4F6A] bg-white font-bold text-sm"
          value={selectedPatientId}
          onChange={e => setSelectedPatientId(e.target.value)}
        >
          <option value="">Selecione o Paciente...</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
        </select>
      </div>

      {!selectedPatientId ? (
        <Card className="py-20 text-center text-gray-400">
          <IconEdit className="w-12 h-12 mb-4 mx-auto" />
          <p className="font-bold poppins">Selecione um paciente para ver sua rotina.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Tarefas do Dia">
            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => handleToggle(task)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    task.status === 'completed' 
                      ? 'bg-green-50 border-green-100 opacity-70' 
                      : 'bg-white border-gray-100 hover:border-[#0D4F6A]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.status === 'completed' ? 'bg-[#2E9E6A] border-[#2E9E6A]' : 'border-gray-200'
                    }`}>
                      {task.status === 'completed' && <IconCheck className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${task.status === 'completed' ? 'text-green-800 line-through' : 'text-[#33383D]'}`}>
                        {task.title}
                      </p>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-[10px] font-black text-[#0D4F6A]">{task.time}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{task.category}</span>
                      </div>
                    </div>
                  </div>
                  {task.status === 'completed' && (
                    <span className="text-[9px] font-bold text-green-600 uppercase">Feito por {task.performedBy?.split(' ')[0]}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Resumo da Assistência">
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <span className="text-sm font-bold text-gray-500">Progresso do Dia</span>
                 <span className="text-xl font-black text-[#0D4F6A]">
                   {Math.round((tasks.filter(t => t.status === 'completed').length / (tasks.length || 1)) * 100)}%
                 </span>
               </div>
               <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                 <div 
                   className="bg-[#2E9E6A] h-full transition-all duration-1000" 
                   style={{ width: `${(tasks.filter(t => t.status === 'completed').length / (tasks.length || 1)) * 100}%` }}
                 ></div>
               </div>
               
               <div className="pt-6 border-t space-y-4">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observações de Plantão</h4>
                 <textarea 
                   className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-[#0D4F6A] text-sm"
                   rows={4}
                   placeholder="Registre intercorrências, humor ou aceitação alimentar..."
                 />
                 <Button className="w-full">Salvar Observações</Button>
               </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CaregiverChecklist;