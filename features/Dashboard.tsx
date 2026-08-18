
import React, { useMemo } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { store } from '../services/store';
import { User, Patient, Medication, Appointment } from '../types';
import { analyticsService } from '../services/analytics';
import { COLORS } from '../constants';

interface DashboardProps {
  onNavigate: (path: string) => void;
  user: User;
  patientId: string;
  onSelectPatient: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user, patientId, onSelectPatient }) => {
  const patients = store.getPatients();
  const selectedPatientId = patientId;

  const selectedPatient = useMemo(() =>
    patients.find(p => p.id === selectedPatientId),
    [selectedPatientId, patients]
  );

  const today = new Date().toISOString().split('T')[0];
  
  const appointments = useMemo(() => 
    store.getAppointments({ patientId: selectedPatientId }).filter(a => a.date === today),
    [selectedPatientId, today]
  );

  const medications = useMemo(() => 
    store.getMedications(selectedPatientId),
    [selectedPatientId]
  );

  const todayLogs = useMemo(() => 
    store.getMedicationLogs(selectedPatientId, today),
    [selectedPatientId, today]
  );

  const lastTest = useMemo(() => {
    const tests = store.getTests(selectedPatientId);
    return tests.sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [selectedPatientId]);

  const analysis = useMemo(() => 
    selectedPatient ? analyticsService.performFullAnalysis(selectedPatient) : null,
    [selectedPatient, todayLogs]
  );

  const nextMedication = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const allTodayTimes: {time: string, med: Medication}[] = [];
    medications.forEach(m => m.times.forEach(t => allTodayTimes.push({time: t, med: m})));
    
    return allTodayTimes
      .sort((a, b) => a.time.localeCompare(b.time))
      .find(t => {
        const [h, m] = t.time.split(':').map(Number);
        return (h * 60 + m) > currentMinutes;
      });
  }, [medications]);

  if (patients.length === 0) {
    return <div className="p-10 text-center text-gray-400">Nenhum paciente cadastrado ainda. Cadastre um paciente em "Pacientes".</div>;
  }

  // Seção 5: nunca exibir um paciente como selecionado quando nenhum estiver — estado neutro explícito.
  if (!selectedPatient) {
    return (
      <Card className="py-24 text-center flex flex-col items-center gap-6 max-w-xl mx-auto mt-10 border-dashed border-2">
        <span className="text-5xl opacity-20">🧑‍🤝‍🧑</span>
        <div>
          <p className="text-lg font-bold text-textDark dark:text-slate-100 poppins">Nenhum paciente selecionado</p>
          <p className="text-sm text-gray-400 mt-1">Selecione um paciente para ver o resumo do dia.</p>
        </div>
        <select
          className="w-full max-w-xs px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-deepBlue dark:text-sky-400 outline-none shadow-sm"
          value=""
          onChange={(e) => onSelectPatient(e.target.value)}
        >
          <option value="">Selecionar paciente...</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
        </select>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-24">
      {/* HEADER: CONTEXTO E STATUS */}
      <header className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-deepBlue rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-deepBlue/20">
            {selectedPatient.nomeCompleto.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-textDark poppins">{selectedPatient.nomeCompleto}</h1>
              {analysis?.level === 'Alto' && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border-none outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                value={selectedPatientId}
                onChange={(e) => onSelectPatient(e.target.value)}
              >
                {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${analysis?.level === 'Alto' ? 'bg-red-500' : 'bg-vitalGreen'} animate-pulse`}></div>
                <span className="text-xs font-bold text-gray-500">
                  Status: {analysis?.level === 'Alto' ? 'Atenção Prioritária' : 'Monitoramento Estável'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="danger" size="sm" className="flex-1 md:flex-none uppercase text-[10px] tracking-widest font-black" onClick={() => onNavigate('emergency')}>
            Emergência
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 md:flex-none" onClick={() => onNavigate('patients')}>
            Prontuário
          </Button>
        </div>
      </header>

      {/* GRID DE CARDS OPERACIONAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        
        {/* CARD 1: AGENDA DO DIA */}
        <Card title="Agenda de Hoje" className="flex flex-col">
          <div className="space-y-3 flex-1">
            {appointments.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400 font-medium italic">Nenhum atendimento para hoje.</p>
              </div>
            ) : (
              appointments.map(app => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="text-center bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-sm font-black text-deepBlue">{app.time}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-textDark">{app.type}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{app.professionalName}</p>
                    </div>
                  </div>
                  <Badge variant="primary">Confirmado</Badge>
                </div>
              ))
            )}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-6 font-bold text-xs" onClick={() => onNavigate('schedule')}>
            Ver Agenda Completa
          </Button>
        </Card>

        {/* CARD 2: ROTINA DE MEDICAÇÃO */}
        <Card title="Medicação" className="flex flex-col">
          <div className="space-y-6 flex-1">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Progresso Diário</p>
                <p className="text-3xl font-black text-deepBlue">
                  {todayLogs.filter(l => l.status === 'taken').length} <span className="text-sm text-gray-300 font-medium">/ {medications.reduce((acc, m) => acc + m.times.length, 0)}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Próxima Dose</p>
                <p className="text-xl font-bold text-vitalGreen poppins">{nextMedication?.time || '--:--'}</p>
              </div>
            </div>

            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
               <div 
                className="h-full bg-vitalGreen transition-all duration-700" 
                style={{ width: `${(todayLogs.filter(l => l.status === 'taken').length / (medications.reduce((acc, m) => acc + m.times.length, 0) || 1)) * 100}%` }}
               ></div>
            </div>

            {nextMedication ? (
              <div className="p-4 bg-vitalGreen/5 border border-vitalGreen/20 rounded-2xl flex items-center gap-4 animate-fade-in">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">💊</div>
                <div>
                  <p className="text-sm font-bold text-textDark">{nextMedication.med.name}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{nextMedication.med.dosage} • {nextMedication.med.route}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <p className="text-xs text-gray-400 font-bold">Rotina finalizada por hoje.</p>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-6 font-bold text-xs" onClick={() => onNavigate('medications')}>
            Gerenciar Farmacologia
          </Button>
        </Card>

        {/* CARD 3: TESTES FUNCIONAIS */}
        <Card title="Última Avaliação Funcional" className="flex flex-col">
          <div className="flex-1 flex flex-col justify-center">
            {!lastTest ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400 italic">Nenhum teste registrado.</p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lastTest.type}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-6xl font-black text-deepBlue">{lastTest.value}</span>
                  <span className="text-xs font-bold text-gray-400 mb-2">pts</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-vitalGreen/10 text-vitalGreen px-3 py-1 rounded-full text-[10px] font-bold">
                  <span>📈</span> Evolução Estável (Ref: {new Date(lastTest.date).toLocaleDateString()})
                </div>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-6 font-bold text-xs" onClick={() => onNavigate('tests')}>
            Ver Evolução Visual
          </Button>
        </Card>

        {/* CARD 4: ALERTAS E INTELIGÊNCIA */}
        <Card title="Central de Alertas" className="flex flex-col bg-gray-50/50">
          <div className="space-y-3 flex-1">
            {analysis?.factors.length === 0 ? (
              <p className="text-center py-10 text-xs text-gray-400 italic">Nenhum alerta crítico ativo.</p>
            ) : (
              analysis?.factors.slice(0, 3).map((f, i) => (
                <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 ${f.points >= 5 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-white border-gray-100 text-textDark'}`}>
                   <span className="text-lg">{f.category === 'Medicação' ? '💊' : '⚠️'}</span>
                   <p className="text-[11px] font-bold leading-tight">{f.description}</p>
                </div>
              ))
            )}
          </div>
          <Button variant="primary" size="sm" className="w-full mt-6 font-bold text-xs bg-deepBlue text-white" onClick={() => onNavigate('safety')}>
            Diagnóstico de Risco
          </Button>
        </Card>

      </div>
      
      {/* FOOTER DISCRETO: EMERGENCY ACTION */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs px-4 md:hidden">
         <Button variant="danger" className="w-full h-14 rounded-full shadow-2xl flex items-center justify-center gap-3">
            <span className="text-2xl">🚨</span>
            <span className="font-black uppercase tracking-widest text-sm">Emergência</span>
         </Button>
      </footer>
    </div>
  );
};

export default Dashboard;
