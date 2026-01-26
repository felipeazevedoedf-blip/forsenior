
import React, { useState, useMemo } from 'react';
import { Card, Badge, Button } from '../components/ui';
import { store } from '../services/store';
import { User } from '../types';
import { analyticsService } from '../services/analytics';

interface SafetyIntelligenceProps {
  user: User;
}

const SafetyIntelligence: React.FC<SafetyIntelligenceProps> = ({ user }) => {
  const [selectedId, setSelectedId] = useState('');
  const patients = store.getPatients();

  const analysis = useMemo(() => {
    if (!selectedId) return null;
    const p = store.getPatientById(selectedId);
    if (!p) return null;
    return analyticsService.performFullAnalysis(p);
  }, [selectedId]);

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-[#0D4F6A] poppins tracking-tight">Inteligência de Segurança</h2>
          <p className="text-gray-500 font-medium text-sm mt-1">Análise preditiva de riscos e eventos adversos.</p>
        </div>
        <select 
          className="w-full md:w-64 px-4 py-3 rounded-xl border border-gray-100 bg-white font-bold text-sm text-[#0D4F6A] outline-none shadow-sm focus:ring-2 focus:ring-[#0D4F6A]/10"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          <option value="">Selecione um Paciente...</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
        </select>
      </header>

      {!selectedId ? (
        <Card className="py-32 text-center text-gray-400 border-dashed bg-gray-50/50">
          <div className="text-5xl mb-6 opacity-20">🛡️</div>
          <p className="font-bold poppins">Aguardando seleção para diagnóstico preditivo.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className={`text-center py-10 transition-colors ${
              analysis?.level === 'Alto' ? 'border-red-100 bg-red-50/20' : 'bg-white'
            }`}>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Risco Vital Consolidado</p>
              <h3 className={`text-4xl font-bold poppins uppercase ${
                analysis?.level === 'Alto' ? 'text-red-600' : analysis?.level === 'Moderado' ? 'text-amber-500' : 'text-emerald-600'
              }`}>
                {analysis?.level}
              </h3>
              <div className="mt-4">
                <Badge variant={analysis?.level === 'Alto' ? 'error' : analysis?.level === 'Moderado' ? 'warning' : 'success'}>
                  Score: {analysis?.score} pts
                </Badge>
              </div>
            </Card>

            <Card title="Preditivo de Queda" className="bg-gray-50/30">
               <div className="text-center">
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Probabilidade</p>
                 <p className="text-xl font-bold text-[#0D4F6A]">{analysis?.probabilityEstimate}</p>
                 <p className="text-[10px] text-gray-400 mt-4 leading-relaxed font-medium">Cálculo baseado em variabilidade de marcha, polifarmácia e fragilidade cognitiva.</p>
               </div>
            </Card>
          </div>

          <Card className="lg:col-span-2" title="Fatores de Risco Detectados">
            <div className="space-y-4">
              {analysis?.factors.map((f, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-sm">
                      {f.category === 'Medicação' ? '💊' : f.category === 'Vital' ? '💓' : '🚶'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#33383D]">{f.description}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{f.category}</p>
                    </div>
                  </div>
                  <Badge variant="error">+{f.points}</Badge>
                </div>
              ))}
              {analysis?.recommendations.length! > 0 && (
                <div className="mt-10 pt-10 border-t border-gray-50">
                  <h4 className="text-[11px] font-bold text-[#0D4F6A] uppercase tracking-widest mb-4">Condutas Sugeridas</h4>
                  <div className="space-y-3">
                    {analysis?.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 items-start text-sm font-medium text-gray-600">
                        <span className="text-[#2E9E6A]">✓</span>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SafetyIntelligence;
