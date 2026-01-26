
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Badge } from '../components/ui';
import { store } from '../services/store';
import { Appointment, AppointmentStatus, AppointmentServiceType, UserRole, User, Professional } from '../types';

interface ScheduleProps {
  user: User;
}

const Schedule: React.FC<ScheduleProps> = ({ user }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfId, setSelectedProfId] = useState<string>(user.role === UserRole.PROFESSIONAL ? user.id : '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [professionals] = useState(store.getProfessionals());
  const [patients] = useState(store.getPatients());
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);

  const [newApp, setNewApp] = useState<Partial<Appointment>>({
    patientId: '',
    type: 'Médico',
    status: AppointmentStatus.SCHEDULED,
    date: selectedDate,
    time: '08:00',
    duration: 60,
    notes: ''
  });

  useEffect(() => {
    refreshAppointments();
  }, [selectedProfId, selectedDate, user.role, user.id]);

  const refreshAppointments = () => {
    // Regra de Permissão: Se for profissional, filtra apenas os dele.
    const filterId = user.role === UserRole.PROFESSIONAL ? user.id : selectedProfId;
    const apps = store.getAppointments({ professionalId: filterId || undefined });
    setAppointments(apps);
  };

  const handleAddAppointment = () => {
    if (!newApp.patientId || !newApp.date || !newApp.time) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const patient = patients.find(p => p.id === newApp.patientId);
    // No cadastro, se for admin e não tiver selecionado profissional, impede.
    const professional = user.role === UserRole.PROFESSIONAL 
      ? professionals.find(p => p.id === user.id) || { name: user.name, id: user.id }
      : professionals.find(p => p.id === selectedProfId);

    if (!patient || !professional) {
      alert("Profissional ou paciente inválido.");
      return;
    }

    const app: Appointment = {
      ...newApp as Appointment,
      id: Math.random().toString(36).substr(2, 9),
      patientName: patient.nomeCompleto,
      professionalId: professional.id,
      professionalName: (professional as any).name || professional.name,
      createdAt: new Date().toISOString()
    };

    store.addAppointment(app);
    refreshAppointments();
    setIsModalOpen(false);
    
    // Simulação de Sincronização Google
    if (user.role === UserRole.PROFESSIONAL || user.role === UserRole.ADMIN) {
      console.log("Sincronizando com Google Agenda de forma anonimizada...");
    }
  };

  const handleUpdateStatus = (appId: string, status: AppointmentStatus) => {
    const app = appointments.find(a => a.id === appId);
    if (app) {
      store.updateAppointment({ ...app, status });
      refreshAppointments();
    }
  };

  const handleGoogleConnect = () => {
    setIsGoogleSyncing(true);
    setTimeout(() => {
      if (user.role === UserRole.PROFESSIONAL) {
        const prof = store.getProfessionalById(user.id);
        if (prof) {
          store.updateProfessional({ ...prof, googleConnected: true });
        }
      }
      setIsGoogleSyncing(false);
      alert("Google Agenda conectado! Seus atendimentos aparecerão anonimizados no calendário externo.");
    }, 1500);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.COMPLETED: return <Badge variant="success">REALIZADO</Badge>;
      case AppointmentStatus.ABSENT: return <Badge variant="error">FALTA</Badge>;
      case AppointmentStatus.RESCHEDULED: return <Badge variant="warning">REAGENDADO</Badge>;
      default: return <Badge variant="default">AGENDADO</Badge>;
    }
  };

  const filteredAppointments = appointments.filter(a => a.date === selectedDate);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0D4F6A] poppins">🗓️ Agenda Clínica</h2>
          <p className="text-gray-500">Gestão de atendimentos e registro de presença.</p>
        </div>
        <div className="flex gap-2">
          {user.role === UserRole.PROFESSIONAL && (
             <Button variant="ghost" onClick={handleGoogleConnect} disabled={isGoogleSyncing} className="bg-white border-blue-100 text-blue-600">
               {isGoogleSyncing ? "Conectando..." : "🔗 Google Calendar"}
             </Button>
          )}
          <Button onClick={() => setIsModalOpen(true)} variant="primary" className="shadow-lg shadow-blue-900/10">
            + Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Controles de Filtro */}
        <Card className="md:col-span-1 space-y-6 bg-white h-fit sticky top-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Selecione a Data</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold text-[#0D4F6A] focus:ring-2 focus:ring-[#0D4F6A] outline-none"
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)} 
            />
            <Button variant="ghost" className="w-full mt-2 text-xs font-bold" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>Hoje</Button>
          </div>

          {user.role === UserRole.ADMIN && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Filtrar Equipe</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold text-[#0D4F6A] focus:ring-2 focus:ring-[#0D4F6A] outline-none"
                value={selectedProfId}
                onChange={e => setSelectedProfId(e.target.value)}
              >
                <option value="">Todos Profissionais</option>
                {professionals.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Resumo do Dia</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Agendados</span>
                <span className="font-bold text-[#0D4F6A]">{filteredAppointments.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Realizados</span>
                <span className="font-bold text-[#2E9E6A]">{filteredAppointments.filter(a => a.status === AppointmentStatus.COMPLETED).length}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Lista de Atendimentos */}
        <div className="md:col-span-3 space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="text-5xl mb-4 opacity-20">📅</div>
              <h3 className="text-xl font-bold text-[#0D4F6A] poppins">Sem compromissos</h3>
              <p className="text-gray-400 mt-2">Nenhum atendimento registrado para {new Date(selectedDate + 'T12:00:00').toLocaleDateString()}.</p>
            </div>
          ) : (
            filteredAppointments.sort((a,b) => a.time.localeCompare(b.time)).map(app => (
              <div key={app.id} className="flex gap-6 group">
                <div className="w-16 pt-3 text-right">
                  <span className="text-lg font-black text-[#0D4F6A]">{app.time}</span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{app.duration} min</p>
                </div>
                <div className="flex-1">
                  <Card className="hover:shadow-xl transition-all border-l-4 border-[#0D4F6A] group-hover:translate-x-1 duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-[#0D4F6A] rounded-md uppercase tracking-wider">{app.type}</span>
                          {getStatusBadge(app.status)}
                        </div>
                        <h3 className="text-xl font-bold text-[#0D4F6A] poppins mb-1">{app.patientName}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                           <span className="flex items-center gap-1">👤 {app.professionalName}</span>
                           <span className="flex items-center gap-1">📝 {app.notes || 'Sem observações'}</span>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                        {app.status === AppointmentStatus.SCHEDULED && (
                          <>
                            <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleUpdateStatus(app.id, AppointmentStatus.COMPLETED)}>
                              Confirmar Presença
                            </Button>
                            <Button size="sm" variant="danger" className="flex-1" onClick={() => handleUpdateStatus(app.id, AppointmentStatus.ABSENT)}>
                              Registrar Falta
                            </Button>
                          </>
                        )}
                        {app.status !== AppointmentStatus.SCHEDULED && (
                          <Button size="sm" variant="ghost" className="w-full text-[10px] font-bold" onClick={() => handleUpdateStatus(app.id, AppointmentStatus.SCHEDULED)}>
                            Reabrir Agendamento
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agendar Novo Atendimento">
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 mb-2">
            <p className="text-[10px] text-yellow-800 font-bold leading-relaxed uppercase tracking-widest mb-1">🔒 Nota de Privacidade (LGPD)</p>
            <p className="text-xs text-yellow-700 font-medium">Os nomes dos pacientes e notas clínicas são criptografados. No Google Agenda, o evento aparecerá como "Atendimento ForSênior".</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#33383D] mb-1">Paciente</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0D4F6A] bg-white font-medium"
                value={newApp.patientId}
                onChange={e => setNewApp({...newApp, patientId: e.target.value})}
              >
                <option value="">Pesquisar paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.nomeCompleto}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Data" type="date" value={newApp.date} onChange={e => setNewApp({...newApp, date: e.target.value})} />
              <Input label="Horário" type="time" value={newApp.time} onChange={e => setNewApp({...newApp, time: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-bold text-[#33383D] mb-1">Serviço</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0D4F6A] bg-white font-medium"
                  value={newApp.type}
                  onChange={e => setNewApp({...newApp, type: e.target.value as AppointmentServiceType})}
                >
                  <option value="Avaliação">Avaliação Funcional</option>
                  <option value="Físio">Fisioterapia</option>
                  <option value="Cuidador">Cuidador / Acompanhamento</option>
                  <option value="Conversa">Conversa / Terapia</option>
                  <option value="Beleza">Beleza / Estética</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <Input label="Duração (minutos)" type="number" value={newApp.duration} onChange={e => setNewApp({...newApp, duration: parseInt(e.target.value)})} />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#33383D] mb-1">Observações Privadas</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0D4F6A] resize-none"
                rows={3}
                placeholder="Ex: Trazer kit de exercícios, paciente com dor leve..."
                value={newApp.notes}
                onChange={e => setNewApp({...newApp, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button className="flex-1" variant="ghost" onClick={() => setIsModalOpen(false)}>Descartar</Button>
            <Button className="flex-1 shadow-lg shadow-blue-900/10" variant="primary" onClick={handleAddAppointment}>Confirmar Horário</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Schedule;
