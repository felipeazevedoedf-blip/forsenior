
import React, { useState, useEffect } from 'react';
import { Card, Badge } from '../components/ui';
import { store } from '../services/store';
import { VitalSign, Patient, User } from '../types';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

const Wearables: React.FC<{ user: User }> = ({ user }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const patients = store.getPatients();

  useEffect(() => {
    if (selectedPatientId) {
      // Gerar dados fake em tempo real para demonstração
      const interval = setInterval(() => {
        const newSign: VitalSign = {
          id: Date.now().toString(),
          patientId: selectedPatientId,
          type: 'HeartRate',
          value: Math.floor(Math.random() * (85 - 65 + 1)) + 65,
          timestamp: new Date().toISOString(),
          source: 'Wearable'
        };
        setVitals(prev => [...prev.slice(-20), newSign]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedPatientId]);

  const latest = vitals[vitals.length - 1];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0D4F6A] poppins">⌚ Monitoramento Vital</h2>
          <p className="text-gray-500">Dados em tempo real de smartwatches e sensores IoT.</p>
        </div>
        <select 
          className="px-4 py-2 rounded-xl border border-gray-200 outline-none bg-white font-bold text-sm"
          value={selectedPatientId}
          onChange={e => setSelectedPatientId(e.target.value)}
        >
          <option value="">Selecione o Paciente...</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
        </select>
      </div>

      {!selectedPatientId ? (
        <Card className="py-20 text-center text-gray-400">
          <span className="text-5xl block mb-4">💤</span>
          <p className="font-bold poppins">Aguardando conexão com dispositivo.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Principal de Frequência Cardíaca */}
          <Card className="lg:col-span-2 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-bold text-[#0D4F6A] poppins">Frequência Cardíaca</h3>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest animate-pulse">● Conectado via ForSênior Watch</p>
              </div>
              <div className="text-right">
                <span className="text-5xl font-black text-[#0D4F6A]">{latest?.value || '--'}</span>
                <span className="text-xs font-bold text-gray-400 ml-1">BPM</span>
              </div>
            </div>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals}>
                  <YAxis hide domain={[50, 100]} />
                  <Tooltip labelStyle={{ display: 'none' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#EF4444" 
                    strokeWidth={4} 
                    dot={false} 
                    animationDuration={300}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Outros Sensores */}
          <div className="space-y-6">
            <Card className="bg-blue-50 border-none">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-black text-blue-800 uppercase">Oxigenação (SpO2)</p>
                <Badge variant="success">98%</Badge>
              </div>
              <div className="w-full bg-white h-2 rounded-full">
                <div className="bg-blue-500 h-full w-[98%] rounded-full"></div>
              </div>
            </Card>

            <Card className="bg-yellow-50 border-none">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-black text-yellow-800 uppercase">Temperatura</p>
                <Badge variant="default">36.4 °C</Badge>
              </div>
              <p className="text-xs text-yellow-700 font-bold">Estável dentro da média do paciente.</p>
            </Card>

            <Card className="border-red-100 bg-red-50/30">
              <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">Segurança</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">🛡️</div>
                <div>
                  <p className="text-xs font-bold text-[#33383D]">Detecção de Queda</p>
                  <p className="text-[10px] text-green-600 font-bold uppercase">Ativa & Monitorando</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wearables;
