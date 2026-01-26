
import { Patient, VitalSign, FunctionalTest, PatientTimelineEvent } from '../types';

export type PredictionInsight = {
  factor: string;
  impact: 'High' | 'Medium' | 'Low';
  trend: 'Worsening' | 'Stable' | 'Critical';
};

export type FallPredictionResult = {
  score: number;
  level: 'Baixo' | 'Moderado' | 'Alto';
  insights: PredictionInsight[];
  probabilityEstimate: string; // Ex: "75% de chance de novo evento em 30 dias"
  lastAnalysis: string;
};

export const predictionService = {
  predictFallRisk: (
    patient: Patient,
    tests: FunctionalTest[],
    events: PatientTimelineEvent[]
  ): FallPredictionResult => {
    const insights: PredictionInsight[] = [];
    let score = 0;

    // 1. ANÁLISE DE TENDÊNCIA TUG (Timed Up and Go)
    const tugTests = tests.filter(t => t.type === 'TUG').sort((a, b) => b.date.localeCompare(a.date));
    if (tugTests.length >= 2) {
      const current = tugTests[0].value;
      const previous = tugTests[1].value;
      const diffPercent = ((current - previous) / previous) * 100;

      if (diffPercent > 10) {
        insights.push({ 
          factor: `Piora de ${diffPercent.toFixed(1)}% no tempo de marcha (TUG)`, 
          impact: 'High', 
          trend: 'Worsening' 
        });
        score += 3;
      }
    } else if (tugTests.length === 1 && tugTests[0].value > 15) {
      insights.push({ factor: 'Tempo de TUG basal acima do limite de segurança (>15s)', impact: 'Medium', trend: 'Stable' });
      score += 2;
    }

    // 2. HISTÓRICO RECENTE NA TIMELINE
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentFalls = events.filter(e => 
      e.type === 'CRITICAL_EVENT' && 
      (e.title.toLowerCase().includes('queda') || e.description.toLowerCase().includes('caiu')) &&
      new Date(e.timestamp) > thirtyDaysAgo
    );

    if (recentFalls.length > 0) {
      insights.push({ 
        factor: `${recentFalls.length} queda(s) registrada(s) nos últimos 30 dias`, 
        impact: 'High', 
        trend: 'Critical' 
      });
      score += 5;
    }

    // 3. ANÁLISE DE MEDICAMENTOS E POLIFARMÁCIA
    const medsCount = patient.medications?.length || 0;
    if (medsCount >= 5) {
      insights.push({ factor: `Polifarmácia ativa (${medsCount} medicamentos)`, impact: 'Medium', trend: 'Stable' });
      score += 1;
    }

    const highRiskMeds = patient.medications?.filter(m => m.isHighAlert) || [];
    if (highRiskMeds.length > 0) {
      insights.push({ 
        factor: `Uso de fármacos de alto risco (Anticoagulantes/Psicotrópicos)`, 
        impact: 'High', 
        trend: 'Stable' 
      });
      score += highRiskMeds.length * 1.5;
    }

    // 4. COGNIÇÃO E PATOLOGIAS DE MARCHA
    const isCognitive = patient.pathologies.some(p => ['Alzheimer', 'Parkinson'].includes(p)) || 
                        patient.condicoesClinicasGerais.toLowerCase().includes('cognitivo');
    
    if (isCognitive) {
      insights.push({ factor: 'Diagnóstico de base com impacto em equilíbrio/cognição', impact: 'Medium', trend: 'Stable' });
      score += 2;
    }

    // 5. CLASSIFICAÇÃO FINAL
    let level: 'Baixo' | 'Moderado' | 'Alto' = 'Baixo';
    let probability = 'Mínima (<15%)';

    if (score >= 10) {
      level = 'Alto';
      probability = 'Crítica (>70%)';
    } else if (score >= 5) {
      level = 'Moderado';
      probability = 'Relevante (30-60%)';
    }

    return {
      score,
      level,
      insights,
      probabilityEstimate: probability,
      lastAnalysis: new Date().toISOString()
    };
  }
};
