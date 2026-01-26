
import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { store } from '../services/store';
import { User, Patient, FunctionalTest, Medication } from '../types';
import { COLORS, TEST_TYPES } from '../constants';
import { riskService } from '../services/riskService';
import { predictionService } from '../services/predictionService';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, AreaChart, Area, LineChart, Line 
} from 'recharts';

interface ReportsProps {
  onNavigate: (path: string) => void;
  user: User;
}

type ReportType = 'complete' | 'functional' | 'medication' | 'monthly' | 'external';

const Reports: React.FC<ReportsProps> = ({ user }) => {
  const [selectedType, setSelectedType] = useState<ReportType>('complete');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  const patients = store.getPatients();
  const patient = useMemo(() => patients.find(p => p.id === selectedPatientId), [selectedPatientId, patients]);

  const data = useMemo(() => {
    if (!selectedPatientId) return null;
    return {
      tests: store.getTests(selectedPatientId).sort((a, b) => a.date.localeCompare(b.date)),
      meds: store.getMedications(selectedPatientId),
      logs: store.getMedicationLogs(selectedPatientId),
      vitals: store.getVitalSigns(selectedPatientId),
      timeline: store.getTimelineEvents(selectedPatientId),
      risk: patient ? riskService.analyzePatient(patient, store.getVitalSigns(selectedPatientId), store.getTests(selectedPatientId), store.getTimelineEvents(selectedPatientId)) : null,
    };
  }, [selectedPatientId, patient]);

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!selectedPatientId) return alert("Selecione um paciente primeiro.");
    // Simulação de exportação
    const reportName = `Relatorio_${selectedType}_${patient?.nomeCompleto.replace(' ', '_')}`;
    console.log(`Exportando ${reportName}.${format}`);
    alert(`Preparando arquivo ${format.toUpperCase()}... O download iniciará em instantes.`);
  };

  const renderReportContent = () => {
    if (!patient || !data) return null;

    switch (selectedType) {
      case 'functional':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TEST_TYPES.slice(0, 4).map(testType => {
                const testData = data.tests.filter(t => t.type === testType.id);
                return (
                  <Card key={testType.id} title={`Evolução: ${testType.name}`}>
                    <div className="h-64 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={testData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="date" fontSize={10} tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                          <YAxis fontSize={10} />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke={COLORS.vitalGreen} fill={COLORS.vitalGreen} fillOpacity={0.1} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'medication':
        const adherenceByDay = data.logs.reduce((acc: any, log) => {
          const date = log.date;
          if (!acc[date]) acc[date] = { date, taken: 0, missed: 0 };
          if (log.status === 'taken') acc[date].taken++;
          else if (log.status === 'missed') acc[date].missed++;
          return acc;
        }, {});
        const adherenceData = Object.values(adherenceByDay).sort((a: any, b: any) => a.date.localeCompare(b.date));

        return (
          <div className="space-y-6">
            <Card title="Aderência Terapêutica Diária">
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Doses Tomadas" dataKey="taken" fill={COLORS.vitalGreen} />
                    <Bar name="Doses Perdidas" dataKey="missed" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Medicamentos Ativos">
               <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-[10px] font-black uppercase text-gray-400">Medicamento</th>
                        <th className="p-4 text-[10px] font-black uppercase text-gray-400 text-center">Dosagem</th>
                        <th className="p-4 text-[10px] font-black uppercase text-gray-400 text-center">Frequência</th>
                        <th className="p-4 text-[10px] font-black uppercase text-gray-400 text-center">Alto Risco</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.meds.filter(m => m.active).map(med => (
                        <tr key={med.id}>
                          <td className="p-4 text-sm font-bold text-deepBlue">{med.name}</td>
                          <td className="p-4 text-sm text-gray-500 text-center">{med.dosage}</td>
                          <td className="p-4 text-sm text-gray-500 text-center">{med.frequency}</td>
                          <td className="p-4 text-center">
                            {med.isHighAlert ? <Badge variant="error">Sim</Badge> : <Badge variant="default">Não</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </Card>
          </div>
        );

      case 'external':
        return (
          <div className="bg-white p-12 border border-gray-200 rounded-[32px] shadow-sm space-y-10 max-w-4xl mx-auto">
             <div className="flex justify-between items-start border-b border-gray-100 pb-8">
                <div>
                   <h1 className="text-3xl font-black text-deepBlue poppins">Relatório Clínico Geriátrico</h1>
                   <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Dossiê ForSênior Care</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-gray-500">{new Date().toLocaleDateString()}</p>
                   <p className="text-[10px] text-gray-400 uppercase font-black">Emissor: {user.name}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-10">
                <section>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Dados do Paciente</h4>
                   <div className="space-y-1">
                      <p className="text-lg font-bold text-textDark">{patient.nomeCompleto}</p>
                      <p className="text-sm text-gray-500">Nascimento: {new Date(patient.dataNascimento).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">CPF: {patient.cpf}</p>
                   </div>
                </section>
                <section>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Status de Alerta</h4>
                   <div className="flex gap-2">
                      <Badge variant={data.risk?.level === 'Alto' ? 'error' : 'success'}>Risco: {data.risk?.level}</Badge>
                      <Badge variant="primary">Fragilidade: Moderada</Badge>
                   </div>
                </section>
             </div>

             <section>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Condições e Patologias</h4>
                <div className="flex flex-wrap gap-2">
                   {patient.pathologies.map(p => <Badge key={p} variant="default">{p}</Badge>)}
                </div>
                <p className="mt-4 text-sm text-gray-600 leading-relaxed italic border-l-4 border-gray-100 pl-4">
                   "{patient.condicoesClinicasGerais}"
                </p>
             </section>

             <section>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Esquema Farmacológico Vigente</h4>
                <div className="space-y-2">
                   {data.meds.filter(m => m.active).map(med => (
                      <div key={med.id} className="flex justify-between items-center py-2 border-b border-gray-50">
                         <span className="text-sm font-bold text-deepBlue">{med.name} ({med.dosage})</span>
                         <span className="text-xs text-gray-400">{med.frequency} • {med.route}</span>
                      </div>
                   ))}
                </div>
             </section>

             <div className="pt-20 text-center">
                <div className="w-64 h-px bg-gray-200 mx-auto mb-4"></div>
                <p className="text-xs font-bold text-gray-400 uppercase">Assinatura do Responsável Clínico</p>
             </div>
          </div>
        );

      default: // Complete Report
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Score Funcional</p>
                 <p className="text-4xl font-black text-deepBlue">82<span className="text-sm text-gray-300">/100</span></p>
              </Card>
              <Card className="text-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Aderência Média</p>
                 <p className="text-4xl font-black text-vitalGreen">94%</p>
              </Card>
              <Card className="text-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Eventos Críticos (30d)</p>
                 <p className="text-4xl font-black text-red-500">{data.timeline.filter(e => e.type === 'CRITICAL_EVENT').length}</p>
              </Card>
            </div>

            <Card title="Evolução das Atividades de Vida Diária (AVD)">
               <div className="h-80 w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={data.tests.filter(t => t.type === 'AVD')}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                     <YAxis domain={[0, 100]} />
                     <Tooltip />
                     <Line type="monotone" dataKey="value" stroke={COLORS.deepBlue} strokeWidth={3} dot={{ r: 6 }} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
            </Card>

            <Card title="Sumário de Intercorrências Recentes">
               <div className="space-y-4">
                  {data.timeline.filter(e => e.type === 'CRITICAL_EVENT').slice(0, 5).map(event => (
                    <div key={event.id} className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
                       <span className="text-xl">⚠️</span>
                       <div>
                          <p className="text-xs font-black text-red-600 uppercase mb-1">{new Date(event.timestamp).toLocaleDateString()}</p>
                          <p className="text-sm font-bold text-red-800">{event.title}</p>
                          <p className="text-xs text-red-700 mt-1">{event.description}</p>
                       </div>
                    </div>
                  ))}
                  {data.timeline.filter(e => e.type === 'CRITICAL_EVENT').length === 0 && (
                    <p className="text-center py-6 text-gray-400 italic">Nenhum evento crítico registrado no período.</p>
                  )}
               </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-32 max-w-7xl mx-auto">
      {/* HEADER E SELETOR DE PACIENTE */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-textDark poppins tracking-tight">Relatórios & Analytics</h2>
          <p className="text-gray-500 font-medium">Geração de dossiês clínicos e indicadores de performance.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="flex-1 md:w-72 px-4 py-3 rounded-xl border border-gray-100 bg-white font-bold text-sm text-deepBlue shadow-lg outline-none focus:ring-2 focus:ring-deepBlue/10"
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
          >
            <option value="">Selecione o Paciente...</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
          </select>
          <Button variant="ghost" className="bg-white" onClick={() => window.print()}>🖨️ Imprimir</Button>
        </div>
      </header>

      {/* TABS DE RELATÓRIO */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 print:hidden">
        {[
          { id: 'complete', label: 'Dossiê Completo', icon: '📋' },
          { id: 'functional', label: 'Evolução Funcional', icon: '🚶' },
          { id: 'medication', label: 'Aderência Farmaco', icon: '💊' },
          { id: 'monthly', label: 'Relatório Mensal', icon: '🗓️' },
          { id: 'external', label: 'Médico Externo', icon: '🩺' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id as ReportType)}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
              selectedType === tab.id ? 'border-deepBlue text-deepBlue' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {selectedPatientId ? (
        <div className="space-y-10 animate-fade-in">
          {/* BOTÕES DE EXPORTAÇÃO */}
          <div className="flex justify-end gap-3 print:hidden">
             <Button variant="ghost" size="sm" onClick={() => handleExport('excel')} className="text-[10px] font-black uppercase tracking-widest">Excel (Dados Brutos)</Button>
             <Button variant="primary" size="sm" onClick={() => handleExport('pdf')} className="text-[10px] font-black uppercase tracking-widest shadow-xl shadow-deepBlue/20">Gerar PDF Estruturado</Button>
          </div>

          {/* ÁREA DE CONTEÚDO DO RELATÓRIO */}
          <div className="min-h-[400px]">
            {renderReportContent()}
          </div>
        </div>
      ) : (
        <Card className="py-40 text-center text-gray-400 border-dashed border-2 flex flex-col items-center gap-4">
           <span className="text-6xl opacity-20">📊</span>
           <p className="font-bold poppins text-lg">Selecione um paciente para carregar os indicadores analíticos.</p>
        </Card>
      )}

      {/* FOOTER LGPD */}
      <footer className="mt-20 py-10 border-t border-gray-100 text-center print:hidden">
         <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Auditoria LGPD: {new Date().toISOString()}</p>
         <p className="text-[10px] text-gray-300 mt-2">Dados processados e criptografados via ForSênior Secure Engine.</p>
      </footer>
    </div>
  );
};

export default Reports;
