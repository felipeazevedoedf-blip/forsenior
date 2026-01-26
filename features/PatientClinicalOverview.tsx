
import React, { useMemo } from 'react';
import { Card, Badge, Button } from '../components/ui';
import { Patient, VitalSign, FunctionalTest, User } from '../types';
// Import correct services for risk and fall prediction
import { riskService } from '../services/riskService';
import { predictionService } from '../services/predictionService';
import { store } from '../services/store';

interface PatientClinicalOverviewProps {
  patient: Patient;
  vitals: VitalSign[];
  tests: FunctionalTest[];
  user: User;
  onNavigateToReport: (type: 'emergency' | 'medical' | 'visual') => void;
}

const PatientClinicalOverview: React.FC<PatientClinicalOverviewProps> = ({ 
  patient, vitals, tests, user, onNavigateToReport 
}) => {
  // Use riskService and predictionService instead of analyticsService
  const analysis = useMemo(() => {
    const events = store.getTimelineEvents(patient.id);
    return {
      risk: riskService.analyzePatient(patient, vitals, tests, events),
      falls: predictionService.predictFallRisk(patient, tests, events)
    };
  }, [patient, vitals, tests]);

  const medicationAlerts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const logs = store.getMedicationLogs(patient.id, today).filter(l => l.status === 'missed');
    const meds = store.getMedications(patient.id);
    return logs.map(l => ({ log: l, med: meds.find(m => m.id === l.medicationId) }));
  }, [patient.id]);

  const hasCriticalMiss = medicationAlerts.some(a => a.med?.isHighAlert);

  return (
    <div className="space-y-6 animate-fade-in">
      {hasCriticalMiss && (
        <div className="bg-red-600 p-6 rounded-3xl text-white shadow-xl animate-pulse flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">💊</span>
            <div>
              <h4 className="font-bold poppins text-lg">ALERTA CRÍTICO: Dose Perdida!</h4>
              <p className="text-xs opacity-90">Medicação de Alto Alerta não administrada hoje.</p>
            </div>
          </div>
          <Button variant="ghost" className="bg-white text-red-600 border-none px-8" onClick={() => onNavigateToReport('emergency')}>
            Plano de Emergência
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0D4F6A] text-white p-6 border-none flex items-center gap-4">
           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">👴</div>
           <div>
             <h3 className="text-lg font-bold poppins truncate">{patient.nomeCompleto}</h3>
             <p className="text-[10px] opacity-70 uppercase font-black">Prontuário Ativo</p>
           </div>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Risco Vital</p>
          <Badge variant={analysis.risk.level === 'Alto' ? 'error' : 'success'}>
            {analysis.risk.level.toUpperCase()}
          </Badge>
          <p className="text-[9px] text-gray-400 font-bold mt-2">Score: {analysis.risk.score} pts</p>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Preditivo Queda</p>
          <Badge variant={analysis.falls.level === 'Alto' ? 'error' : 'success'}>
            {analysis.falls.level.toUpperCase()}
          </Badge>
          <p className="text-[9px] text-gray-400 font-bold mt-2">Prob: {analysis.falls.probabilityEstimate}</p>
        </Card>

        <div className="flex flex-col gap-2">
          <Button variant="danger" size="sm" className="w-full text-[10px] uppercase font-black" onClick={() => onNavigateToReport('emergency')}>🚨 Emergência</Button>
          <Button variant="primary" size="sm" className="w-full text-[10px] uppercase font-black" onClick={() => onNavigateToReport('medical')}>🩺 Relatório Médico</Button>
        </div>
      </div>
    </div>
  );
};

export default PatientClinicalOverview;
