
import React, { useMemo } from 'react';
import { Card, Badge, Button } from '../components/ui';
import { IconShieldAlert, IconBrain, IconHeart, IconPill, IconActivity, IconAlertTriangle } from '../components/icons';
import { store } from '../services/store';
import { User, Patient } from '../types';
import { riskService, RiskAnalysisResult } from '../services/riskService';

interface VitalRiskChecklistProps {
  user: User;
  patientId?: string;
  onSelectPatient?: (id: string) => void;
}

const VitalRiskChecklist: React.FC<VitalRiskChecklistProps> = ({ user, patientId, onSelectPatient }) => {
  const patients = store.getPatients();
  const [selectedId, setSelectedId] = React.useState(patientId || '');

  React.useEffect(() => {
    setSelectedId(patientId || '');
  }, [patientId]);

  const handleSelectPatient = (id: string) => {
    setSelectedId(id);
    onSelectPatient?.(id);
  };

  const analysis = useMemo(() => {
    if (!selectedId) return null;
    const patient = store.getPatientById(selectedId);
    if (!patient) return null;

    const vitals = store.getVitalSigns(selectedId);
    const tests = store.getTests(selectedId);
    const events = store.getTimelineEvents(selectedId);

    return riskService.analyzePatient(patient, vitals, tests, events);
  }, [selectedId]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Alto': return 'text-red-600 bg-red-50 border-red-200';
      case 'Moderado': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Alto': return <Badge variant="error">RISCO ALTO</Badge>;
      case 'Moderado': return <Badge variant="warning">RISCO MODERADO</Badge>;
      default: return <Badge variant="success">RISCO BAIXO</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0D4F6A] poppins flex items-center gap-2"><IconShieldAlert className="w-6 h-6" /> Checklist de Risco Vital</h2>
          <p className="text-gray-500 font-medium">Análise heurística baseada em protocolos clínicos ForSênior.</p>
        </div>
        {!patientId && (
          <select 
            className="w-full md:w-64 px-4 py-2 rounded-xl border border-gray-100 bg-white font-bold text-sm text-[#0D4F6A] shadow-sm outline-none focus:ring-2 focus:ring-[#0D4F6A]"
            value={selectedId}
            onChange={e => handleSelectPatient(e.target.value)}
          >
            <option value="">Selecione um Paciente...</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
          </select>
        )}
      </div>

      {!selectedId ? (
        <Card className="py-32 text-center text-gray-400 flex flex-col items-center gap-4">
          <IconBrain className="w-12 h-12 opacity-20" />
          <p className="font-bold poppins">Selecione um paciente para iniciar a triagem automática.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna 1: Status Geral */}
          <div className="lg:col-span-1 space-y-6">
            <Card className={`text-center py-10 border-2 ${analysis ? getLevelColor(analysis.level) : ''}`}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Classificação Atual</p>
              <h3 className="text-3xl font-black poppins mb-4 uppercase">{analysis?.level}</h3>
              <div className="flex justify-center mb-6">
                 {analysis && getLevelBadge(analysis.level)}
              </div>
              <div className="pt-6 border-t border-current border-opacity-10">
                <p className="text-[10px] font-bold uppercase mb-1 opacity-70">Score Acumulado</p>
                <p className="text-2xl font-black">{analysis?.score} pts</p>
              </div>
            </Card>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Auditoria da Análise</h4>
               <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                 Esta análise foi gerada automaticamente em {analysis && new Date(analysis.lastUpdate).toLocaleString()}. 
                 O motor de regras ForSênior CDSS v1.0 avalia 24 indicadores cruzados.
               </p>
            </div>
          </div>

          {/* Coluna 2: Fatores Contribuintes */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Fatores Detectados pela Inteligência Clínica">
              <div className="space-y-4">
                {analysis?.factors.length === 0 ? (
                  <p className="text-center py-10 text-gray-400 italic">Nenhum fator de risco relevante detectado.</p>
                ) : (
                  analysis?.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        factor.points >= 3 ? 'bg-red-50 text-red-600' : 
                        factor.points >= 2 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {factor.category === 'Vital' ? <IconHeart className="w-5 h-5" /> :
                         factor.category === 'Medicação' ? <IconPill className="w-5 h-5" /> :
                         factor.category === 'Funcional' ? <IconActivity className="w-5 h-5" /> :
                         factor.category === 'Cognitivo' ? <IconBrain className="w-5 h-5" /> : <IconAlertTriangle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{factor.category}</p>
                        <p className="text-sm font-bold text-[#33383D]">{factor.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-gray-300">+{factor.points}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {analysis?.level === 'Alto' && (
              <div className="bg-red-600 p-6 rounded-[2rem] text-white shadow-xl shadow-red-900/20 animate-pulse">
                <div className="flex items-start gap-4">
                  <IconAlertTriangle className="w-8 h-8 shrink-0" />
                  <div>
                    <h4 className="font-bold poppins text-lg">Ação Prioritária Recomendada</h4>
                    <p className="text-sm opacity-90 leading-relaxed">
                      Paciente apresenta critérios de risco vital elevado. 
                      Notificação automática enviada à coordenação clínica. 
                      Recomenda-se revisão imediata da prescrição e acompanhamento intensivo dos sinais vitais.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-[10px] text-blue-800 font-bold leading-relaxed uppercase tracking-wide text-center flex items-center justify-center gap-2">
              <IconAlertTriangle className="w-4 h-4 shrink-0" /> AVISO LEGAL: ESTE É UM SISTEMA DE APOIO À DECISÃO CLÍNICA. NÃO SUBSTITUI A AVALIAÇÃO MÉDICA SOBERANA E PRESENCIAL.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalRiskChecklist;
