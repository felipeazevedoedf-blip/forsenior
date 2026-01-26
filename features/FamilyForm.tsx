
import React, { useState } from 'react';
// Added missing Input import
import { Card, Button, Badge, Input } from '../components/ui';
import { store } from '../services/store';
import { FamilyAssessment, PatientLog, UserRole } from '../types';

const FamilyForm: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'portal' | 'form' | 'success'>('intro');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [formData, setFormData] = useState({
    respondentName: '',
    relationship: '',
    answers: {} as Record<string, string>,
    observations: '',
    consent: false
  });

  const patients = store.getPatients();
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const appointments = selectedPatientId ? store.getAppointments({ patientId: selectedPatientId }) : [];
  const nextApp = appointments.find(a => new Date(a.date) >= new Date());

  const handleOptionSelect = (questionId: string, option: string) => {
    setFormData(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: option }
    }));
  };

  const isFormValid = () => {
    const requiredQuestions = [
      'mobility_house', 'mobility_stand', 'selfcare_bath', 'selfcare_dress', 
      'selfcare_toilet', 'food_eat', 'food_drink', 'memory_routine', 
      'memory_recognize', 'comm_talk', 'comm_behavior', 'safety_falls', 'safety_supervision'
    ];
    const allAnswered = requiredQuestions.every(q => formData.answers[q]);
    return allAnswered && formData.respondentName && formData.relationship && selectedPatientId && formData.consent;
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;

    const assessment: FamilyAssessment = {
      id: `fa-${Date.now()}`,
      patientId: selectedPatientId,
      patientName: selectedPatient?.nomeCompleto || 'Desconhecido',
      respondentName: formData.respondentName,
      relationship: formData.relationship,
      date: new Date().toISOString(),
      answers: formData.answers,
      observations: formData.observations,
      consent: {
        agreed: formData.consent,
        timestamp: new Date().toISOString()
      }
    };

    store.addFamilyAssessment(assessment);

    const log: PatientLog = {
      id: `log-fa-${Date.now()}`,
      patientId: selectedPatientId,
      changedByUserId: 'system',
      changedByUserName: `Família (${formData.respondentName})`,
      timestamp: new Date().toISOString(),
      action: 'FAMILY_ASSESSMENT'
    };
    store.addPatientLog(log);

    setStep('success');
  };

  const questions = [
    {
      id: 'sec_mobility',
      title: 'Mobilidade',
      icon: '🚶‍♂️',
      color: 'border-blue-500',
      items: [
        { id: 'mobility_house', text: 'O idoso consegue andar dentro de casa?', options: ['Sozinho', 'Com apoio', 'Não consegue'] },
        { id: 'mobility_stand', text: 'Para sair da cama ou da cadeira:', options: ['Sozinho', 'Precisa de ajuda', 'Não consegue'] }
      ]
    },
    {
      id: 'sec_selfcare',
      title: 'Autocuidado',
      icon: '🧼',
      color: 'border-green-500',
      items: [
        { id: 'selfcare_bath', text: 'Para tomar banho:', options: ['Sozinho', 'Com ajuda', 'Não consegue'] },
        { id: 'selfcare_dress', text: 'Para se vestir:', options: ['Sozinho', 'Com ajuda', 'Não consegue'] },
        { id: 'selfcare_toilet', text: 'Para usar o banheiro:', options: ['Sozinho', 'Com ajuda', 'Não consegue'] }
      ]
    },
    {
      id: 'sec_food',
      title: 'Alimentação',
      icon: '🍴',
      color: 'border-orange-500',
      items: [
        { id: 'food_eat', text: 'O idoso consegue se alimentar?', options: ['Sozinho', 'Com ajuda', 'Não consegue'] },
        { id: 'food_drink', text: 'Consegue beber líquidos sem dificuldade?', options: ['Sim', 'Às vezes', 'Não'] }
      ]
    }
  ];

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-[#FDFEFE] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 border-none shadow-xl bg-white">
          <div className="w-20 h-20 bg-[#0D4F6A] rounded-[2rem] mx-auto flex items-center justify-center text-white text-3xl font-bold rotate-3">
            FS
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#0D4F6A] poppins">Portal da Família</h1>
            <p className="text-gray-400 text-sm">Acompanhe e participe do cuidado de quem você ama.</p>
          </div>
          <div className="space-y-4">
            <select 
              className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-[#0D4F6A] text-center"
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
            >
              <option value="">Sou familiar de...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
            </select>
            <Button 
              className="w-full py-4 text-lg shadow-lg shadow-blue-900/10" 
              disabled={!selectedPatientId}
              onClick={() => setStep('portal')}
            >
              Acessar Portal
            </Button>
          </div>
          <p className="text-[10px] text-gray-300 uppercase font-black tracking-widest">Acesso seguro via ForSênior Care</p>
        </Card>
      </div>
    );
  }

  if (step === 'portal') {
    return (
      <div className="min-h-screen bg-[#F4F6F8]">
        <header className="bg-white p-6 border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => setStep('intro')} className="text-gray-400 font-bold">← Sair</button>
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase">Portal do Familiar</p>
              <h2 className="font-bold text-[#0D4F6A] poppins">{selectedPatient?.nomeCompleto}</h2>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50"></div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
          <Card className="bg-gradient-to-br from-[#0D4F6A] to-[#1a6b8a] text-white border-none">
            <h3 className="text-xs font-black opacity-70 uppercase mb-4 tracking-widest">Recado da Equipe</h3>
            <p className="text-lg font-medium leading-relaxed italic">
              "Hoje o Sr. {selectedPatient?.nomeCompleto.split(' ')[0]} estava muito disposto! Participou da fisioterapia com alegria e se alimentou super bem."
            </p>
            <div className="mt-4 flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">🩺</div>
               <span className="text-[10px] font-bold opacity-80">Enfermeira Responsável • Hoje às 10:30</span>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center p-4">
              <span className="text-2xl mb-1 block">📅</span>
              <p className="text-[10px] font-black text-gray-400 uppercase">Próxima Visita</p>
              <p className="font-bold text-[#0D4F6A]">{nextApp ? new Date(nextApp.date).toLocaleDateString() : 'A agendar'}</p>
            </Card>
            <Card className="text-center p-4">
              <span className="text-2xl mb-1 block">💊</span>
              <p className="text-[10px] font-black text-gray-400 uppercase">Medicação</p>
              <p className="font-bold text-green-600">Em dia</p>
            </Card>
          </div>

          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30 flex flex-col items-center p-8 gap-4 text-center">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm">📋</div>
             <div>
               <h4 className="font-bold text-[#0D4F6A] poppins">Avaliação Semanal</h4>
               <p className="text-sm text-gray-500">Conte para a equipe como o idoso se comportou nos últimos dias em casa.</p>
             </div>
             <Button className="w-full" onClick={() => setStep('form')}>Responder Formulário</Button>
          </Card>
          
          <div className="text-center pt-10">
            <button onClick={() => window.location.href='tel:0800000000'} className="text-xs font-bold text-[#0D4F6A] opacity-50 hover:opacity-100 transition-opacity">
              📞 Precisa falar com a clínica? Ligar agora.
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-10 space-y-6 animate-fade-in">
          <div className="text-6xl mb-4">❤️</div>
          <h1 className="text-2xl font-bold text-[#0D4F6A] poppins">Informações Recebidas!</h1>
          <p className="text-gray-500">Obrigado por participar. Seus dados já estão no prontuário digital da nossa equipe.</p>
          <div className="pt-6">
            <Button className="w-full" onClick={() => setStep('portal')}>Voltar ao Portal</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#F4F6F8] p-6 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => setStep('portal')} className="text-[#0D4F6A] font-bold">✕ Cancelar</button>
          <h2 className="font-bold poppins text-[#0D4F6A]">Formulário de Observação</h2>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-8 mt-4">
        <Card className="bg-blue-50/50 border-none">
          <div className="space-y-4">
            <Input label="Seu Nome" placeholder="Ex: Maria Santos" value={formData.respondentName} onChange={e => setFormData({...formData, respondentName: e.target.value})} />
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Parentesco</label>
              <select 
                 className="w-full p-4 rounded-2xl border border-gray-100 bg-white font-bold outline-none"
                 value={formData.relationship}
                 onChange={e => setFormData({...formData, relationship: e.target.value})}
              >
                <option value="">Selecione...</option>
                <option value="Filho(a)">Filho(a)</option>
                <option value="Cônjuge">Cônjuge</option>
                <option value="Neto(a)">Neto(a)</option>
                <option value="Cuidador(a)">Cuidador(a)</option>
              </select>
            </div>
          </div>
        </Card>

        {questions.map(section => (
          <div key={section.id} className="space-y-4">
            <h3 className="text-lg font-bold text-[#0D4F6A] poppins px-2">{section.title}</h3>
            {section.items.map(q => (
              <div key={q.id} className="p-4 border-b border-gray-50">
                <p className="font-bold text-[#33383D] mb-4">{q.text}</p>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(q.id, opt)}
                      className={`p-4 rounded-2xl border-2 text-left font-bold transition-all ${
                        formData.answers[q.id] === opt 
                        ? 'border-[#0D4F6A] bg-[#0D4F6A]/5 text-[#0D4F6A]' 
                        : 'border-gray-100 text-gray-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        <Card title="Observações Livres">
          <textarea 
            className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none min-h-[100px]"
            placeholder="Alguma mudança no comportamento ou saúde?"
            value={formData.observations}
            onChange={e => setFormData({...formData, observations: e.target.value})}
          />
        </Card>

        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
          <input 
            type="checkbox" 
            className="mt-1 w-5 h-5 accent-[#0D4F6A]" 
            checked={formData.consent}
            onChange={e => setFormData({...formData, consent: e.target.checked})}
          />
          <label className="text-[10px] font-bold text-gray-500 leading-tight">
             Autorizo a equipe clínica a utilizar estas informações para o ajuste do plano de cuidados (Conforme LGPD).
          </label>
        </div>

        <div className="pb-10">
          <Button 
            className="w-full py-5 text-lg" 
            disabled={!isFormValid()}
            onClick={handleSubmit}
          >
            Enviar Relatório
          </Button>
        </div>
      </main>
    </div>
  );
};

export default FamilyForm;
