
import { Patient, VitalSign, FunctionalTest, PatientTimelineEvent, MedicationLog, EnvironmentalAssessment } from '../types';
import { store } from './store';

export type RiskFactor = {
  category: 'Vital' | 'Medicação' | 'Funcional' | 'Cognitivo';
  description: string;
  points: number;
};

export type AnalysisResult = {
  score: number;
  level: 'Baixo' | 'Moderado' | 'Alto';
  factors: RiskFactor[];
  recommendations: string[];
  lastUpdate: string;
};

const WEIGHTS = {
  missedMedHigh: 10,
  missedMedNormal: 2,
  tugHigh: 4,
  spo2Low: 3,
  polypharmacy: 1,
  recentFall: 5,
  cognitiveImpact: 2
};

export const analyticsService = {
  performFullAnalysis: (patient: Patient): AnalysisResult => {
    const vitals = store.getVitalSigns(patient.id);
    const tests = store.getTests(patient.id);
    const events = store.getTimelineEvents(patient.id);
    const meds = store.getMedications(patient.id);
    const today = new Date().toISOString().split('T')[0];
    const medicationLogs = store.getMedicationLogs(patient.id, today);
    
    const factors: RiskFactor[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // 1. Medicação
    const missedMeds = medicationLogs.filter(l => l.status === 'missed');
    missedMeds.forEach(log => {
      const med = meds.find(m => m.id === log.medicationId);
      if (med?.isHighAlert) {
        factors.push({ category: 'Medicação', description: `FALHA CRÍTICA: ${med.name}`, points: WEIGHTS.missedMedHigh });
        score += WEIGHTS.missedMedHigh;
        recommendations.push(`Ação imediata para medicação: ${med.name}`);
      } else {
        factors.push({ category: 'Medicação', description: `Atraso: ${med?.name || 'Medicação'}`, points: WEIGHTS.missedMedNormal });
        score += WEIGHTS.missedMedNormal;
      }
    });

    if (meds.length >= 5) {
      factors.push({ category: 'Medicação', description: 'Polifarmácia detectada', points: WEIGHTS.polypharmacy });
      score += WEIGHTS.polypharmacy;
    }

    // 2. Funcional (TUG)
    const tug = tests.filter(t => t.type === 'TUG').sort((a,b) => b.date.localeCompare(a.date))[0];
    if (tug && tug.value > 20) {
      factors.push({ category: 'Funcional', description: 'TUG Crítico (>20s)', points: WEIGHTS.tugHigh });
      score += WEIGHTS.tugHigh;
      recommendations.push("Implementar auxílio humano integral para marcha.");
    }

    // 3. Sinais Vitais
    const latestSpO2 = vitals.filter(v => v.type === 'SpO2').sort((a,b) => b.timestamp.localeCompare(a.timestamp))[0];
    if (latestSpO2 && (latestSpO2.value as number) < 92) {
      factors.push({ category: 'Vital', description: 'Saturação abaixo de 92%', points: WEIGHTS.spo2Low });
      score += WEIGHTS.spo2Low;
    }

    // 4. Histórico de Quedas
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentFalls = events.filter(e => 
      e.type === 'CRITICAL_EVENT' && 
      e.title.toLowerCase().includes('queda') && 
      new Date(e.timestamp) > thirtyDaysAgo
    );
    if (recentFalls.length > 0) {
      factors.push({ category: 'Funcional', description: 'Queda recente nos últimos 30 dias', points: WEIGHTS.recentFall });
      score += WEIGHTS.recentFall;
      recommendations.push("Revisar layout ambiental e calçados.");
    }

    const level = score >= 10 ? 'Alto' : score >= 5 ? 'Moderado' : 'Baixo';

    return {
      score,
      level,
      factors,
      recommendations,
      lastUpdate: new Date().toISOString()
    };
  }
};
