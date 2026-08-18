
export const UserRole = {
  ADMIN: 'ADMIN',
  PROFESSIONAL: 'PROFESSIONAL',
  VIEWER: 'VIEWER'
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export type User = {
  id: string;
  clinicId: string;
  name: string;
  role: UserRole;
  email: string;
};

export type TimelineEventType = 
  | 'REGISTRATION'      
  | 'FUNCTIONAL_TEST'   
  | 'MACRO_GOAL'        
  | 'MICRO_GOAL'        
  | 'ATTENDANCE'        
  | 'CRITICAL_EVENT'    
  | 'LGPD_UPDATE'       
  | 'DOCUMENT_UPLOAD'   
  | 'CLINICAL_NOTE'
  | 'ENVIRONMENTAL_CHECK'
  | 'MEDICATION_CHANGE'
  | 'MEDICATION_ADHERENCE'; // Novo tipo

export type PatientTimelineEvent = {
  id: string;
  patientId: string;
  clinicId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  professionalName?: string;
  professionalId?: string;
  referenceId?: string; 
  metadata?: any;       
};

export type MedicationStatus = 'taken' | 'missed' | 'delayed' | 'snoozed';

export type MedicationLog = {
  id: string;
  medicationId: string;
  patientId: string;
  scheduledTime: string;
  actualTime?: string;
  status: MedicationStatus;
  date: string; // YYYY-MM-DD
};

export type MedicationRoute = 'Oral' | 'Injetável' | 'Tópica' | 'Inalatória' | 'Oftálmica' | 'Retal' | 'Outros';

export type Medication = {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  times: string[]; 
  frequency: string;
  route: MedicationRoute;
  startDate: string;
  endDate?: string;
  isHighAlert: boolean; 
  notes?: string;
  active: boolean;
  gracePeriodMinutes?: number; // Tempo até avisar o cuidador (padrão 30)
};

export type Patient = {
  id: string;
  clinicId: string;
  nomeCompleto: string;
  dataNascimento: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  endereco: string;
  contatoEmergencia: string;
  condicoesClinicasGerais: string;
  observacoesGerais: string;
  profissionalResponsavel: string;
  cpf: string; 
  sexo?: 'Masculino' | 'Feminino' | 'Outro';
  pathologies: string[];
  medications?: Medication[];
  allergies?: string;
  bloodType?: string;
  consentimentoLGPD: boolean;
  attachments: string[];
  createdAt: string;
};

// ... demais tipos permanecem iguais
export type VitalSignType = 'HeartRate' | 'SpO2' | 'Steps' | 'Temperature' | 'FallAlert' | 'BloodPressure' | 'RespiratoryRate' | 'Glucose';
export type VitalSign = { id: string; patientId: string; type: VitalSignType; value: string | number; timestamp: string; source: 'Manual' | 'Wearable'; };
export type CareTaskStatus = 'pending' | 'completed' | 'skipped';
export type CareTask = { id: string; patientId: string; title: string; time: string; category: string; status: CareTaskStatus; notes?: string; performedBy?: string; };
export type ChatMessage = { id: string; senderId: string; senderName: string; text: string; timestamp: string; roomId: string; };
export type ChatRoom = { id: string; clinicId: string; name: string; type: 'group' | 'individual'; participants: string[]; lastMessage?: string; };
export type ClinicalReport = { id: string; patientId: string; patientName: string; fileName: string; fileSize: string; uploadDate: string; category: string; url: string; };
export type Professional = { id: string; clinicId: string; name: string; expertise: string; areaAtuacao: string; registroProfissional: string; phone: string; email: string; active: boolean; googleConnected?: boolean; sbvAtivo?: boolean; sbvVencimento?: string; };
export const AppointmentStatus = { SCHEDULED: 'Agendado', COMPLETED: 'Realizado', ABSENT: 'Falta', RESCHEDULED: 'Reagendado' } as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
export type AppointmentServiceType = 'Físio' | 'Cuidador' | 'Conversa' | 'Médico' | 'Avaliação' | 'Beleza' | 'Outros';
export type Appointment = { id: string; clinicId: string; patientId: string; patientName: string; professionalId: string; professionalName: string; date: string; time: string; duration: number; type: AppointmentServiceType; status: AppointmentStatus; notes: string; createdAt: string; };
export const MacroGoalStatus = { PLANNED: 'Planejado', IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluído', REVALUATED: 'Reavaliado' } as const;
export type MacroGoalStatus = (typeof MacroGoalStatus)[keyof typeof MacroGoalStatus];
export const MicroGoalStatus = { PLANNED: 'Planejado', EXECUTING: 'Em execução', ACHIEVED: 'Atingido', ADJUSTED: 'Ajustado', NOT_ACHIEVED: 'Não atingido' } as const;
export type MicroGoalStatus = (typeof MicroGoalStatus)[keyof typeof MicroGoalStatus];
export type MacroGoal = { id: string; clinicId: string; patientId: string; title: string; description: string; justification: string; startDate: string; reEvaluationDate: string; professionalId: string; professionalName: string; status: MacroGoalStatus; createdAt: string; };
export type MicroGoal = { id: string; macroGoalId: string; title: string; durationWeeks: number; successCriteria: string; actions: string; professionalId: string; professionalName: string; status: MicroGoalStatus; createdAt: string; };
export type FunctionalTest = { id: string; patientId: string; date: string; type: string; value: number; notes?: string; };
export type EnvironmentalAssessment = { id: string; patientId: string; date: string; professionalId: string; professionalName: string; rooms: any; generalNotes: string; };
export type AuditLogEntry = { field: string; oldValue: any; newValue: any; };
export type FamilyAssessment = { id: string; patientId: string; patientName: string; respondentName: string; relationship: string; date: string; answers: Record<string, string>; observations: string; consent: any; };
export type ProfessionalLog = { id: string; professionalId: string; professionalName: string; changedByUserId: string; changedByUserName: string; timestamp: string; action: string; changes?: AuditLogEntry[]; };
export type PatientLog = { id: string; patientId: string; changedByUserId: string; changedByUserName: string; timestamp: string; action: string; changes?: AuditLogEntry[]; };

// Portal da Família: todo acesso precisa ser previamente cadastrado e aprovado
// pelo Administrador da clínica — ninguém entra apenas escolhendo um paciente.
export type FamilyAccessStatus = 'pending' | 'approved' | 'denied';
export type FamilyAccessRequest = {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  requesterName: string;
  relationship: string;
  phone: string;
  accessCode: string;
  status: FamilyAccessStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedByUserId?: string;
  decidedByUserName?: string;
};
