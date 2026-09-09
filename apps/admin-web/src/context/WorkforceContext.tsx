import React, { createContext, useContext, useState } from 'react';
import {
  WorkerRecord,
  SkillRecord,
  CertificationRecord,
  CooperativeRecord,
  ReportRecord,
  INITIAL_WORKERS,
  INITIAL_SKILLS,
  INITIAL_CERTIFICATIONS,
  INITIAL_COOPERATIVES,
  INITIAL_VERIFICATION_QUEUE,
  INITIAL_REPORTS,
  SYSTEM_METRICS,
  MASTER_AVATARS,
} from '../data/workforceData';

export type ViewType =
  | 'dashboard'
  | 'workers'
  | 'worker-profile'
  | 'worker-onboarding'
  | 'skills'
  | 'skill-details'
  | 'add-skill'
  | 'edit-skill'
  | 'certs'
  | 'cert-details'
  | 'add-cert'
  | 'edit-cert'
  | 'cert-verify'
  | 'cooperatives'
  | 'coop-details'
  | 'coop-members'
  | 'add-coop'
  | 'edit-coop'
  | 'reports'
  | 'global-search'
  | 'empty-states'
  | 'loading-states'
  | 'error-states'
  | 'confirmation-dialogs'
  | 'success-notifications';

export interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

export interface ConfirmDialogOptions {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface WorkforceContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  navigate: (view: ViewType, entityId?: string) => void;

  // Selected Entities
  selectedWorkerId: string;
  setSelectedWorkerId: (id: string) => void;
  selectedSkillId: string;
  setSelectedSkillId: (id: string) => void;
  selectedCertId: string;
  setSelectedCertId: (id: string) => void;
  selectedCoopId: string;
  setSelectedCoopId: (id: string) => void;

  // Data Collections
  workers: WorkerRecord[];
  skills: SkillRecord[];
  certifications: CertificationRecord[];
  cooperatives: CooperativeRecord[];
  verificationQueue: CertificationRecord[];
  reports: ReportRecord[];

  // Mutations
  addSkill: (skill: Partial<SkillRecord>) => void;
  updateSkill: (id: string, updates: Partial<SkillRecord>) => void;
  deactivateSkill: (id: string) => void;

  addCertification: (cert: Partial<CertificationRecord>) => void;
  updateCertification: (id: string, updates: Partial<CertificationRecord>) => void;
  verifyCertification: (id: string, notes?: string) => void;
  renewCertification: (id: string, newExpiryDate: string) => void;
  revokeCertification: (id: string, reason: string) => void;

  addCooperative: (coop: Partial<CooperativeRecord>) => void;
  updateCooperative: (id: string, updates: Partial<CooperativeRecord>) => void;

  addWorker: (worker: Partial<WorkerRecord>) => void;
  updateWorker: (id: string, updates: Partial<WorkerRecord>) => void;
  deactivateWorker: (id: string) => void;

  generateReport: (category: string, title: string, format: 'PDF' | 'CSV' | 'Excel') => void;

  // Toasts & Alerts
  toasts: ToastItem[];
  addToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Confirm Dialog
  confirmDialog: ConfirmDialogOptions;
  openConfirmDialog: (options: Omit<ConfirmDialogOptions, 'isOpen'>) => void;
  closeConfirmDialog: () => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Metrics
  metrics: typeof SYSTEM_METRICS;
}

const WorkforceContext = createContext<WorkforceContextType | undefined>(undefined);

