
import { EnvironmentalAssessment, Patient, FunctionalTest, Medication } from '../types';

export type RoomRisk = {
  room: string;
  score: number;
  level: 'Baixo' | 'Moderado' | 'Alto';
  issues: string[];
};

export type EnvironmentalAnalysis = {
  overallScore: number;
  overallLevel: 'Baixo' | 'Moderado' | 'Alto';
  roomRisks: RoomRisk[];
  recommendations: string[];
};

const WEIGHTS: Record<string, number> = {
  'Tapetes soltos': 2,
  'Falta de barras de apoio': 3,
  'Piso escorregadio': 3,
  'Iluminação insuficiente': 2,
  'Móveis instáveis': 2,
  'Desníveis/Degraus': 2,
  'Obstáculos no caminho': 1,
  'Dificuldade de acesso': 2,
  'Cama muito alta/baixa': 2,
  'Falta de luz noturna': 1
};

export const environmentalService = {
  analyze: (
    assessment: EnvironmentalAssessment,
    patient: Patient,
    tests: FunctionalTest[]
  ): EnvironmentalAnalysis => {
    const roomRisks: RoomRisk[] = [];
    const recommendations: string[] = [];
    let totalPoints = 0;

    // Fatores agravantes do paciente
    const tug = tests.filter(t => t.type === 'TUG').sort((a,b) => b.date.localeCompare(a.date))[0];
    const highFragility = (tug && tug.value > 15) || patient.pathologies.includes('Parkinson');
    const polypharmacy = (patient.medications?.length || 0) >= 5;

    const analyzeRoom = (name: string, items: string[]) => {
      let roomPoints = 0;
      items.forEach(item => {
        let p = WEIGHTS[item] || 1;
        // Agrava se o paciente for frágil
        if (highFragility) p *= 1.5;
        roomPoints += p;
      });

      const level = roomPoints >= 6 ? 'Alto' : roomPoints >= 3 ? 'Moderado' : 'Baixo';
      roomRisks.push({ room: name, score: roomPoints, level, issues: items });
      totalPoints += roomPoints;
    };

    analyzeRoom('Quarto', assessment.rooms.bedroom);
    analyzeRoom('Banheiro', assessment.rooms.bathroom);
    analyzeRoom('Cozinha', assessment.rooms.kitchen);
    analyzeRoom('Circulação', assessment.rooms.circulation);
    analyzeRoom('Iluminação', assessment.rooms.lighting);
    analyzeRoom('Dispositivos', assessment.rooms.supports);

    // Gerar Recomendações
    if (assessment.rooms.bathroom.includes('Falta de barras de apoio')) {
      recommendations.push("Instalar barras de apoio no box e próximo ao vaso sanitário com urgência.");
    }
    if (assessment.rooms.lighting.includes('Iluminação insuficiente') || assessment.rooms.lighting.includes('Falta de luz noturna')) {
      recommendations.push("Utilizar sensores de movimento para luz noturna no trajeto entre quarto e banheiro.");
    }
    if (totalPoints > 10) {
      recommendations.push("Considerar reorganização layout dos móveis para criar canais livres de circulação.");
    }
    if (highFragility && assessment.rooms.circulation.includes('Tapetes soltos')) {
      recommendations.push("⚠️ CRÍTICO: Remover imediatamente todos os tapetes sem fixação antiderrapante.");
    }

    const overallLevel = totalPoints >= 15 ? 'Alto' : totalPoints >= 7 ? 'Moderado' : 'Baixo';

    return {
      overallScore: totalPoints,
      overallLevel,
      roomRisks,
      recommendations: recommendations.slice(0, 5)
    };
  }
};
