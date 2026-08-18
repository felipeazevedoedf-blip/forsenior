
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge, Modal, Input } from '../components/ui';
import { store } from '../services/store';
import { Patient, User, UserRole, PatientTimelineEvent, ClinicalReport } from '../types';
import { securityService } from '../services/security';
import PatientTimeline from './PatientTimeline';
import PatientClinicalOverview from './PatientClinicalOverview';
import MedicationModule from './MedicationModule';

const PatientDetail: React.FC<{ patientId: string, user: User, onBack: () => void, onNavigateToReport: (type: any) => void }> = ({ patientId, user, onBack, onNavigateToReport }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'info' | 'meds' | 'demands' | 'docs' | 'family'>('overview');
  const [patient, setPatient] = useState<Patient | undefined>(store.getPatientById(patientId));
  const [timelineEvents, setTimelineEvents] = useState<PatientTimelineEvent[]>(store.getTimelineEvents(patientId));
  const [reports, setReports] = useState<ClinicalReport[]>(store.getReports(patientId));

  const vitals = store.getVitalSigns(patientId);
  const tests = store.getTests(patientId);

  useEffect(() => {
    if (patient) {
      securityService.logAccess(user, 'Visualizou Prontuário Detalhado', patient.id);
      setReports(store.getReports(patientId));
      setTimelineEvents(store.getTimelineEvents(patientId));
    }
  }, [patientId, activeTab]);

  if (!patient) return <div>Paciente não encontrado.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-[#0D4F6A] dark:text-sky-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#0D4F6A] dark:text-sky-400 poppins">{patient.nomeCompleto}</h2>
            <div className="flex items-center gap-2">
              <Badge variant={patient.consentimentoLGPD ? 'success' : 'error'}>{patient.consentimentoLGPD ? 'LGPD OK' : 'PENDENTE'}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto gap-4">
        {[
          { id: 'overview', label: 'Visão 360º', icon: '👁️', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER] },
          { id: 'meds', label: 'Medicamentos', icon: '💊', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER] },
          { id: 'timeline', label: 'Histórico', icon: '🕒', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] },
          { id: 'info', label: 'Informações', icon: '👤', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL, UserRole.VIEWER] },
          { id: 'docs', label: 'Arquivos', icon: '📁', roles: [UserRole.ADMIN, UserRole.PROFESSIONAL] }
        ].filter(tab => tab.roles.includes(user.role)).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-bold text-sm whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
              activeTab === tab.id ? 'border-[#0D4F6A] text-[#0D4F6A] dark:text-sky-400 dark:border-sky-400' : 'border-transparent text-gray-400'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 pb-20">
        {activeTab === 'overview' && (
          <PatientClinicalOverview 
            patient={patient} 
            vitals={vitals} 
            tests={tests} 
            user={user}
            onNavigateToReport={onNavigateToReport}
          />
        )}

        {activeTab === 'meds' && (
          <MedicationModule user={user} patientId={patientId} />
        )}

        {activeTab === 'timeline' && (
           <PatientTimeline 
             patientId={patientId} 
             events={timelineEvents} 
             user={user} 
             onRefresh={() => setTimelineEvents(store.getTimelineEvents(patientId))} 
           />
        )}

        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Dados Pessoais">
               <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-50 dark:border-slate-700 pb-2">
                    <span className="text-xs text-gray-400 font-bold uppercase">Nascimento</span>
                    <span className="text-sm font-bold text-textDark dark:text-slate-200">{new Date(patient.dataNascimento).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 dark:border-slate-700 pb-2">
                    <span className="text-xs text-gray-400 font-bold uppercase">Sexo</span>
                    <span className="text-sm font-bold text-textDark dark:text-slate-200">{patient.sexo || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 dark:border-slate-700 pb-2">
                    <span className="text-xs text-gray-400 font-bold uppercase">Tipo Sanguíneo</span>
                    <Badge variant="primary">{patient.bloodType || '--'}</Badge>
                  </div>
               </div>
            </Card>
            <Card title="Contatos de Emergência">
              <div className="space-y-4">
                  <div className="flex flex-col gap-1 border-b border-gray-50 dark:border-slate-700 pb-2">
                    <span className="text-[10px] text-gray-400 font-black uppercase">Responsável Direto</span>
                    <span className="text-sm font-bold text-textDark dark:text-slate-200">{patient.nomeResponsavel}</span>
                    <span className="text-xs text-deepBlue dark:text-sky-400 font-medium">{patient.telefoneResponsavel}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 font-black uppercase">Emergência Alternativa</span>
                    <span className="text-sm font-bold text-textDark dark:text-slate-200">{patient.contatoEmergencia}</span>
                  </div>
               </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const PatientList: React.FC<{ user: User, onNavigate: (path: string) => void, onSelectPatient?: (id: string) => void }> = ({ user, onNavigate, onSelectPatient }) => {
  const [patients, setPatients] = useState<Patient[]>(store.getPatients());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const openPatient = (id: string) => {
    setSelectedPatientId(id);
    onSelectPatient?.(id);
  };
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    nomeCompleto: '',
    dataNascimento: '',
    cpf: '',
    sexo: 'Feminino',
    nomeResponsavel: '',
    telefoneResponsavel: '',
    endereco: '',
    pathologies: [],
    consentimentoLGPD: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!newPatient.nomeCompleto?.trim()) {
      newErrors.nomeCompleto = 'O Nome Completo é obrigatório para identificação clínica.';
    }
    if (!newPatient.dataNascimento) {
      newErrors.dataNascimento = 'A Data de Nascimento é essencial para o cálculo de fragilidade.';
    }
    if (!newPatient.cpf?.trim()) {
      newErrors.cpf = 'O CPF é obrigatório para conformidade com a LGPD.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPatient = () => {
    if (!validate()) return;

    const patient: Patient = {
      ...newPatient as Patient,
      id: `p-${Date.now()}`,
      clinicId: user.clinicId,
      createdAt: new Date().toISOString(),
      attachments: [],
      condicoesClinicasGerais: '',
      observacoesGerais: '',
      profissionalResponsavel: user.name,
      contatoEmergencia: ''
    };

    store.addPatient(patient);
    
    store.addTimelineEvent({
      id: `tl-reg-${Date.now()}`,
      patientId: patient.id,
      clinicId: user.clinicId,
      type: 'REGISTRATION',
      title: 'Admissão de Paciente',
      description: `Paciente ${patient.nomeCompleto} admitido no sistema pela clínica ForSênior.`,
      timestamp: new Date().toISOString(),
      professionalName: user.name
    });

    setPatients(store.getPatients());
    setIsAddModalOpen(false);
    setNewPatient({ nomeCompleto: '', dataNascimento: '', cpf: '', sexo: 'Feminino', pathologies: [], consentimentoLGPD: true });
    setErrors({});
  };

  const filtered = patients.filter(p => 
    p.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpf.includes(searchTerm)
  );

  if (selectedPatientId) {
    return <PatientDetail patientId={selectedPatientId} user={user} onBack={() => setSelectedPatientId(null)} onNavigateToReport={onNavigate} />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-textDark dark:text-slate-100 poppins tracking-tight">Prontuário de Pacientes</h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium">Gestão centralizada de dados clínicos e administrativos.</p>
        </div>
        {user.role !== UserRole.VIEWER && (
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto shadow-xl shadow-deepBlue/10">
            + Admitir Novo Paciente
          </Button>
        )}
      </header>

      <div className="relative">
        <input 
          type="text"
          placeholder="Buscar por nome ou CPF..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 font-medium text-sm outline-none shadow-sm focus:ring-2 focus:ring-deepBlue/10 dark:text-slate-200"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <svg className="w-6 h-6 absolute left-4 top-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <Card key={p.id} className="hover:shadow-xl transition-all border-l-4 border-deepBlue dark:border-sky-500 cursor-pointer" onClick={() => openPatient(p.id)}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-deepBlue dark:text-sky-400 font-black text-xl">
                {p.nomeCompleto.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-deepBlue dark:text-sky-400 poppins truncate max-w-[180px]">{p.nomeCompleto}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.pathologies[0] || 'Sem patologia registrada'}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {p.pathologies.slice(0, 3).map(path => <Badge key={path} variant="default">{path}</Badge>)}
              {p.pathologies.length > 3 && <Badge variant="default">+{p.pathologies.length - 3}</Badge>}
            </div>

            <div className="pt-4 border-t border-gray-50 dark:border-slate-700 flex justify-between items-center">
               <span className="text-[10px] text-gray-400 font-bold uppercase">Resp: {p.profissionalResponsavel.split(' ')[0]}</span>
               <Button size="sm" variant="ghost" className="text-[10px] font-black uppercase tracking-widest">Abrir Prontuário</Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400 border-2 border-dashed rounded-3xl">
             Nenhum paciente encontrado.
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Admissão de Paciente (LGPD)">
        <div className="space-y-4">
          <Input 
            label="Nome Completo *" 
            placeholder="Ex: João da Silva Sauro" 
            required
            value={newPatient.nomeCompleto} 
            error={errors.nomeCompleto}
            onChange={e => {
              setNewPatient({...newPatient, nomeCompleto: e.target.value});
              if(errors.nomeCompleto) setErrors({...errors, nomeCompleto: ''});
            }} 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Data de Nascimento *" 
              type="date" 
              required
              value={newPatient.dataNascimento} 
              error={errors.dataNascimento}
              onChange={e => {
                setNewPatient({...newPatient, dataNascimento: e.target.value});
                if(errors.dataNascimento) setErrors({...errors, dataNascimento: ''});
              }} 
            />
            <Input 
              label="CPF *" 
              placeholder="000.000.000-00" 
              required
              value={newPatient.cpf} 
              error={errors.cpf}
              onChange={e => {
                setNewPatient({...newPatient, cpf: e.target.value});
                if(errors.cpf) setErrors({...errors, cpf: ''});
              }} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Responsável" placeholder="Nome do familiar" value={newPatient.nomeResponsavel} onChange={e => setNewPatient({...newPatient, nomeResponsavel: e.target.value})} />
            <Input label="Telefone Responsável" placeholder="(00) 00000-0000" value={newPatient.telefoneResponsavel} onChange={e => setNewPatient({...newPatient, telefoneResponsavel: e.target.value})} />
          </div>

          <Input label="Endereço Residencial" placeholder="Rua, Número, Bairro, Cidade - UF" value={newPatient.endereco} onChange={e => setNewPatient({...newPatient, endereco: e.target.value})} />

          <div className="flex items-start gap-3 p-4 bg-vitalGreen/5 border border-vitalGreen/10 rounded-2xl">
             <input 
              type="checkbox" 
              className="mt-1 w-5 h-5 accent-vitalGreen cursor-pointer" 
              checked={newPatient.consentimentoLGPD}
              onChange={e => setNewPatient({...newPatient, consentimentoLGPD: e.target.checked})}
             />
             <label className="text-[11px] text-vitalGreen font-bold leading-tight uppercase tracking-wider cursor-pointer">
               Declaro que o paciente/responsável forneceu consentimento explícito para o tratamento de dados sensíveis de saúde conforme a LGPD.
             </label>
          </div>

          <div className="flex gap-4 pt-4">
             <Button variant="ghost" className="flex-1" onClick={() => { setIsAddModalOpen(false); setErrors({}); }}>Cancelar</Button>
             <Button variant="primary" className="flex-1 shadow-xl shadow-deepBlue/10" onClick={handleAddPatient}>Salvar e Abrir Prontuário</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientList;
