
import React, { useMemo, useState } from 'react';
import { Card, Badge, Button } from '../components/ui';
import { store } from '../services/store';
import { User, Patient } from '../types';
import { predictionService, FallPredictionResult } from '../services/predictionService';

interface FallPredictionProps {
  user: User;
  patientId?: string;
}

const FallPrediction: React.FC<FallPredictionProps> = ({ user, patientId }) => {
  const patients = store.getPatients();
  const [selectedId, setSelectedId] = useState(patientId || '');

  const prediction = useMemo(() => {
    if (!selectedId) return null;
    const patient = store.getPatientById(selectedId);
    if (!patient) return null;

    const tests = store.getTests(selectedId);
    const events = store.getTimelineEvents(selectedId);

    return predictionService.predictFallRisk(patient, tests, events);
  }, [selectedId]);

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'Alto': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: '🚨' };
      case 'Moderado': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️' };
      default: return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: '🛡️' };
    }
  };

  const styles = prediction ? getLevelStyles(prediction.level) : null;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0D4F6A] poppins">🔮 IA Preditiva de Queda</h2>
          <p className="text-gray-500 font-medium">Análise de tendências e probabilidade de eventos adversos.</p>
        </div>
        {!patientId && (
          <select 
            className="w-full md:w-64 px-4 py-2 rounded-xl border border-gray-100 bg-white font-bold text-sm text-[#0D4F6A] shadow-sm outline-none focus:ring-2 focus:ring-[#0D4F6A]"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">Selecione o Paciente...</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
          </select>
        )}
      </div>

      {!selectedId ? (
        <Card className="py-32 text-center text-gray-400 flex flex-col items-center gap-4">
          <span className="text-5xl opacity-20">🎯</span>
          <p className="font-bold poppins">Aguardando seleção para análise preditiva.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard Lateral */}
          <div className="lg:col-span-1 space-y-6">
            <Card className={`relative overflow-hidden text-center py-10 border-2 ${styles?.bg} ${styles?.border}`}>
              <div className="absolute top-2 right-2 opacity-10 text-6xl">{styles?.icon}</div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Probabilidade Estimada</p>
              <h3 className={`text-4xl font-black poppins mb-2 ${styles?.color}`}>{prediction?.level}</h3>
              <p className={`text-sm font-bold ${styles?.color} opacity-80 mb-6`}>{prediction?.probabilityEstimate}</p>
              
              <div className="pt-6 border-t border-current border-opacity-10 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase mb-1 opacity-70">Tendência Clínica</p>
                  <p className="text-xl font-black">{prediction?.score.toFixed(1)} pts</p>
                </div>
              </div>
            </Card>

            <Card title="Ações Recomendadas" className="bg-[#0D4F6A] text-white border-none">
               <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="text-lg">✅</span>
                    <p className="text-xs font-medium opacity-90">Rever auxílio humano imediato</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-lg">✅</span>
                    <p className="text-xs font-medium opacity-90">Sinalizar quarto com pulseira de risco</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-lg">✅</span>
                    <p className="text-xs font-medium opacity-90">Ajustar periodização de equilíbrio</p>
                  </div>
               </div>
            </Card>
          </div>

          {/* Insights Detalhados */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Explicação da IA (Fatores de Impacto)">
              <div className="space-y-4">
                {prediction?.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-md">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black ${
                      insight.impact === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <span className="text-[10px] uppercase leading-none">{insight.impact === 'High' ? 'Alto' : 'Méd'}</span>
                      <span className="text-[8px] opacity-60">IMP</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Fator Detectado</span>
                        <Badge variant={insight.trend === 'Worsening' ? 'error' : 'default'}>{insight.trend}</Badge>
                      </div>
                      <p className="text-sm font-bold text-[#33383D]">{insight.factor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex gap-4 items-start">
              <span className="text-2xl">💡</span>
              <div className="space-y-2">
                <h4 className="font-bold text-blue-900 text-sm">Nota de Transparência</h4>
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                  Este sistema analisa padrões de degradação motora e carga de vigilância. 
                  A análise atual sugere que a principal vulnerabilidade do paciente é a 
                  <strong> variabilidade de marcha</strong> associada à polifarmácia.
                </p>
              </div>
            </div>

            <p className="text-[10px] text-center text-gray-400 font-black uppercase tracking-widest">
              ⚠️ SISTEMA DE APOIO À DECISÃO. NÃO SUBSTITUI AVALIAÇÃO CLÍNICA.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FallPrediction;
