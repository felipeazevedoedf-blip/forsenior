
import { Patient, User, UserRole, FunctionalTest, Appointment, Professional, AppointmentStatus, ClinicalReport, MacroGoal, MicroGoal, MacroGoalStatus, MicroGoalStatus, ChatMessage, ChatRoom, CareTask, VitalSign, ProfessionalLog, PatientLog, FamilyAssessment, PatientTimelineEvent, EnvironmentalAssessment, Medication, MedicationLog } from '../types';

const STORE_KEY = 'forsenior_care_db';

type DB = {
  currentUser: User | null;
  patients: Patient[];
  macroGoals: MacroGoal[];
  microGoals: MicroGoal[];
  tests: FunctionalTest[];
  appointments: Appointment[];
  professionals: Professional[];
  reports: ClinicalReport[];
  messages: ChatMessage[];
  chatRooms: ChatRoom[];
  careTasks: CareTask[];
  vitalSigns: VitalSign[];
  professionalLogs: ProfessionalLog[];
  patientLogs: PatientLog[];
  familyAssessments: FamilyAssessment[];
  timelineEvents: PatientTimelineEvent[];
  environmentalAssessments: EnvironmentalAssessment[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
};

const INITIAL_DB: DB = {
  currentUser: null,
  patients: [
    {
      id: '1',
      clinicId: 'FS-01',
      nomeCompleto: 'Manoel da Silva Sauro',
      dataNascimento: '1945-05-12',
      sexo: 'Masculino',
      nomeResponsavel: 'Maria Sauro',
      telefoneResponsavel: '(11) 98888-7777',
      endereco: 'Rua das Flores, 123, São Paulo - SP',
      contatoEmergencia: 'João Sauro (11) 97777-6666',
      condicoesClinicasGerais: 'Hipertensão controlada, início de déficit cognitivo leve.',
      observacoesGerais: 'Paciente calmo, gosta de música clássica.',
      profissionalResponsavel: 'Dra. Helena Costa',
      cpf: '123.456.789-00',
      pathologies: ['Hipertensão', 'Diabetes Mellitus', 'Osteoporose'],
      allergies: 'Penicilina, Corantes Vermelhos',
      bloodType: 'O+',
      consentimentoLGPD: true,
      attachments: [],
      createdAt: '2024-01-01T10:00:00Z'
    }
  ],
  professionals: [
    { id: 'p1', clinicId: 'FS-01', name: 'Dra. Helena Costa', expertise: 'Geriatria', areaAtuacao: 'Acompanhamento Clínico', registroProfissional: 'CRM-SP 123456', phone: '(11) 91234-5678', email: 'helena@forsenior.com', active: true, googleConnected: false },
    { id: 'p2', clinicId: 'FS-01', name: 'Dr. Lucas Mendes', expertise: 'Fisioterapia Geriátrica', areaAtuacao: 'Reabilitação Motora', registroProfissional: 'CREFITO-3 78910', phone: '(11) 98765-4321', email: 'lucas@forsenior.com', active: true, googleConnected: false }
  ],
  macroGoals: [],
  microGoals: [],
  tests: [],
  appointments: [],
  reports: [],
  messages: [],
  chatRooms: [{ id: 'team-global', clinicId: 'FS-01', name: 'Canal da Equipe', type: 'group', participants: [] }],
  careTasks: [],
  vitalSigns: [],
  professionalLogs: [],
  patientLogs: [],
  familyAssessments: [],
  timelineEvents: [],
  environmentalAssessments: [],
  medications: [
    { id: 'med-1', patientId: '1', name: 'Losartana', dosage: '50mg', times: ['08:00', '20:00'], frequency: '2x ao dia', route: 'Oral', startDate: '2024-01-01', isHighAlert: false, active: true },
    { id: 'med-2', patientId: '1', name: 'Varfarina', dosage: '5mg', times: ['18:00'], frequency: '1x ao dia', route: 'Oral', startDate: '2024-01-01', isHighAlert: true, active: true }
  ],
  medicationLogs: []
};

const getDB = (): DB => {
  const data = localStorage.getItem(STORE_KEY);
  return data ? JSON.parse(data) : INITIAL_DB;
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(db));
};