export const WorkforceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('WKR-8042');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('SKL-1042');
  const [selectedCertId, setSelectedCertId] = useState<string>('CRT-9921');
  const [selectedCoopId, setSelectedCoopId] = useState<string>('COOP-01');

  const [workers, setWorkers] = useState<WorkerRecord[]>(INITIAL_WORKERS);
  const [skills, setSkills] = useState<SkillRecord[]>(INITIAL_SKILLS);
  const [certifications, setCertifications] = useState<CertificationRecord[]>(INITIAL_CERTIFICATIONS);
  const [cooperatives, setCooperatives] = useState<CooperativeRecord[]>(INITIAL_COOPERATIVES);
  const [verificationQueue, setVerificationQueue] = useState<CertificationRecord[]>(INITIAL_VERIFICATION_QUEUE);
  const [reports, setReports] = useState<ReportRecord[]>(INITIAL_REPORTS);

  const [toasts, setToasts] = useState<ToastItem[]>([
    {
      id: 'toast-init',
      type: 'info',
      title: 'Workforce Core Synchronized',
      message: 'Active telemetry stream online across 18 regional cooperatives.',
      timestamp: 'Just now',
    },
  ]);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    isDestructive: false,
    onConfirm: () => {},
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  const navigate = (view: ViewType, entityId?: string) => {
    if (entityId) {
      if (view.includes('worker')) setSelectedWorkerId(entityId);
      if (view.includes('skill')) setSelectedSkillId(entityId);
      if (view.includes('cert')) setSelectedCertId(entityId);
      if (view.includes('coop')) setSelectedCoopId(entityId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastItem = { id, type, title, message, timestamp: 'Just now' };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openConfirmDialog = (options: Omit<ConfirmDialogOptions, 'isOpen'>) => {
    setConfirmDialog({ ...options, isOpen: true });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Skill Handlers
  const addSkill = (newSkillData: Partial<SkillRecord>) => {
    const id = 'SKL-' + (1000 + skills.length + 1);
    const code = newSkillData.code || `${(newSkillData.category || 'GEN').substring(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const skill: SkillRecord = {
      id,
      code,
      name: newSkillData.name || 'Untitled Skill',
      category: newSkillData.category || 'Technical & Systems',
      description: newSkillData.description || 'Enterprise competence description.',
      scopeOfPractice: newSkillData.scopeOfPractice || 'Operational guidelines.',
      status: (newSkillData.status as any) || 'active',
      totalWorkers: 0,
      verifiedWorkers: 0,
      proficiencyRubric: newSkillData.proficiencyRubric || {
        beginner: 'Baseline entry-level competence.',
        intermediate: 'Independent task completion.',
        advanced: 'Complex issue resolution.',
        expert: 'Master rubric evaluator and supervisor.',
      },
      requiredCertifications: newSkillData.requiredCertifications || [],
      workerLevelBreakdown: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
    };
    setSkills((prev) => [skill, ...prev]);
    addToast('success', 'Skill Created', `Skill ${skill.name} (${skill.code}) successfully added to catalog.`);
    navigate('skills');
  };

  const updateSkill = (id: string, updates: Partial<SkillRecord>) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addToast('success', 'Skill Updated', `Skill ${id} parameters have been updated.`);
    navigate('skill-details', id);
  };

  const deactivateSkill = (id: string) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'deprecated' } : s)));
    addToast('warning', 'Skill Deactivated', `Skill ${id} has been marked as deprecated/inactive.`);
    navigate('skills');
  };

  // Certification Handlers
  const addCertification = (newCert: Partial<CertificationRecord>) => {
    const id = 'CRT-' + (8000 + certifications.length + 1);
    const worker = workers.find((w) => w.id === newCert.workerId) || workers[0];
    const cert: CertificationRecord = {
      id,
      workerId: worker.id,
      workerName: worker.fullName,
      workerAvatar: worker.avatar,
      workerRole: worker.role,
      cooperativeName: worker.cooperativeName,
      certificationName: newCert.certificationName || 'Standard Safety Credential',
      issuingOrganization: newCert.issuingOrganization || 'Regulatory Authority',
      credentialNumber: newCert.credentialNumber || 'REG-CR-' + Math.floor(10000 + Math.random() * 90000),
      issueDate: newCert.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: newCert.expiryDate || '2028-09-09',
      status: 'valid',
      verificationMethod: newCert.verificationMethod || 'Supervisor Field Assessment',
      verifiedBy: 'Platform Compliance Officer',
      verificationNotes: newCert.verificationNotes || 'Onboarded via Workforce Core Console.',
    };
    setCertifications((prev) => [cert, ...prev]);
    addToast('success', 'Certification Added', `Credential ${cert.certificationName} registered for ${cert.workerName}.`);
    navigate('certs');
  };

  const updateCertification = (id: string, updates: Partial<CertificationRecord>) => {
    setCertifications((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addToast('success', 'Certification Updated', `Credential ${id} record successfully modified.`);
    navigate('cert-details', id);
  };

  const verifyCertification = (id: string, notes?: string) => {
    setCertifications((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'valid',
              verifiedBy: 'Compliance Officer (You)',
              verificationNotes: notes || 'Verified in inspection queue against national registry.',
            }
          : c
      )
    );
    setVerificationQueue((prev) => prev.filter((q) => q.id !== id));
    addToast('success', 'Credential Verified', `Certification ${id} has been verified and marked Valid.`);
  };

  const renewCertification = (id: string, newExpiryDate: string) => {
    setCertifications((prev) =>
      prev.map((c) => (c.id === id ? { ...c, expiryDate: newExpiryDate, status: 'valid' } : c))
    );
    addToast('success', 'Certification Renewed', `Credential ${id} renewed until ${newExpiryDate}.`);
  };

  const revokeCertification = (id: string, reason: string) => {
    setCertifications((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'expired', verificationNotes: `Revoked: ${reason}` } : c))
    );
    addToast('error', 'Certification Revoked', `Credential ${id} status shifted to Expired/Revoked.`);
  };

  // Cooperative Handlers
  const addCooperative = (newCoop: Partial<CooperativeRecord>) => {
    const id = 'COOP-' + String(cooperatives.length + 1).padStart(2, '0');
    const coop: CooperativeRecord = {
      id,
      name: newCoop.name || 'New Regional Cooperative',
      registrationNumber: newCoop.registrationNumber || 'REG-' + Math.floor(10000 + Math.random() * 90000),
      region: newCoop.region || 'Western Region',
      headquarters: newCoop.headquarters || 'Regional Hub Office',
      delegateName: newCoop.delegateName || 'Elected Delegate',
      contactEmail: newCoop.contactEmail || 'contact@coop.local',
      contactPhone: newCoop.contactPhone || '+1 (555) 000-1122',
      foundedYear: newCoop.foundedYear || 2026,
      memberCount: newCoop.memberCount || 50,
      complianceRate: newCoop.complianceRate || 95.0,
      status: 'Active',
      activeMembers: 45,
      onboardingMembers: 5,
      standdownMembers: 0,
      fullTimeCount: 40,
      contractCount: 10,
      validCerts: 48,
      expiringCerts: 1,
      pendingCerts: 1,
      topSkills: [{ name: 'General Operations', count: 35 }],
      recentActivity: [
        { id: 'ACT-NEW', title: 'Charter officially registered with Federation', date: 'Today', type: 'audit' },
      ],
    };
    setCooperatives((prev) => [coop, ...prev]);
    addToast('success', 'Cooperative Registered', `Cooperative ${coop.name} (${coop.registrationNumber}) added.`);
    navigate('cooperatives');
  };

  const updateCooperative = (id: string, updates: Partial<CooperativeRecord>) => {
    setCooperatives((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addToast('success', 'Cooperative Updated', `Cooperative ${id} governance records updated.`);
    navigate('coop-details', id);
  };

  // Worker Handlers
  const addWorker = (newWorker: Partial<WorkerRecord>) => {
    const id = 'WKR-' + Math.floor(1000 + Math.random() * 9000);
    const worker: WorkerRecord = {
      id,
      fullName: newWorker.fullName || 'New Worker',
      role: newWorker.role || 'Apprentice Specialist',
      cooperativeId: newWorker.cooperativeId || 'COOP-01',
      cooperativeName:
        cooperatives.find((c) => c.id === newWorker.cooperativeId)?.name || 'Apex Agro Cooperative',
      employmentType: (newWorker.employmentType as any) || 'In Onboarding',
      status: 'onboarding',
      email: newWorker.email || `${id.toLowerCase()}@cshrk.local`,
      phone: newWorker.phone || '+1 (555) 123-4567',
      joinedDate: 'Sep 09, 2026',
      yearsOfService: '< 1 Yr',
      avatar: MASTER_AVATARS.ADMIN_USER,
      skills: newWorker.skills || [],
      certifications: newWorker.certifications || [],
    };
    setWorkers((prev) => [worker, ...prev]);
    addToast('success', 'Worker Onboarded', `Worker ${worker.fullName} (${worker.id}) successfully enrolled.`);
    navigate('workers');
  };

  const updateWorker = (id: string, updates: Partial<WorkerRecord>) => {
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    addToast('success', 'Worker Updated', `Worker profile ${id} changes saved.`);
    navigate('worker-profile', id);
  };

  const deactivateWorker = (id: string) => {
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'inactive', employmentType: 'Stand-down' } : w)));
    addToast('warning', 'Worker Stand-Down', `Worker ${id} placed on inactive stand-down status.`);
    navigate('workers');
  };

  // Report Generator
  const generateReport = (category: string, title: string, format: 'PDF' | 'CSV' | 'Excel') => {
    const newRep: ReportRecord = {
      id: 'REP-2026-LIVE-' + Math.floor(100 + Math.random() * 900),
      title,
      category,
      generatedDate: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileSize: (Math.random() * 3 + 1).toFixed(1) + ' MB',
      format,
      recordCount: 2845,
      downloadUrl: '#generated',
      summary: `Automated ${category} audit generated for federation compliance dispatch.`,
    };
    setReports((prev) => [newRep, ...prev]);
    addToast('success', 'Report Ready', `Export ${title} (${format}) generated successfully.`);
  };

  return (
    <WorkforceContext.Provider
      value={{
        currentView,
        setCurrentView,
        navigate,
        selectedWorkerId,
        setSelectedWorkerId,
        selectedSkillId,
        setSelectedSkillId,
        selectedCertId,
        setSelectedCertId,
        selectedCoopId,
        setSelectedCoopId,
        workers,
        skills,
        certifications,
        cooperatives,
        verificationQueue,
        reports,
        addSkill,
        updateSkill,
        deactivateSkill,
        addCertification,
        updateCertification,
        verifyCertification,
        renewCertification,
        revokeCertification,
        addCooperative,
        updateCooperative,
        addWorker,
        updateWorker,
        deactivateWorker,
        generateReport,
        toasts,
        addToast,
        removeToast,
        confirmDialog,
        openConfirmDialog,
        closeConfirmDialog,
        searchQuery,
        setSearchQuery,
        metrics: SYSTEM_METRICS,
      }}
    >
      {children}
    </WorkforceContext.Provider>
  );
};

export const useWorkforce = () => {
  const context = useContext(WorkforceContext);
  if (!context) {
    throw new Error('useWorkforce must be used within a WorkforceProvider');
  }
  return context;
};
