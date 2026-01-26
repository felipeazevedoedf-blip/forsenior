
import { Patient, VitalSign, FunctionalTest, PatientTimelineEvent, MedicationLog } from '../types';
import { store } from './store';

export type RiskFactor = {
  category: 'Vital' | 'Medicação' | 'Funcional' | 'Cognitivo' | 'Alerta';
  description: string;
  points: number;
};

export type RiskAnalysisResult = {
  score: number;
  level: 'Baixo' | 'Moderado' | 'Alto';
  factors: RiskFactor[];
  lastUpdate: string;
};

export const riskService = {
  analyzePatient: (
    patient: Patient,
    vitals: VitalSign[],
    tests: FunctionalTest[],
    events: PatientTimelineEvent[]
  ): RiskAnalysisResult => {
    const factors: RiskFactor[] = [];
    let score = 0;

    // 1. ANÁLISE DE MEDICAÇÃO E ADERÊNCIA RECENTE (SMART ALERTS)
    const today = new Date().toISOString().split('T')[0];
    const medicationLogs = store.getMedicationLogs(patient.id, today);
    const meds = store.getMedications(patient.id);

    const criticalMisses = medicationLogs.filter(l => l.status === 'missed');
    criticalMisses.forEach(log => {
      const med = meds.find(m => m.id === log.medicationId);
      if (med?.isHighAlert) {
        factors.push({ 
          category: 'Medicação', 
          description: `CRÍTICO: Falha em medicamento de alto alerta (${med.name}) hoje às ${log.scheduledTime}`, 
          points: 10 // Ponto máximo para forçar nível ALTO
        });
        score += 10;
      } else {
        factors.push({ 
          category: 'Medicação', 
          description: `Falha de administração: ${med?.name || 'Medicamento'} (${log.scheduledTime})`, 
          points: 2 
        });
        score += 2;
      }
    });

    if (meds.length >= 5) {
      factors.push({ category: 'Medicação', description: 'Polifarmácia (>= 5 medicamentos)', points: 1 });
      score += 1;
    }

    // 2. ANÁLISE FUNCIONAL (TUG / QUEDAS)
    const tug = tests.filter(t => t.type === 'TUG').sort((a, b) => b.date.localeCompare(a.date))[0];
    if (tug && tug.value > 20) {
      factors.push({ category: 'Funcional', description: 'Alto risco de queda (TUG > 20s)', points: 3 });
      score += 3;
    } else if (tug && tug.value > 12) {
      factors.push({ category: 'Funcional', description: 'Risco moderado de queda (TUG > 12s)', points: 1 });
      score += 1;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentFalls = events.filter(e => e.type === 'CRITICAL_EVENT' && e.title.toLowerCase().includes('queda') && new Date(e.timestamp) > thirtyDaysAgo);
    
    if (recentFalls.length > 0) {
      factors.push({ category: 'Funcional', description: `Histórico de queda recente (${recentFalls.length} nos últimos 30 dias)`, points: 4 });
      score += 4;
    }

    // 3. ANÁLISE DE SINAIS VITAIS
    const latestBP = vitals.filter(v => v.type === 'BloodPressure').sort((a,b) => b.timestamp.localeCompare(a.timestamp))[0];
    if (latestBP && typeof latestBP.value === 'string') {
      const sys = parseInt(latestBP.value.split('/')[0]);
      if (sys > 160 || sys < 95) {
        factors.push({ category: 'Vital', description: 'Pressão Arterial em níveis de alerta', points: 2 });
        score += 2;
      }
    }

    const latestSpO2 = vitals.filter(v => v.type === 'SpO2').sort((a,b) => b.timestamp.localeCompare(a.timestamp))[0];
    if (latestSpO2 && (latestSpO2.value as number) < 92) {
      factors.push({ category: 'Vital', description: 'Saturação de O2 abaixo de 92%', points: 3 });
      score += 3;
    }

    // 4. COGNIÇÃO
    if (patient.condicoesClinicasGerais.toLowerCase().includes('cognitivo') || patient.condicoesClinicasGerais.toLowerCase().includes('alzheimer')) {
      factors.push({ category: 'Cognitivo', description: 'Comprometimento cognitivo registrado', points: 2 });
      score += 2;
    }

    // CLASSIFICAÇÃO FINAL
    let level: 'Baixo' | 'Moderado' | 'Alto' = 'Baixo';
    if (score >= 8) level = 'Alto';
    else if (score >= 4) level = 'Moderado';

    return {
      score,
      level,
      factors,
      lastUpdate: new Date().toISOString()
    };
  }
};