export const store = {
  getCurrentUser: () => getDB().currentUser,
  setCurrentUser: (user: User | null) => {
    const db = getDB();
    db.currentUser = user;
    saveDB(db);
  },

  getPatients: () => getDB().patients,
  getPatientById: (id: string) => getDB().patients.find(p => p.id === id),
  addPatient: (patient: Patient) => {
    const db = getDB();
    db.patients.push(patient);
    saveDB(db);
  },
  updatePatient: (updated: Patient) => {
    const db = getDB();
    db.patients = db.patients.map(p => p.id === updated.id ? updated : p);
    saveDB(db);
  },

  getTimelineEvents: (patientId: string) => getDB().timelineEvents.filter(e => e.patientId === patientId),
  addTimelineEvent: (event: PatientTimelineEvent) => {
    const db = getDB();
    db.timelineEvents.push(event);
    saveDB(db);
  },

  getMacroGoals: (patientId?: string) => {
    const db = getDB();
    return patientId ? db.macroGoals.filter(g => g.patientId === patientId) : db.macroGoals;
  },
  addMacroGoal: (goal: MacroGoal) => {
    const db = getDB();
    db.macroGoals.push(goal);
    saveDB(db);
  },
  updateMacroGoal: (updated: MacroGoal) => {
    const db = getDB();
    db.macroGoals = db.macroGoals.map(g => g.id === updated.id ? updated : g);
    saveDB(db);
  },

  getMicroGoals: (macroGoalId?: string) => {
    const db = getDB();
    return macroGoalId ? db.microGoals.filter(m => m.macroGoalId === macroGoalId) : db.microGoals;
  },
  addMicroGoal: (goal: MicroGoal) => {
    const db = getDB();
    db.microGoals.push(goal);
    saveDB(db);
  },
  updateMicroGoal: (updated: MicroGoal) => {
    const db = getDB();
    db.microGoals = db.microGoals.map(g => g.id === updated.id ? updated : g);
    saveDB(db);
  },

  getTests: (patientId: string) => getDB().tests.filter(t => t.patientId === patientId),
  addTest: (test: FunctionalTest) => {
    const db = getDB();
    db.tests.push(test);
    saveDB(db);
  },

  getProfessionals: () => getDB().professionals,
  getProfessionalById: (id: string) => getDB().professionals.find(p => p.id === id),
  addProfessional: (prof: Professional) => {
    const db = getDB();
    db.professionals.push(prof);
    saveDB(db);
  },
  updateProfessional: (updated: Professional) => {
    const db = getDB();
    db.professionals = db.professionals.map(p => p.id === updated.id ? updated : p);
    saveDB(db);
  },
  getAppointments: (filter?: { professionalId?: string, patientId?: string }) => {
    const db = getDB();
    let apps = db.appointments;
    if (filter?.professionalId) apps = apps.filter(a => a.professionalId === filter.professionalId);
    if (filter?.patientId) apps = apps.filter(a => a.patientId === filter.patientId);
    return apps;
  },
  addAppointment: (app: Appointment) => {
    const db = getDB();
    db.appointments.push(app);
    saveDB(db);
  },
  updateAppointment: (updated: Appointment) => {
    const db = getDB();
    db.appointments = db.appointments.map(a => a.id === updated.id ? updated : a);
    saveDB(db);
  },
  getReports: (patientId?: string) => {
    const db = getDB();
    return patientId ? db.reports.filter(r => r.patientId === patientId) : db.reports;
  },
  addReport: (report: ClinicalReport) => {
    const db = getDB();
    db.reports.push(report);
    saveDB(db);
  },
  deleteReport: (id: string) => {
    const db = getDB();
    db.reports = db.reports.filter(r => r.id !== id);
    saveDB(db);
  },
  getChatRooms: (userId: string) => getDB().chatRooms,
  getMessages: (roomId: string) => getDB().messages.filter(m => m.roomId === roomId),
  addMessage: (msg: ChatMessage) => {
    const db = getDB();
    db.messages.push(msg);
    saveDB(db);
  },
  findOrCreateIndividualRoom: (u1: string, u2: string, n1: string, n2: string) => {
    const db = getDB();
    let room = db.chatRooms.find(r => r.type === 'individual' && r.participants.includes(u1) && r.participants.includes(u2));
    if (!room) {
      room = { id: `ind-${Date.now()}`, clinicId: 'FS-01', name: n2, type: 'individual', participants: [u1, u2] };
      db.chatRooms.push(room);
      saveDB(db);
    }
    return room;
  },
  getCareTasks: (patientId: string) => getDB().careTasks.filter(t => t.patientId === patientId),
  updateCareTask: (task: CareTask) => {
    const db = getDB();
    db.careTasks = db.careTasks.map(t => t.id === task.id ? task : t);
    saveDB(db);
  },
  addCareTask: (task: CareTask) => {
    const db = getDB();
    db.careTasks.push(task);
    saveDB(db);
  },
  getVitalSigns: (patientId: string) => getDB().vitalSigns.filter(s => s.patientId === patientId),
  getProfessionalLogs: (profId: string) => getDB().professionalLogs.filter(l => l.professionalId === profId),
  addProfessionalLog: (log: ProfessionalLog) => {
    const db = getDB();
    db.professionalLogs.push(log);
    saveDB(db);
  },
  getPatientLogs: (patientId: string) => getDB().patientLogs.filter(l => l.patientId === patientId),
  addPatientLog: (log: PatientLog) => {
    const db = getDB();
    db.patientLogs.push(log);
    saveDB(db);
  },
  getFamilyAssessments: (patientId: string) => getDB().familyAssessments.filter(f => f.patientId === patientId),
  addFamilyAssessment: (fa: FamilyAssessment) => {
    const db = getDB();
    db.familyAssessments.push(fa);
    saveDB(db);
  },
  getEnvironmentalAssessments: (patientId: string) => {
    const db = getDB();
    return db.environmentalAssessments.filter(a => a.patientId === patientId);
  },
  addEnvironmentalAssessment: (assessment: EnvironmentalAssessment) => {
    const db = getDB();
    db.environmentalAssessments.push(assessment);
    saveDB(db);
  },

  // --- MEDICAMENTOS ---
  getMedications: (patientId: string) => {
    const db = getDB();
    return db.medications.filter(m => m.patientId === patientId);
  },
  addMedication: (med: Medication, userName: string) => {
    const db = getDB();
    db.medications.push(med);
    saveDB(db);
  },
  updateMedication: (updated: Medication, userName: string) => {
    const db = getDB();
    db.medications = db.medications.map(m => m.id === updated.id ? updated : m);
    saveDB(db);
  },
  deleteMedication: (id: string, patientId: string, userName: string) => {
    const db = getDB();
    db.medications = db.medications.filter(m => m.id !== id);
    saveDB(db);
  },

  // --- LOGS DE MEDICAÇÃO ---
  getMedicationLogs: (patientId: string, date?: string) => {
    const db = getDB();
    if (date) {
      return db.medicationLogs.filter(l => l.patientId === patientId && l.date === date);
    }
    return db.medicationLogs.filter(l => l.patientId === patientId);
  },
  addMedicationLog: (log: MedicationLog) => {
    const db = getDB();
    db.medicationLogs = db.medicationLogs.filter(l => !(l.medicationId === log.medicationId && l.scheduledTime === log.scheduledTime && l.date === log.date));
    db.medicationLogs.push(log);
    
    if (log.status === 'taken') {
      const med = db.medications.find(m => m.id === log.medicationId);
      db.timelineEvents.push({
        id: `tl-med-${Date.now()}`,
        patientId: log.patientId,
        clinicId: 'FS-01',
        type: 'MEDICATION_ADHERENCE',
        title: `Medicamento Tomado: ${med?.name}`,
        description: `Dose de ${med?.dosage} administrada às ${log.actualTime}.`,
        timestamp: new Date().toISOString()
      });
    }
    saveDB(db);
  }
};
