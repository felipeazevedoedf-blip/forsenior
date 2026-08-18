
import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { store } from '../services/store';
import { FamilyAssessment, FamilyAccessRequest, PatientLog } from '../types';

interface FamilyFormProps {
  onBack?: () => void;
}

// Portal da Família (Prompt Mestre, seção 4): nenhum acesso é liberado por simples
// escolha de paciente. Todo acesso precisa de um cadastro (solicitação) aprovado
// ou negado pelo Administrador da clínica antes de qualquer dado ser exibido.
type FamilyStep = 'entry' | 'request' | 'pending' | 'denied' | 'portal' | 'form' | 'success';

const generateAccessCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const FamilyForm: React.FC<FamilyFormProps> = ({ onBack }) => {
  const [step, setStep] = useState<FamilyStep>('entry');
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [activeRequest, setActiveRequest] = useState<FamilyAccessRequest | null>(null);

  const patients = store.getPatients();

  const [requestForm, setRequestForm] = useState({
    patientId: '',
    requesterName: '',
    relationship: '',
    phone: ''
  });

  const [formData, setFormData] = useState({
    respondentName: '',
    relationship: '',
    answers: {} as Record<string, string>,
    observations: '',
    consent: false
  });

  const selectedPatient = patients.find(p => p.id === activeRequest?.patientId);
  const appointments = activeRequest ? store.getAppointments({ patientId: activeRequest.patientId }) : [];
  const nextApp = appointments.find(a => new Date(a.date) >= new Date());

  const handleCheckCode = () => {
    const req = store.getFamilyAccessRequestByCode(accessCode.trim());
    if (!req) {
      setCodeError('Código não encontrado. Verifique e tente novamente.');
      return;
    }
    setCodeError('');
    setActiveRequest(req);
    if (req.status === 'approved') {
      setFormData(prev => ({ ...prev, respondentName: req.requesterName, relationship: req.relationship }));
      setStep('portal');
    } else if (req.status === 'denied') {
      setStep('denied');
    } else {
      setStep('pending');
    }
  };

  const handleRefreshStatus = () => {
    if (!activeRequest) return;
    const updated = store.getFamilyAccessRequestByCode(activeRequest.accessCode);
    if (!updated) return;
    setActiveRequest(updated);
    if (updated.status === 'approved') {
      setFormData(prev => ({ ...prev, respondentName: updated.requesterName, relationship: updated.relationship }));
      setStep('portal');
    } else if (updated.status === 'denied') {
      setStep('denied');
    }
  };

  const isRequestFormValid = () =>
    requestForm.patientId && requestForm.requesterName.trim() && requestForm.relationship && requestForm.phone.trim();

  const handleSubmitRequest = () => {
    if (!isRequestFormValid()) return;
    const patient = patients.find(p => p.id === requestForm.patientId);
    if (!patient) return;

    const req: FamilyAccessRequest = {
      id: `far-${Date.now()}`,
      clinicId: patient.clinicId,
      patientId: patient.id,
      patientName: patient.nomeCompleto,
      requesterName: requestForm.requesterName,
      relationship: requestForm.relationship,
      phone: requestForm.phone,
      accessCode: generateAccessCode(),
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    store.addFamilyAccessRequest(req);
    setActiveRequest(req);
    setStep('pending');
  };

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
    return allAnswered && formData.respondentName && formData.relationship && activeRequest?.patientId && formData.consent;
  };

  const handleSubmit = () => {
    if (!isFormValid() || !activeRequest) return;

    const assessment: FamilyAssessment = {
      id: `fa-${Date.now()}`,
      patientId: activeRequest.patientId,
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
      patientId: activeRequest.patientId,
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

  if (step === 'entry') {
    return (
      <div className="min-h-screen bg-[#FDFEFE] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 border-none shadow-xl bg-white">
          <div className="w-20 h-20 bg-[#0D4F6A] rounded-[2rem] mx-auto flex items-center justify-center text-white text-3xl font-bold rotate-3">
            FS
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#0D4F6A] poppins">Portal da Família</h1>
            <p className="text-gray-400 text-sm">O acesso é individual e precisa ser aprovado pela clínica antes do primeiro uso.</p>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Já tenho um código de acesso</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-[#0D4F6A] text-center uppercase tracking-widest"
                  placeholder="CÓDIGO"
                  value={accessCode}
                  onChange={e => { setAccessCode(e.target.value); setCodeError(''); }}
                />
                <Button onClick={handleCheckCode} disabled={!accessCode.trim()}>Entrar</Button>
              </div>
              {codeError && <p className="mt-2 text-[11px] font-bold text-red-500">{codeError}</p>}
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px]"><span className="px-3 bg-white text-gray-300 uppercase tracking-widest">ou</span></div>
            </div>

            <Button variant="ghost" className="w-full py-4" onClick={() => setStep('request')}>
              Ainda não tenho acesso — Solicitar
            </Button>
          </div>

          {onBack && (
            <button onClick={onBack} className="text-[11px] font-bold text-gray-400 hover:text-[#0D4F6A] transition-colors">
              ← Voltar
            </button>
          )}
        </Card>
      </div>
    );
  }

  if (step === 'request') {
    return (
      <div className="min-h-screen bg-[#FDFEFE] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 space-y-6 border-none shadow-xl bg-white">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-[#0D4F6A] poppins">Solicitar Acesso</h1>
            <p className="text-gray-400 text-sm">Sua solicitação será analisada pela clínica antes da liberação do acesso.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Paciente</label>
              <select
                className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-[#0D4F6A]"
                value={requestForm.patientId}
                onChange={e => setRequestForm({ ...requestForm, patientId: e.target.value })}
              >
                <option value="">Sou familiar de...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
              </select>
            </div>

            <Input label="Seu Nome Completo" placeholder="Ex: Maria Santos" value={requestForm.requesterName} onChange={e => setRequestForm({ ...requestForm, requesterName: e.target.value })} />

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Parentesco</label>
              <select
                className="w-full p-4 rounded-2xl border border-gray-100 bg-white font-bold outline-none"
                value={requestForm.relationship}
                onChange={e => setRequestForm({ ...requestForm, relationship: e.target.value })}
              >
                <option value="">Selecione...</option>
                <option value="Filho(a)">Filho(a)</option>
                <option value="Cônjuge">Cônjuge</option>
                <option value="Neto(a)">Neto(a)</option>
                <option value="Cuidador(a)">Cuidador(a)</option>
              </select>
            </div>

            <Input label="Telefone de Contato" placeholder="(00) 00000-0000" value={requestForm.phone} onChange={e => setRequestForm({ ...requestForm, phone: e.target.value })} />
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setStep('entry')}>Cancelar</Button>
            <Button className="flex-1" disabled={!isRequestFormValid()} onClick={handleSubmitRequest}>Enviar Solicitação</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'pending') {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-10 space-y-6">
          <div className="text-5xl">⏳</div>
          <h1 className="text-xl font-bold text-[#0D4F6A] poppins">Solicitação em análise</h1>
          <p className="text-gray-500 text-sm">A clínica ainda não aprovou este acesso. Guarde seu código para consultar mais tarde:</p>
          <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-2xl font-black tracking-[0.3em] text-[#0D4F6A]">{activeRequest?.accessCode}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={handleRefreshStatus}>Verificar novamente</Button>
            <button onClick={() => setStep('entry')} className="text-[11px] font-bold text-gray-400 hover:text-[#0D4F6A]">← Voltar</button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'denied') {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-10 space-y-6">
          <div className="text-5xl">🚫</div>
          <h1 className="text-xl font-bold text-red-600 poppins">Acesso não aprovado</h1>
          <p className="text-gray-500 text-sm">A clínica não aprovou esta solicitação. Entre em contato com a equipe para mais informações.</p>
          <button onClick={() => setStep('entry')} className="text-[11px] font-bold text-gray-400 hover:text-[#0D4F6A]">← Voltar</button>
        </Card>
      </div>
    );
  }

  if (!activeRequest || !selectedPatient) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-10">
          <p className="text-gray-400">Sessão expirada.</p>
          <Button className="mt-4" onClick={() => setStep('entry')}>Voltar ao início</Button>
        </Card>
      </div>
    );
  }

  if (step === 'portal') {
    return (
      <div className="min-h-screen bg-[#F4F6F8]">
        <header className="bg-white p-6 border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => { setActiveRequest(null); setStep('entry'); }} className="text-gray-400 font-bold">← Sair</button>
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase">Portal do Familiar</p>
              <h2 className="font-bold text-[#0D4F6A] poppins">{selectedPatient.nomeCompleto}</h2>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50"></div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
          <Card className="bg-gradient-to-br from-[#0D4F6A] to-[#1a6b8a] text-white border-none">
            <h3 className="text-xs font-black opacity-70 uppercase mb-4 tracking-widest">Recado da Equipe</h3>
            <p className="text-lg font-medium leading-relaxed italic">
              "Hoje o Sr. {selectedPatient.nomeCompleto.split(' ')[0]} estava muito disposto! Participou da fisioterapia com alegria e se alimentou super bem."
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
