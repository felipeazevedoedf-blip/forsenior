
import React, { useEffect, useRef } from 'react';
import { Card, Button, Badge } from './ui';
import { Medication, MedicationStatus } from '../types';

interface MedicationAlarmProps {
  medication: Medication;
  time: string;
  onAction: (status: MedicationStatus) => void;
}

const MedicationAlarm: React.FC<MedicationAlarmProps> = ({ medication, time, onAction }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Som de alerta (Simulado por oscilador se não houver arquivo)
    const playAlarm = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        
        // Beep intermitente
        const interval = setInterval(() => {
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          setTimeout(() => gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.1), 200);
        }, 1000);

        return () => {
          clearInterval(interval);
          oscillator.stop();
        };
      } catch (e) {
        console.warn("Audio Context falhou:", e);
      }
    };

    const stopAlarm = playAlarm();
    return () => stopAlarm && stopAlarm();
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-red-600/90 backdrop-blur-md p-4 animate-pulse-slow">
      <Card className="w-full max-w-lg bg-white shadow-2xl border-none overflow-hidden transform scale-110">
        <div className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-5xl animate-bounce">
              💊
            </div>
          </div>
          
          <div>
            <h2 className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2">Hora do Medicamento</h2>
            <h1 className="text-4xl font-black text-[#0D4F6A] poppins leading-tight">{medication.name}</h1>
            <p className="text-xl font-bold text-gray-500 mt-2">{medication.dosage} • {medication.route}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm font-medium text-gray-600 italic">"{medication.notes || 'Nenhuma recomendação especial.'}"</p>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
             <button 
              onClick={() => onAction('taken')}
              className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-3xl text-2xl font-black shadow-xl shadow-green-900/20 transition-all active:scale-95"
             >
               ✅ JÁ TOMEI
             </button>
             
             <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => onAction('snoozed')}
                className="py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all"
               >
                 ⏳ EM 10 MIN
               </button>
               <button 
                onClick={() => onAction('missed')}
                className="py-4 bg-gray-200 hover:bg-gray-300 text-gray-500 rounded-2xl text-sm font-black uppercase tracking-widest transition-all"
               >
                 ❌ NÃO TOMEI
               </button>
             </div>
          </div>
          
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Atraso: O cuidador será avisado se não confirmado.
          </p>
        </div>
      </Card>
      
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MedicationAlarm;
