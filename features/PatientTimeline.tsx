
import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Modal } from '../components/ui';
import { PatientTimelineEvent, TimelineEventType, User, UserRole } from '../types';
import { store } from '../services/store';

interface PatientTimelineProps {
  patientId: string;
  events: PatientTimelineEvent[];
  user: User;
  onRefresh: () => void;
}

const PatientTimeline: React.FC<PatientTimelineProps> = ({ patientId, events, user, onRefresh }) => {
  const [filterType, setFilterType] = useState<TimelineEventType | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newEvent, setNewEvent] = useState<Partial<PatientTimelineEvent>>({
    type: 'CLINICAL_NOTE',
    title: '',
    description: '',
  });

  const getEventStyle = (type: TimelineEventType) => {
    switch (type) {
      case 'REGISTRATION': return { icon: '🚀', color: 'bg-indigo-600', label: 'Admissão' };
      case 'FUNCTIONAL_TEST': return { icon: '📈', color: 'bg-green-600', label: 'Teste Clínico' };
      case 'MACRO_GOAL': return { icon: '🎯', color: 'bg-orange-600', label: 'Ciclo Maior' };
      case 'MICRO_GOAL': return { icon: '📌', color: 'bg-yellow-500', label: 'Etapa' };
      case 'ATTENDANCE': return { icon: '📅', color: 'bg-blue-600', label: 'Atendimento' };
      case 'CRITICAL_EVENT': return { icon: '🚨', color: 'bg-red-600', label: 'Intercorrência' };
      case 'LGPD_UPDATE': return { icon: '⚖️', color: 'bg-slate-800', label: 'Auditoria LGPD' };
      case 'DOCUMENT_UPLOAD': return { icon: '📁', color: 'bg-teal-600', label: 'Arquivo' };
      default: return { icon: '📝', color: 'bg-gray-500', label: 'Nota Técnica' };
    }
  };

  const filteredEvents = useMemo(() => {
    let list = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    
    if (filterType !== 'ALL') {
      list = list.filter(e => e.type === filterType);
    }
    
    if (startDate) {
      list = list.filter(e => e.timestamp >= startDate);
    }
    
    if (endDate) {
      list = list.filter(e => e.timestamp <= endDate + 'T23:59:59');
    }
    
    return list;
  }, [events, filterType, startDate, endDate]);

  const handleSaveManualEvent = () => {
    if (!newEvent.title || !newEvent.description) return;

    const event: PatientTimelineEvent = {
      id: `manual-${Date.now()}`,
      patientId,
      clinicId: user.clinicId,
      type: newEvent.type as TimelineEventType,
      title: newEvent.title,
      description: newEvent.description,
      timestamp: new Date().toISOString(),
      professionalName: user.name,
      professionalId: user.id
    };

    store.addTimelineEvent(event);
    setIsModalOpen(false);
    setNewEvent({ type: 'CLINICAL_NOTE', title: '', description: '' });
    onRefresh();
  };

  if (user.role === UserRole.VIEWER) {
    return (
      <div className="p-12 text-center bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col items-center gap-4">
        <span className="text-4xl">🔐</span>
        <h3 className="text-xl font-bold text-gray-400 poppins uppercase tracking-widest">Acesso Reservado</h3>
        <p className="text-gray-400 max-w-sm text-sm font-medium">
          A Linha do Tempo Cronológica contém dados técnicos de auditoria e evolução restritos à equipe multiprofissional.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Controles e Filtros */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <h3 className="text-sm font-black text-[#0D4F6A] uppercase tracking-widest">Explorador de Jornada</h3>
           <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
             + Registrar Intercorrência / Nota
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Filtrar por Tipo</label>
            <select 
              className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-xs font-bold text-[#0D4F6A] outline-none"
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
            >
              <option value="ALL">Todos os Eventos</option>
              <option value="FUNCTIONAL_TEST">Testes Clínicos</option>
              <option value="MACRO_GOAL">Ciclos Maiores</option>
              <option value="CRITICAL_EVENT">Intercorrências</option>
              <option value="ATTENDANCE">Presença/Faltas</option>
              <option value="LGPD_UPDATE">Segurança/LGPD</option>
              <option value="CLINICAL_NOTE">Notas Técnicas</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">De:</label>
            <input type="date" className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-xs font-bold" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Até:</label>
            <input type="date" className="w-full px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-xs font-bold" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Timeline Visual */}
      <div className="relative pl-8 md:pl-24 pr-4">
        {/* Linha Vertical com Gradiente */}
        <div className="absolute left-4 md:left-[4.5rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-[#0D4F6A] to-transparent opacity-20"></div>

        <div className="space-y-16">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20 text-gray-300 italic font-medium">Nenhum evento encontrado no período/filtro selecionado.</div>
          ) : (
            filteredEvents.map((event, idx) => {
              const style = getEventStyle(event.type);
              const date = new Date(event.timestamp);
              
              return (
                <div key={event.id} className="relative group">
                  {/* Marcador flutuante na linha */}
                  <div className={`absolute -left-10 md:-left-12 top-0 w-10 h-10 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white z-10 transition-all duration-300 group-hover:scale-125 ${style.color}`}>
                    <span className="text-lg">{style.icon}</span>
                  </div>

                  {/* Tag de Data Lateral */}
                  <div className="absolute -left-10 md:-left-44 top-1 md:w-28 md:text-right hidden md:block">
                    <p className="text-[11px] font-black text-[#0D4F6A] uppercase tracking-tighter leading-none">{date.toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>

                  {/* Card do Evento */}
                  <Card className={`border-none shadow-sm hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-1 overflow-visible ${event.type === 'CRITICAL_EVENT' ? 'bg-red-50/30 ring-1 ring-red-100' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-3">
                       <div>
                         <Badge variant={event.type === 'CRITICAL_EVENT' ? 'error' : 'default'}>{style.label}</Badge>
                         <h4 className="text-lg font-black text-[#0D4F6A] poppins mt-1 leading-tight">{event.title}</h4>
                       </div>
                       <div className="text-right md:hidden">
                          <p className="text-[9px] font-black text-gray-400 uppercase">{date.toLocaleDateString()}</p>
                       </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed font-medium mb-6">
                      {event.description}
                    </p>
                    
                    <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-50 mt-auto">
                      <div className="flex items-center gap-2">
                         <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs grayscale">👤</div>
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">Profissional</span>
                            <span className="text-[10px] font-bold text-gray-500">{event.professionalName || 'Registro Automático'}</span>
                         </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {event.referenceId && (
                           <button className="text-[9px] font-black uppercase text-indigo-600 hover:underline">Ver Referência</button>
                        )}
                        <span className="text-[8px] font-black text-gray-200 uppercase tracking-[0.2em]">SaaS-Audit: {event.id.split('-').pop()}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal para Registro Manual */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Evento Cronológico">
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-2">
            <p className="text-[10px] text-blue-800 font-black uppercase tracking-widest mb-1">Nota de Auditoria</p>
            <p className="text-xs text-blue-700 font-medium">Eventos registrados aqui impactam diretamente a análise de evolução do paciente e ficam marcados com sua assinatura digital.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tipo de Evento</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setNewEvent({...newEvent, type: 'CLINICAL_NOTE'})}
                  className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${newEvent.type === 'CLINICAL_NOTE' ? 'border-[#0D4F6A] bg-[#0D4F6A]/5 text-[#0D4F6A]' : 'border-gray-50 text-gray-400'}`}
                >
                  📝 Nota Técnica
                </button>
                <button 
                  onClick={() => setNewEvent({...newEvent, type: 'CRITICAL_EVENT'})}
                  className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${newEvent.type === 'CRITICAL_EVENT' ? 'border-red-600 bg-red-50 text-red-600' : 'border-gray-50 text-gray-400'}`}
                >
                  🚨 Intercorrência
                </button>
              </div>
            </div>

            <Input 
              label="Título do Evento" 
              placeholder="Ex: Queda da própria altura no quarto" 
              value={newEvent.title}
              onChange={e => setNewEvent({...newEvent, title: e.target.value})}
            />

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Detalhamento Clínico</label>
              <textarea 
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0D4F6A] text-sm min-h-[120px]"
                placeholder="Descreva o ocorrido, condutas tomadas e observações de saúde..."
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" className="flex-1 shadow-lg shadow-blue-900/10" onClick={handleSaveManualEvent}>Registrar na Timeline</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientTimeline;
