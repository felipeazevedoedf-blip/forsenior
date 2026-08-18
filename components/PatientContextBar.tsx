
import React from 'react';
import { Patient } from '../types';
import { IconUsers, IconX } from './icons';

interface PatientContextBarProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
}

// Seção 5 do Prompt Mestre: o sistema nunca deve exibir um paciente como
// selecionado quando nenhum estiver, e o paciente em contexto precisa ficar
// visível e trocável em todas as telas.
const PatientContextBar: React.FC<PatientContextBarProps> = ({ patients, selectedPatientId, onSelectPatient }) => {
  const selected = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl border bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700/50 shadow-[0_6px_18px_-10px_rgba(13,79,106,0.2)]">
      {selected ? (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#12608A] to-deepBlue dark:from-sky-400 dark:to-sky-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-deepBlue/25">
            {selected.nomeCompleto.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Paciente em contexto</p>
            <p className="text-sm font-bold text-textDark dark:text-slate-100 truncate">{selected.nomeCompleto}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-400 flex items-center justify-center shrink-0">
            <IconUsers className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Contexto de paciente</p>
            <p className="text-sm font-bold text-gray-400">Nenhum paciente selecionado</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        <select
          className="px-3 py-2 rounded-xl border-2 border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs font-bold text-deepBlue dark:text-sky-400 outline-none max-w-[200px]"
          value={selectedPatientId}
          onChange={e => onSelectPatient(e.target.value)}
        >
          <option value="">Selecionar paciente...</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
        </select>
        {selected && (
          <button
            onClick={() => onSelectPatient('')}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Sair do contexto"
          >
            <IconX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientContextBar;
