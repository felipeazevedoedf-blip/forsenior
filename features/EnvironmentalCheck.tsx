
import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, Badge, Input } from '../components/ui';
import { store } from '../services/store';
import { User, EnvironmentalAssessment, Patient } from '../types';
import { environmentalService, EnvironmentalAnalysis } from '../services/environmentalService';

interface EnvironmentalCheckProps {
  user: User;
  patientId?: string;
  onSelectPatient?: (id: string) => void;
}

const EnvironmentalCheck: React.FC<EnvironmentalCheckProps> = ({ user, patientId, onSelectPatient }) => {
  const patients = store.getPatients();
  const [selectedId, setSelectedId] = useState(patientId || '');

  useEffect(() => {
    setSelectedId(patientId || '');
  }, [patientId]);

  const handleSelectPatient = (id: string) => {
    setSelectedId(id);
    onSelectPatient?.(id);
  };
  const [activeTab, setActiveTab] = useState<'quarto' | 'banheiro' | 'cozinha' | 'geral'>('quarto');
  const [showHistory, setShowHistory] = useState(false);

  const [currentCheck, setCurrentCheck] = useState<{
    bedroom: string[], bathroom: string[], kitchen: string[], circulation: string[], lighting: string[], supports: string[]
  }>({
    bedroom: [], bathroom: [], kitchen: [], circulation: [], lighting: [], supports: []
  });

  const history = useMemo(() => selectedId ? store.getEnvironmentalAssessments(selectedId) : [], [selectedId]);
  const latestAssessment = history.sort((a,b) => b.date.localeCompare(a.date))[0];
  
  const analysis = useMemo(() => {
    if (!selectedId || !latestAssessment) return null;
    const patient = store.getPatientById(selectedId);
    if (!patient) return null;
    const tests = store.getTests(selectedId);
    return environmentalService.analyze(latestAssessment, patient, tests);
  }, [selectedId, latestAssessment]);

  const toggleItem = (category: keyof typeof currentCheck, item: string) => {
    const list = currentCheck[category];
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setCurrentCheck({ ...currentCheck, [category]: newList });
  };

  const handleSave = () => {
    if (!selectedId) return;
    const assessment: EnvironmentalAssessment = {
      id: `env-${Date.now()}`,
      patientId: selectedId,
      date: new Date().toISOString(),
      professionalId: user.id,
      professionalName: user.name,
      rooms: currentCheck,
      generalNotes: ''
    };
    store.addEnvironmentalAssessment(assessment);
    alert("Avaliação Ambiental salva com sucesso!");
    setShowHistory(true);
  };

  const options = {
    bedroom: ['Tapetes soltos', 'Cama muito alta/baixa', 'Falta de luz noturna', 'Móveis instáveis', 'Fios expostos'],
    bathroom: ['Falta de barras de apoio', 'Piso escorregadio', 'Tapetes sem antiderrapante', 'Box com degrau alto', 'Falta de banco para banho'],
    kitchen: ['Armários muito altos', 'Piso encerado/escorregadio', 'Iluminação insuficiente', 'Obstáculos no chão'],
    circulation: ['Desníveis/Degraus', 'Tapetes soltos', 'Iluminação insuficiente', 'Obstáculos no caminho', 'Corredor estreito'],
    lighting: ['Interruptores de difícil acesso', 'Lâmpadas queimadas', 'Falta de luz de emergência'],
    supports: ['Não utiliza dispositivos', 'Andador/Bengala em mau estado', 'Falta de corrimão em escadas']
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0D4F6A] poppins">🏠 Check Ambiental Inteligente</h2>
          <p className="text-gray-500 font-medium">Avaliação de riscos no domicílio e prevenção de acidentes.</p>
        </div>
        <div className="flex gap-2">
          {!patientId && (
            <select 
              className="w-full md:w-64 px-4 py-2 rounded-xl border border-gray-100 bg-white font-bold text-sm text-[#0D4F6A] shadow-sm outline-none focus:ring-2 focus:ring-[#0D4F6A]"
              value={selectedId}
              onChange={e => handleSelectPatient(e.target.value)}
            >
              <option value="">Selecione o Paciente...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
            </select>
          )}
          {selectedId && <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>{showHistory ? 'Novo Check' : 'Ver Histórico'}</Button>}
        </div>
      </div>

      {!selectedId ? (
        <Card className="py-32 text-center text-gray-400 flex flex-col items-center gap-4">
          <span className="text-5xl opacity-20">🏡</span>
          <p className="font-bold poppins">Inicie a auditoria ambiental selecionando um paciente.</p>
        </Card>
      ) : showHistory ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Resultados do último check */}
           <div className="lg:col-span-1 space-y-6">
              <Card className={`text-center py-10 border-2 ${analysis?.overallLevel === 'Alto' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Risco Ambiental Geral</p>
                <h3 className="text-3xl font-black poppins uppercase">{analysis?.overallLevel}</h3>
                <div className="mt-4 flex justify-center">
                  <Badge variant={analysis?.overallLevel === 'Alto' ? 'error' : 'success'}>Score: {analysis?.overallScore}</Badge>
                </div>
              </Card>

              <Card title="Mapa de Calor (Cômodos)">
                 <div className="space-y-3">
                   {analysis?.roomRisks.map(r => (
                     <div key={r.room} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-xs font-bold text-[#0D4F6A]">{r.room}</span>
                        <Badge variant={r.level === 'Alto' ? 'error' : r.level === 'Moderado' ? 'warning' : 'success'}>{r.level}</Badge>
                     </div>
                   ))}
                 </div>
              </Card>
           </div>

           <div className="lg:col-span-2 space-y-6">
              <Card title="Recomendações ForSênior Preventivas">
                 <div className="space-y-4">
                    {analysis?.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                         <span className="text-xl">✅</span>
                         <p className="text-sm font-bold text-blue-900 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                    {analysis?.recommendations.length === 0 && <p className="text-center py-10 text-gray-400 italic">Domicílio seguro. Continue monitorando.</p>}
                 </div>
              </Card>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center">
                 Última avaliação em {new Date(latestAssessment.date).toLocaleDateString()} por {latestAssessment.professionalName}
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex border-b border-gray-200 overflow-x-auto gap-4">
            {['quarto', 'banheiro', 'cozinha', 'circulacao', 'iluminacao'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-3 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab ? 'border-[#0D4F6A] text-[#0D4F6A]' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <Card className="animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(options[activeTab === 'circulacao' ? 'circulation' : activeTab === 'iluminacao' ? 'lighting' : activeTab as keyof typeof options] || []).map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleItem(activeTab === 'circulacao' ? 'circulation' : activeTab === 'iluminacao' ? 'lighting' : activeTab as any, opt)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                      currentCheck[activeTab === 'circulacao' ? 'circulation' : activeTab === 'iluminacao' ? 'lighting' : activeTab as keyof typeof currentCheck].includes(opt)
                      ? 'border-red-600 bg-red-50 text-red-700' 
                      : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    <span className="font-bold text-sm">{opt}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${currentCheck[activeTab === 'circulacao' ? 'circulation' : activeTab === 'iluminacao' ? 'lighting' : activeTab as keyof typeof currentCheck].includes(opt) ? 'bg-red-600 border-red-600' : 'border-gray-200'}`}>
                      {currentCheck[activeTab === 'circulacao' ? 'circulation' : activeTab === 'iluminacao' ? 'lighting' : activeTab as keyof typeof currentCheck].includes(opt) && <span className="text-white text-xs">✕</span>}
                    </div>
                  </button>
                ))}
             </div>
          </Card>

          <div className="flex justify-end gap-4">
             <Button variant="ghost" onClick={() => setCurrentCheck({bedroom: [], bathroom: [], kitchen: [], circulation: [], lighting: [], supports: []})}>Limpar Seleção</Button>
             <Button variant="primary" className="px-10 shadow-xl shadow-blue-900/10" onClick={handleSave}>Finalizar Auditoria Ambiental</Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
             <span className="text-xl">💡</span>
             <p className="text-[10px] text-blue-800 font-bold leading-relaxed uppercase">
               Selecione os riscos identificados no domicílio. Este checklist estruturado não faz previsão automática de quedas — a análise de risco final é sempre feita pelo profissional responsável.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentalCheck;
