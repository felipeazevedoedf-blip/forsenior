
import React, { useState, useMemo } from 'react';
import { Card, Button, Input, Modal, Badge } from '../components/ui';
import { store } from '../services/store';
import { FunctionalTest, Patient, User, UserRole } from '../types';
import { TEST_TYPES, COLORS } from '../constants';
import { IconActivity, IconTrendingUp, IconHand, IconScale, IconAlertTriangle, IconBrain, IconRuler, IconClipboardList, IconProps } from '../components/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TestCardProps {
  testType: typeof TEST_TYPES[0];
  results: FunctionalTest[];
  onAdd: () => void;
}

const TestCard: React.FC<TestCardProps> = ({ testType, results, onAdd }) => {
  const latest = results[results.length - 1];
  const previous = results[results.length - 2];

  const trend = useMemo(() => {
    if (!latest || !previous) return null;
    const diff = latest.value - previous.value;
    const isLowerBetter = ['TUG', 'FallScale'].includes(testType.id);
    const improved = isLowerBetter ? diff < 0 : diff > 0;
    const percent = Math.abs((diff / previous.value) * 100).toFixed(1);
    
    return { improved, percent, diff };
  }, [latest, previous, testType]);

  return (
    <Card className="hover:shadow-md transition-all group border-t-4 border-t-deepBlue dark:border-t-sky-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-deepBlue dark:text-sky-400 poppins text-[10px] leading-tight uppercase tracking-tight">{testType.name}</h4>
          <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
            {latest ? `Último: ${new Date(latest.date).toLocaleDateString()}` : 'Sem registros'}
          </p>
        </div>
        <button 
          onClick={onAdd}
          className="p-1.5 bg-gray-50 dark:bg-slate-700 text-deepBlue dark:text-sky-400 rounded-lg hover:bg-vitalGreen hover:text-white dark:hover:bg-vitalGreen transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        </button>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-black text-deepBlue dark:text-slate-200">{latest ? latest.value : '--'}</span>
        <span className="text-[10px] font-black text-gray-400 uppercase">{testType.unit}</span>
        
        {trend && (
          <div className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${
            trend.improved ? 'bg-vitalGreen/10 text-vitalGreen' : 'bg-red-50 text-red-500'
          }`}>
            <span>{trend.improved ? '▲' : '▼'}</span>
            <span>{trend.percent}%</span>
          </div>
        )}
      </div>

      <div className="h-12 w-full">
        {results.length > 1 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={results}>
              <Area type="monotone" dataKey="value" stroke={COLORS.vitalGreen} strokeWidth={2} fill={COLORS.vitalGreen} fillOpacity={0.05} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

interface FunctionalTestsProps {
  user: User;
  patientId: string;
  onSelectPatient: (id: string) => void;
}

const FunctionalTests: React.FC<FunctionalTestsProps> = ({ user, patientId, onSelectPatient }) => {
  const selectedPatientId = patientId;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTestType, setActiveTestType] = useState<string>('');
  
  const patients = store.getPatients();
  const [formData, setFormData] = useState({
    value: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const allTests = useMemo(() => 
    selectedPatientId ? store.getTests(selectedPatientId) : [], 
    [selectedPatientId, isModalOpen]
  );

  const handleSave = () => {
    if (!selectedPatientId || !activeTestType || !formData.value) return;

    const test: FunctionalTest = {
      id: `test-${Date.now()}`,
      patientId: selectedPatientId,
      type: activeTestType,
      value: parseFloat(formData.value),
      date: formData.date,
      notes: formData.notes
    };

    store.addTest(test);
    
    store.addTimelineEvent({
      id: `tl-test-${Date.now()}`,
      patientId: selectedPatientId,
      clinicId: user.clinicId,
      type: 'FUNCTIONAL_TEST',
      title: `Teste Realizado: ${TEST_TYPES.find(t => t.id === activeTestType)?.name}`,
      description: `Resultado: ${formData.value} ${TEST_TYPES.find(t => t.id === activeTestType)?.unit}.`,
      timestamp: new Date().toISOString(),
      professionalName: user.name
    });

    setIsModalOpen(false);
    setFormData({ value: '', notes: '', date: new Date().toISOString().split('T')[0] });
  };

  const openTestModal = (id: string) => {
    setActiveTestType(id);
    setIsModalOpen(true);
  };

  const testIcons: Record<string, React.FC<IconProps>> = {
    TUG: IconActivity, SitStand: IconTrendingUp, ManualGrip: IconHand, GaitBalance: IconScale,
    FallScale: IconAlertTriangle, MiniCog: IconBrain, Flexibility: IconRuler, AVD: IconClipboardList
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-textDark dark:text-slate-100 poppins tracking-tight">Registro de Evolução</h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium text-sm">Realize e documente as avaliações de autonomia.</p>
        </div>
        <select
          className="w-full md:w-72 px-4 py-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-deepBlue dark:text-sky-400 shadow-xl outline-none"
          value={selectedPatientId}
          onChange={e => onSelectPatient(e.target.value)}
        >
          <option value="">Selecione o Paciente...</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
        </select>
      </header>

      {/* BOTÕES DE FUNÇÃO - DESTAQUE */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-50 dark:border-slate-700/50">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-1">Executar Avaliação Clínica:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {TEST_TYPES.map(type => (
            <button
              key={type.id}
              disabled={!selectedPatientId}
              onClick={() => openTestModal(type.id)}
              className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all group gap-2
                ${selectedPatientId 
                  ? 'bg-gray-50 dark:bg-slate-700 border-transparent hover:border-vitalGreen hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1' 
                  : 'bg-gray-50/50 dark:bg-slate-900 border-transparent text-gray-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                }`}
            >
              <span className={`text-deepBlue dark:text-sky-400 transition-transform group-hover:scale-125 ${!selectedPatientId ? 'grayscale' : ''}`}>
                {React.createElement(testIcons[type.id] || IconClipboardList, { className: 'w-6 h-6' })}
              </span>
              <span className="text-[9px] font-black uppercase text-center text-deepBlue dark:text-sky-400 tracking-tighter">
                {type.name.split(' (')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedPatientId ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {TEST_TYPES.map(type => (
            <TestCard 
              key={type.id}
              testType={type}
              results={allTests.filter(t => t.type === type.id).sort((a,b) => a.date.localeCompare(b.date))}
              onAdd={() => openTestModal(type.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="py-24 text-center text-gray-300 dark:text-slate-700 border-dashed border-2">
           <p className="font-bold text-lg">Aguardando seleção de paciente para exibir o histórico.</p>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Registrar Resultado: ${TEST_TYPES.find(t => t.id === activeTestType)?.name}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label={`Valor (${TEST_TYPES.find(t => t.id === activeTestType)?.unit})`} type="number" step="0.1" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} autoFocus />
            <Input label="Data" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <textarea className="w-full p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 outline-none text-sm" rows={3} placeholder="Observações..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          <div className="flex gap-4">
            <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="secondary" className="flex-1" onClick={handleSave}>Salvar Teste</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FunctionalTests;
