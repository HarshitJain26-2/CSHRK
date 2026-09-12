export interface WorkerSkillItem {
  skillId: string;
  name: string;
  level: 'Beg' | 'Int' | 'Adv' | 'Expert';
  verified: boolean;
}

export interface WorkerCertItem {
  certId: string;
  name: string;
  issuer: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired' | 'pending';
}

export interface WorkerRecord {
  id: string; // e.g. WKR-8042
  fullName: string;
  role: string;
  cooperativeId: string;
  cooperativeName: string;
  employmentType: 'Full-Time' | 'Contract' | 'In Onboarding' | 'Stand-down';
  status: 'active' | 'onboarding' | 'inactive' | 'expiring';
  email: string;
  phone: string;
  joinedDate: string;
  yearsOfService: string;
  avatar: string;
  skills: WorkerSkillItem[];
  certifications: WorkerCertItem[];
}

export interface SkillRecord {
  id: string; // e.g. SKL-1042
  code: string;
  name: string;
  category: string;
  description: string;
  scopeOfPractice: string;
  status: 'active' | 'draft' | 'deprecated';
  totalWorkers: number;
  verifiedWorkers: number;
  proficiencyRubric: {
    beginner: string;
    intermediate: string;
    advanced: string;
    expert: string;
  };
  requiredCertifications: string[];
  workerLevelBreakdown: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
}

export interface CertificationRecord {
  id: string; // e.g. CRT-9921
  workerId: string;
  workerName: string;
  workerAvatar: string;
  workerRole: string;
  cooperativeName: string;
  certificationName: string;
  issuingOrganization: string;
  credentialNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  verificationMethod?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  documentUrl?: string;
  urgency?: 'high' | 'medium' | 'low';
  reviewDueDays?: number;
}

export interface CooperativeRecord {
  id: string; // e.g. COOP-01
  name: string;
  registrationNumber: string;
  region: string;
  headquarters: string;
  delegateName: string;
  contactEmail: string;
  contactPhone: string;
  foundedYear: number;
  memberCount: number;
  complianceRate: number;
  status: 'Active' | 'Compliant' | 'Under Review';
  activeMembers: number;
  onboardingMembers: number;
  standdownMembers: number;
  fullTimeCount: number;
  contractCount: number;
  validCerts: number;
  expiringCerts: number;
  pendingCerts: number;
  topSkills: Array<{ name: string; count: number }>;
  recentActivity: Array<{ id: string; title: string; date: string; type: 'audit' | 'member' | 'cert' }>;
}

export interface ReportRecord {
  id: string;
  title: string;
  category: string;
  generatedDate: string;
  fileSize: string;
  format: 'PDF' | 'CSV' | 'Excel';
  recordCount: number;
  downloadUrl: string;
  summary: string;
}

// Master Avatars from Visual Source of Truth
export const MASTER_AVATARS = {
  CARLOS_MENDEZ: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4FxRHUCoRQzViwAIsIb4RxEcqQIR42mU-FjamgAVECgEqmh_tvgE0myGwR7WX9oF1OqI15ugqx-0F3jclMdyaQJEHdE4FGV54Io2COGoTDDUiN_KYuuPJcFWFI3DUcz_L06Ga5UGoaodaXASg29aasQGmgSjj0WGWDa32aZj9scv5woIGfvLKEjYNiMClQiqnwmRcO6SPTtAT_iq-jiBEK9YdcN6PMc67wRyM7afaKThvRAmu5WSg-A',
  CARLOS_PROFILE: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPbxexV-Mp0cuQGAi5dVGi2Y4__R2Z-qFS3JSpSn-HPthnn2XSoncde9eGrSTWTBMi7EVra4_9GpGyn1a2o0QU1xsY3mSMBd-2Wt4qj-dW7dxph-C7sKXNQ5aTQKF-jOxXkIkHKGt_KJnoeJOwLI8hqM8xNCzubqT6w31FnW59xgoQ20vGJ02udFMmrXeXj-nKFaCANT9YtZ1VQgyD7nf49jg0K_PIFzdTrLtSTxQd7AkOVHPOeOCgBg',
  ELENA_ROSTOVA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6VknMedIA5QBxPywl_xHXEHEuWEe4nEBkPyM_QUnwzcTETq39unzUkL8ELjd_MSFiZPEpmNmAAfKXZAfZb8VUw8G58TaaHyUJWFUr1PyXxQZnXCT2qMSgpdaefmyJ6FH6GCk0zcAKV1L8-uZ5vTzuXEL4P0oo3N5oBAAdIMZWPBO1Emq065jE37_aNMAUOM9lLbvMIuhe2Sb8uA0kAFjhzlJoCD4QRKkAtb8uoEsAjLJrsJNnU9zWZQ',
  DAVID_OSEI: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxjsspFAHH2hOX7OkoE1WBkjiTX72vpXKdrf0KIpBHSiKD7v3MDSQDhmTeIy6LSbhH86nI_BWHmG3x8l31fIxQTAprQJz9DDGXBJGh9dl2yMcdBKxJWkwYvQAoPeZm951pk2zAWm_dqGWUbVgoJRNO3Rgt8HwLPN8FMmkCa4a-er5PbI32tXQgXAP2-5xlrWQGyQVgZakJCZKCuqiPDbb_23TFYXLss89D5DZHX-940BJ3jcbA_YC_mg',
  MARIA_SANTOS: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZsYDBjHKKfDmlvwZf8lGYKKBFSV9pQQG4WqfURao6v-SPxVMn5hw6c4h4uxD0JVdVhEl-Lw8PgOmjUEPC8yRHgDMSK1j3YCfwIgC_-N4TCf0l4-JHv5g0FUv--0qdEIGhSoxgcoNLx1KQzPz1d1SpRBj9VOSrjFUk5_o8WJWkQLQdrrUdP_GFP9w0g1B62mNw2jkAqhQ0N6L28ThMKdqwWRkM7g4CpchXn54WcHxuUPopAkihBWZsxg',
  ADMIN_USER: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCijwi6iTU5gFUgAEgV8TlD8H7vQriHK6vIDO2F1ylkmaKQl_RkI8b115XFoca1sOBKKXknjsyTLYwRmMmuL45M0dZEWMyP9DhMyZtbgxoTbRUm0QWoxX68PybdcqZYYPbHjSR_5lkBDwct02Rdv2hCNiRkVa0PRIUoyP7BCIKGrm5B1mV7KazX6ePePzFJhlFkkCBPsSUiLN6I1DqqYeFJXOOeAeBvUrbsuafgzMvZms8JfpjAWrpyQA',
  EMBLEM: 'https://lh3.googleusercontent.com/aida/AEtjO1VUwMti3CeNKpL31Nd_1cEj7zP0x6hG7t_CWKUagp4hFyqVpy9mHsnszMJJarMy4fygfMQ8nUY3EUty0bdcEUO1mLnLu6-3C_dZxlKvy6Tl61q3YsjfoeDd-rPQyNhU5KA82B0LqFRI8nRk3Jrt0MSjDcB58QhCOhB_qCCD9vLogqxxY6irpbCpJzPDMtqF4RCp7N6wEccaMIkqhq6QYlhK2AoHPFI7PCC1j4aiEjw3jyrW7SPHoRn9ycyS'
};

// Initial Cooperatives
export const INITIAL_COOPERATIVES: CooperativeRecord[] = [
  {
    id: 'COOP-01',
    name: 'Apex Agro Cooperative',
    registrationNumber: 'REG-88214',
    region: 'Pacific Northwest',
    headquarters: 'Yakima, WA',
    delegateName: 'Sarah Jenkins',
    contactEmail: 'contact@apexagro.org',
    contactPhone: '+1 (555) 234-8800',
    foundedYear: 2014,
    memberCount: 840,
    complianceRate: 98.4,
    status: 'Active',
    activeMembers: 780,
    onboardingMembers: 35,
    standdownMembers: 25,
    fullTimeCount: 710,
    contractCount: 130,
    validCerts: 810,
    expiringCerts: 12,
    pendingCerts: 18,
    topSkills: [
      { name: 'Tractor Operations', count: 520 },
      { name: 'Soil Testing', count: 310 },
      { name: 'Precision Irrigation', count: 215 },
      { name: 'Organic Certification', count: 190 }
    ],
    recentActivity: [
      { id: 'ACT-1', title: 'Annual Agricultural Compliance Audit passed with 98.4% rating', date: 'Sep 02, 2026', type: 'audit' },
      { id: 'ACT-2', title: '14 new apprentice workers completed soil safety training', date: 'Aug 29, 2026', type: 'member' },
      { id: 'ACT-3', title: 'Agro-Tech II operator licensing renew cycle initiated', date: 'Aug 20, 2026', type: 'cert' }
    ]
  },
  {
    id: 'COOP-02',
    name: 'Midland Fabrication Cooperative',
    registrationNumber: 'REG-77309',
    region: 'Midwest',
    headquarters: 'Cleveland, OH',
    delegateName: 'Robert Chen',
    contactEmail: 'info@midlandfab.org',
    contactPhone: '+1 (555) 441-2090',
    foundedYear: 2011,
    memberCount: 620,
    complianceRate: 94.1,
    status: 'Active',
    activeMembers: 585,
    onboardingMembers: 20,
    standdownMembers: 15,
    fullTimeCount: 560,
    contractCount: 60,
    validCerts: 590,
    expiringCerts: 8,
    pendingCerts: 22,
    topSkills: [
      { name: 'Robotic MIG Welding', count: 410 },
      { name: 'NDT Level II', count: 195 },
      { name: 'Blueprint Fabrication', count: 260 }
    ],
    recentActivity: [
      { id: 'ACT-4', title: 'AWS D1.1 structural inspection certification batch approved', date: 'Sep 05, 2026', type: 'cert' },
      { id: 'ACT-5', title: 'Quarterly metallurgical safety check verified zero incidents', date: 'Aug 26, 2026', type: 'audit' }
    ]
  },
  {
    id: 'COOP-03',
    name: 'Cascadia Forestry Cooperative',
    registrationNumber: 'REG-66120',
    region: 'West Coast',
    headquarters: 'Eugene, OR',
    delegateName: 'Hannah Brooks',
    contactEmail: 'admin@cascadiaforestry.org',
    contactPhone: '+1 (555) 672-9100',
    foundedYear: 2017,
    memberCount: 410,
    complianceRate: 91.8,
    status: 'Active',
    activeMembers: 375,
    onboardingMembers: 15,
    standdownMembers: 20,
    fullTimeCount: 320,
    contractCount: 90,
    validCerts: 365,
    expiringCerts: 6,
    pendingCerts: 39,
    topSkills: [
      { name: 'Hydraulic Excavators', count: 310 },
      { name: 'Site Safety Compliance', count: 290 },
      { name: 'Timber Harvester', count: 180 }
    ],
    recentActivity: [
      { id: 'ACT-6', title: 'OSHA Heavy Equipment Inspection scheduled for Sector 4', date: 'Sep 07, 2026', type: 'audit' },
      { id: 'ACT-7', title: '8 crane operator renewal certifications flagged for review', date: 'Sep 01, 2026', type: 'cert' }
    ]
  },
  {
    id: 'COOP-04',
    name: 'SunGrid Energy Cooperative',
    registrationNumber: 'REG-55418',
    region: 'Southwest',
    headquarters: 'Phoenix, AZ',
    delegateName: 'Miguel Alvarez',
    contactEmail: 'operations@sungridcoop.org',
    contactPhone: '+1 (555) 890-3320',
    foundedYear: 2019,
    memberCount: 385,
    complianceRate: 96.2,
    status: 'Active',
    activeMembers: 320,
    onboardingMembers: 50,
    standdownMembers: 15,
    fullTimeCount: 300,
    contractCount: 85,
    validCerts: 350,
    expiringCerts: 2,
    pendingCerts: 33,
    topSkills: [
      { name: 'Photovoltaic Assembly', count: 290 },
      { name: 'High Voltage Safety', count: 240 },
      { name: 'Inverter Diagnostics', count: 175 }
    ],
    recentActivity: [
      { id: 'ACT-8', title: 'NABCEP Associate qualification drive enrolled 25 new technicians', date: 'Sep 03, 2026', type: 'member' }
    ]
  },
  {
    id: 'COOP-05',
    name: 'Great Lakes Logistics Cooperative',
    registrationNumber: 'REG-44291',
    region: 'Great Lakes',
    headquarters: 'Detroit, MI',
    delegateName: 'Denise Washington',
    contactEmail: 'dispatch@greatlakeslog.org',
    contactPhone: '+1 (555) 312-5500',
    foundedYear: 2015,
    memberCount: 340,
    complianceRate: 93.5,
    status: 'Active',
    activeMembers: 300,
    onboardingMembers: 20,
    standdownMembers: 20,
    fullTimeCount: 290,
    contractCount: 50,
    validCerts: 310,
    expiringCerts: 0,
    pendingCerts: 30,
    topSkills: [
      { name: 'Fleet Route Optimization', count: 220 },
      { name: 'Hazmat Transport', count: 175 },
      { name: 'DOT Compliance', count: 260 }
    ],
    recentActivity: [
      { id: 'ACT-9', title: 'DOT federal logbook digital compliance audit completed', date: 'Aug 30, 2026', type: 'audit' }
    ]
  },
  {
    id: 'COOP-06',
    name: 'Appalachian Artisans Cooperative',
    registrationNumber: 'REG-33107',
    region: 'East Coast',
    headquarters: 'Asheville, NC',
    delegateName: 'Caleb Miller',
    contactEmail: 'guild@appalachianartisans.org',
    contactPhone: '+1 (555) 789-1144',
    foundedYear: 2016,
    memberCount: 250,
    complianceRate: 90.4,
    status: 'Active',
    activeMembers: 215,
    onboardingMembers: 10,
    standdownMembers: 25,
    fullTimeCount: 190,
    contractCount: 60,
    validCerts: 221,
    expiringCerts: 0,
    pendingCerts: 29,
    topSkills: [
      { name: 'Timber Harvester', count: 140 },
      { name: 'Blueprint Fabrication', count: 95 }
    ],
    recentActivity: [
      { id: 'ACT-10', title: 'Craftsmanship apprenticeship cohort graduation', date: 'Aug 15, 2026', type: 'member' }
    ]
  }
];

// Initial Skills (142 skills total represented across 12 categories)
export const INITIAL_SKILLS: SkillRecord[] = [
  {
    id: 'SKL-1042',
    code: 'AGRO-TRAC-01',
    name: 'Tractor & Heavy Agricultural Operations',
    category: 'Agronomy',
    description: 'Operation and tactical deployment of class IV-VII multi-terrain agricultural tractors, GPS auto-steer harvesters, and implement linkages.',
    scopeOfPractice: 'Field preparation, seed drilling, fertilizer injection, and synchronized bulk harvest transportation in compliance with regional safety codes.',
    status: 'active',
    totalWorkers: 642,
    verifiedWorkers: 498,
    proficiencyRubric: {
      beginner: 'Can safely operate tractor in designated transit lanes and perform pre-trip mechanical inspection.',
      intermediate: 'Operates trailing implements, calibrated seeders, and maneuvers in tight headlands without supervision.',
      advanced: 'Configures GPS telemetry, manages dual-wheel soil compaction settings, and executes night operations.',
      expert: 'Master operator capable of precision guidance troubleshooting, implement rebuilds, and field crew supervision.'
    },
    requiredCertifications: ['OSHA-30 Construction & Field Safety', 'Agro-Tech II Machinery License'],
    workerLevelBreakdown: {
      beginner: 60,
      intermediate: 152,
      advanced: 246,
      expert: 184
    }
  },
  {
    id: 'SKL-1088',
    code: 'AGRO-SOIL-02',
    name: 'Soil Chemistry Testing & Analysis',
    category: 'Agronomy',
    description: 'Collection of core soil samples, pH titration, nitrogen-phosphorus-potassium assay, and ecological remediation recommendations.',
    scopeOfPractice: 'Field sampling protocol, spectrophotometer testing, moisture profiling, and nitrogen runoff risk mitigation.',
    status: 'active',
    totalWorkers: 380,
    verifiedWorkers: 320,
    proficiencyRubric: {
      beginner: 'Executes clean GPS-tagged soil core extractions and laboratory sample preparation.',
      intermediate: 'Conducts chemical reagent assays and calibrates field electrical conductivity probes.',
      advanced: 'Interprets micronutrient deficiency reports and prescribes organic amendment regimens.',
      expert: 'Directs cooperative-wide agronomic soil health programs and regional water table protection.'
    },
    requiredCertifications: ['Agro-Tech II Machinery License'],
    workerLevelBreakdown: {
      beginner: 40,
      intermediate: 90,
      advanced: 150,
      expert: 100
    }
  },
  {
    id: 'SKL-2201',
    code: 'WELD-MIG-01',
    name: 'Robotic & Manual MIG Welding',
    category: 'Welding & Metallurgy',
    description: 'Gas metal arc welding of structural carbon steel, stainless alloys, and automated robotic fixture setup.',
    scopeOfPractice: 'Fabrication of heavy load-bearing structural frames, pressure vessels, and robotic robot weld programming.',
    status: 'active',
    totalWorkers: 410,
    verifiedWorkers: 360,
    proficiencyRubric: {
      beginner: 'Cleans joint bevels, tracks robotic line feed, and welds basic fillet seams in flat position.',
      intermediate: 'Multi-pass horizontal and vertical-up welds with consistent root penetration and zero porosity.',
      advanced: 'Welds all positions (6G) with radiographic inspection clearance; programs weld robot trajectories.',
      expert: 'Certified Welding Inspector (CWI) qualified to audit procedure specification sheets and certify apprentices.'
    },
    requiredCertifications: ['AWS D1.1 Structural Welding'],
    workerLevelBreakdown: {
      beginner: 35,
      intermediate: 110,
      advanced: 175,
      expert: 90
    }
  },
  {
    id: 'SKL-2245',
    code: 'QUAL-NDT-01',
    name: 'Non-Destructive Testing (NDT Level II)',
    category: 'Quality Assurance',
    description: 'Ultrasonic, magnetic particle, and liquid penetrant inspection of structural weldments and forged assemblies.',
    scopeOfPractice: 'Defect sizing, flaw evaluation against ASME/AWS specifications, and formal engineering report sign-off.',
    status: 'active',
    totalWorkers: 195,
    verifiedWorkers: 180,
    proficiencyRubric: {
      beginner: 'Applies dye penetrant and developer coatings under senior technician supervision.',
      intermediate: 'Calibrates ultrasonic transducers and executes magnetic particle yoke inspections.',
      advanced: 'Interprets subsurface shear-wave indications and drafts regulatory compliance acceptance sheets.',
      expert: 'Level III equivalent lead auditor capable of certifying NDT procedure specifications and training inspectors.'
    },
    requiredCertifications: ['AWS D1.1 Structural Welding', 'ASNT NDT Level III'],
    workerLevelBreakdown: {
      beginner: 15,
      intermediate: 45,
      advanced: 85,
      expert: 50
    }
  },
  {
    id: 'SKL-3104',
    code: 'CIVL-EXCV-01',
    name: 'Hydraulic Excavator & Earthmoving',
    category: 'Civil Operations',
    description: 'Operation of 20-50 ton hydraulic tracked excavators for foundation trenching, slope grading, and civil earthworks.',
    scopeOfPractice: 'Trench shoring clearance, laser grade control, utility avoidance protocols, and heavy quarry extraction.',
    status: 'active',
    totalWorkers: 310,
    verifiedWorkers: 275,
    proficiencyRubric: {
      beginner: 'Performs machine walk-around, fluids check, and loads spoil trucks from flat stockpile.',
      intermediate: 'Benches steep embankments, digs foundation trenches to within 2-inch grade tolerance.',
      advanced: 'Operates tilt-rotators, GPS grade lasers, and works around high-pressure underground utilities.',
      expert: 'Master excavation supervisor conducting slope stability risk assessments and deep excavation shoring.'
    },
    requiredCertifications: ['Heavy Machinery Operations Cert'],
    workerLevelBreakdown: {
      beginner: 25,
      intermediate: 75,
      advanced: 130,
      expert: 80
    }
  },
  {
    id: 'SKL-4012',
    code: 'ENRG-PV-01',
    name: 'Photovoltaic Array Installation & Assembly',
    category: 'Energy',
    description: 'Mounting, mechanical alignment, DC string combiner wiring, and ballast racking of utility-scale solar farms.',
    scopeOfPractice: 'Tracker motor assembly, microinverter installation, DC polarity verification, and torque audit testing.',
    status: 'active',
    totalWorkers: 290,
    verifiedWorkers: 195,
    proficiencyRubric: {
      beginner: 'Unpacks modules, torques racking clamps, and installs ground wire lugs.',
      intermediate: 'Routes DC cable trays, crimps MC4 connectors, and tests open-circuit string voltages (Voc).',
      advanced: 'Commissions single-axis trackers, troubleshoots string inverter fault codes, and executes thermal imaging.',
      expert: 'Site lead directing 50MW utility-scale installation crews and high-voltage grid interconnect sign-offs.'
    },
    requiredCertifications: ['NABCEP Associate Credential'],
    workerLevelBreakdown: {
      beginner: 55,
      intermediate: 115,
      advanced: 80,
      expert: 40
    }
  },
  {
    id: 'SKL-5100',
    code: 'LOGS-HAZM-01',
    name: 'Hazardous Materials (HAZMAT) Transport',
    category: 'Logistics',
    description: 'Safe transit, placard assignment, emergency containment, and regulatory documentation for hazardous class cargo.',
    scopeOfPractice: 'Chemical tankers, explosive/flammable transport, spill emergency response, and border manifest clearance.',
    status: 'active',
    totalWorkers: 175,
    verifiedWorkers: 165,
    proficiencyRubric: {
      beginner: 'Verifies safety placards and inspects cargo tie-down containment points.',
      intermediate: 'Directs liquid tank baffling load distributions and logs chemical bill of lading manifests.',
      advanced: 'Handles route diversions through high-density metropolitan corridors and manages spill containment.',
      expert: 'Safety director managing federal DOT hazmat compliance and emergency response team command.'
    },
    requiredCertifications: ['CDL-A Commercial & Hazmat'],
    workerLevelBreakdown: {
      beginner: 10,
      intermediate: 35,
      advanced: 85,
      expert: 45
    }
  },
  {
    id: 'SKL-3140',
    code: 'SAFT-SITE-01',
    name: 'Occupational Site Safety & OSHA Compliance',
    category: 'Safety',
    description: 'Worksite hazard identification, lockout/tagout procedures, fall protection verification, and incident prevention.',
    scopeOfPractice: 'Job Safety Analysis (JSA) creation, toolbox talks, PPE audit protocols, and OSHA audit accompaniment.',
    status: 'active',
    totalWorkers: 580,
    verifiedWorkers: 510,
    proficiencyRubric: {
      beginner: 'Understands personal protective equipment rules and reports near-miss safety hazards.',
      intermediate: 'Conducts daily perimeter sweeps and enforces scaffolding tie-off compliance.',
      advanced: 'Leads root-cause incident reviews and implements corrective safety action plans.',
      expert: 'Enterprise Director of Safety auditing cross-cooperative compliance and leading regulatory filings.'
    },
    requiredCertifications: ['OSHA-30 Construction & Field Safety'],
    workerLevelBreakdown: {
      beginner: 50,
      intermediate: 150,
      advanced: 220,
      expert: 160
    }
  }
];

// Initial Certifications (Synchronized with 2,845 total mapped records: 2,546 valid, 28 expiring, 112 expired, 149 pending)
export const INITIAL_CERTIFICATIONS: CertificationRecord[] = [
  {
    id: 'CRT-9921',
    workerId: 'WKR-9120',
    workerName: 'Elena Rostova',
    workerAvatar: MASTER_AVATARS.ELENA_ROSTOVA,
    workerRole: 'Lead Industrial Welder & QA',
    cooperativeName: 'Midland Fabrication Cooperative',
    certificationName: 'AWS D1.1 Structural Welding',
    issuingOrganization: 'American Welding Society',
    credentialNumber: 'AWS-D1-840921',
    issueDate: '2023-05-12',
    expiryDate: '2027-05-12',
    status: 'valid',
    verificationMethod: 'Third-Party Registry API Verified',
    verifiedBy: 'Chief Inspector David Vance',
    verificationNotes: 'Certified 6G position in SMAW/GMAW structural welding. Zero defect audit.',
    documentUrl: 'https://docs.cshrk.local/certs/AWS_D1_840921.pdf'
  },
  {
    id: 'CRT-8042',
    workerId: 'WKR-8042',
    workerName: 'Carlos Mendez',
    workerAvatar: MASTER_AVATARS.CARLOS_MENDEZ,
    workerRole: 'Senior Agronomist & Machine Specialist',
    cooperativeName: 'Apex Agro Cooperative',
    certificationName: 'OSHA-30 Construction & Field Safety',
    issuingOrganization: 'US Dept of Labor / OSHA',
    credentialNumber: 'OSHA-30-771920',
    issueDate: '2023-08-15',
    expiryDate: '2027-08-15',
    status: 'valid',
    verificationMethod: 'Digital Credential Hash Verified',
    verifiedBy: 'Compliance Officer Sarah Jenkins',
    verificationNotes: '30-hour general industry and agricultural safety modules completed with honor.',
    documentUrl: 'https://docs.cshrk.local/certs/OSHA30_771920.pdf'
  },
  {
    id: 'CRT-8043',
    workerId: 'WKR-8042',
    workerName: 'Carlos Mendez',
    workerAvatar: MASTER_AVATARS.CARLOS_MENDEZ,
    workerRole: 'Senior Agronomist & Machine Specialist',
    cooperativeName: 'Apex Agro Cooperative',
    certificationName: 'Agro-Tech II Machinery License',
    issuingOrganization: 'Apex State Agricultural Board',
    credentialNumber: 'AGR-TK-55104',
    issueDate: '2024-03-20',
    expiryDate: '2028-03-20',
    status: 'valid',
    verificationMethod: 'State Licensing Board Verification',
    verifiedBy: 'Sarah Jenkins',
    verificationNotes: 'Class IV multi-terrain harvesters and GPS variable rate sprayers certified.',
    documentUrl: 'https://docs.cshrk.local/certs/AGR_TK_55104.pdf'
  },
  {
    id: 'CRT-7301',
    workerId: 'WKR-7301',
    workerName: 'David K. Osei',
    workerAvatar: MASTER_AVATARS.DAVID_OSEI,
    workerRole: 'Heavy Civil Equipment Operator',
    cooperativeName: 'Cascadia Forestry Cooperative',
    certificationName: 'Heavy Machinery Operations Cert',
    issuingOrganization: 'National Commission for the Certification of Crane Operators (NCCCO)',
    credentialNumber: 'CCO-HVY-91204',
    issueDate: '2023-09-17',
    expiryDate: '2026-09-17', // Expiring in 8 days!
    status: 'expiring',
    verificationMethod: 'In-person Practical Exam Sign-off',
    verifiedBy: 'Supervisor Hannah Brooks',
    verificationNotes: 'Renewal practical exam booked for Sep 14. Document in renewal queue.',
    documentUrl: 'https://docs.cshrk.local/certs/CCO_HVY_91204.pdf',
    urgency: 'high',
    reviewDueDays: 8
  },
  {
    id: 'CRT-6512',
    workerId: 'WKR-6512',
    workerName: 'Maria Santos',
    workerAvatar: MASTER_AVATARS.MARIA_SANTOS,
    workerRole: 'Solar Array Technician',
    cooperativeName: 'SunGrid Energy Cooperative',
    certificationName: 'NABCEP Associate Credential',
    issuingOrganization: 'North American Board of Certified Energy Practitioners',
    credentialNumber: 'NAB-PV-33819',
    issueDate: '2026-08-20',
    expiryDate: '2029-08-20',
    status: 'pending',
    verificationMethod: 'Pending Regulatory Verification',
    verificationNotes: 'Candidate passed national computerized testing. Official transcript uploaded Aug 28, 2026.',
    documentUrl: 'https://docs.cshrk.local/certs/NAB_PV_33819_MariaSantos.pdf',
    urgency: 'high',
    reviewDueDays: 2
  },
  {
    id: 'CRT-4491',
    workerId: 'WKR-4491',
    workerName: 'Marcus Vance',
    workerAvatar: MASTER_AVATARS.ADMIN_USER,
    workerRole: 'Fleet & Logistics Dispatcher',
    cooperativeName: 'Great Lakes Logistics Cooperative',
    certificationName: 'CDL-A Commercial & Hazmat',
    issuingOrganization: 'Federal Motor Carrier Safety Administration (FMCSA)',
    credentialNumber: 'CDL-MI-881290',
    issueDate: '2022-11-14',
    expiryDate: '2027-11-14',
    status: 'valid',
    verificationMethod: 'DOT State Clearinghouse Match',
    verifiedBy: 'Denise Washington',
    verificationNotes: 'Clean motor vehicle record. Hazmat endorsement TSA background check cleared.',
    documentUrl: 'https://docs.cshrk.local/certs/CDL_MI_881290.pdf'
  },
  {
    id: 'CRT-5210',
    workerId: 'WKR-5210',
    workerName: 'Priya Sharma',
    workerAvatar: MASTER_AVATARS.ADMIN_USER,
    workerRole: 'Quality Assurance & Materials Inspector',
    cooperativeName: 'Midland Fabrication Cooperative',
    certificationName: 'ASNT NDT Level III',
    issuingOrganization: 'American Society for Non-Destructive Testing',
    credentialNumber: 'ASNT-LV3-44120',
    issueDate: '2023-01-10',
    expiryDate: '2028-01-10',
    status: 'valid',
    verificationMethod: 'ASNT Central Registry Verified',
    verifiedBy: 'Robert Chen',
    verificationNotes: 'Ultrasonic & Eddy Current testing Level III signatory status confirmed.',
    documentUrl: 'https://docs.cshrk.local/certs/ASNT_LV3_44120.pdf'
  },
  {
    id: 'CRT-3108',
    workerId: 'WKR-3108',
    workerName: 'Thomas Vance',
    workerAvatar: MASTER_AVATARS.ADMIN_USER,
    workerRole: 'Forestry Equipment Specialist',
    cooperativeName: 'Cascadia Forestry Cooperative',
    certificationName: 'Timber Faller Tier 3',
    issuingOrganization: 'Pacific Rim Forest Safety Council',
    credentialNumber: 'PRF-TF3-10294',
    issueDate: '2023-06-30',
    expiryDate: '2026-06-30', // Expired!
    status: 'expired',
    verificationMethod: 'Archived Record',
    verifiedBy: 'Hannah Brooks',
    verificationNotes: 'Worker currently on stand-down status pending recertification training course.',
    documentUrl: 'https://docs.cshrk.local/certs/PRF_TF3_10294.pdf'
  }
];

// 14 Urgent Pending Review Queue Items for Certification Verification
export const INITIAL_VERIFICATION_QUEUE: CertificationRecord[] = [
  {
    id: 'CRT-6512',
    workerId: 'WKR-6512',
    workerName: 'Maria Santos',
    workerAvatar: MASTER_AVATARS.MARIA_SANTOS,
    workerRole: 'Solar Array Technician',
    cooperativeName: 'SunGrid Energy Cooperative',
    certificationName: 'NABCEP Associate Credential',
    issuingOrganization: 'North American Board of Certified Energy Practitioners',
    credentialNumber: 'NAB-PV-33819',
    issueDate: '2026-08-20',
    expiryDate: '2029-08-20',
    status: 'pending',
    verificationMethod: 'Online Registry Lookup',
    verificationNotes: 'Direct digital copy uploaded. National testing center candidate #88390. Requires registry hash confirmation.',
    documentUrl: 'https://docs.cshrk.local/certs/NAB_PV_33819_MariaSantos.pdf',
    urgency: 'high',
    reviewDueDays: 2
  },
  {
    id: 'CRT-1402',
    workerId: 'WKR-1402',
    workerName: 'Kareem Abdul-Malik',
    workerAvatar: MASTER_AVATARS.DAVID_OSEI,
    workerRole: 'Industrial Electrician Apprentice',
    cooperativeName: 'Midland Fabrication Cooperative',
    certificationName: 'NFPA 70E Arc Flash Safety',
    issuingOrganization: 'National Fire Protection Association',
    credentialNumber: 'NFPA-70E-99410',
    issueDate: '2026-08-25',
    expiryDate: '2029-08-25',
    status: 'pending',
    verificationMethod: 'Supervisor In-Person Sign-off',
    verificationNotes: 'Arc flash PPE live voltage simulation exam completed at Cleveland Technical Guild.',
    urgency: 'high',
    reviewDueDays: 3
  },
  {
    id: 'CRT-1403',
    workerId: 'WKR-2901',
    workerName: 'Hannah Larson',
    workerAvatar: MASTER_AVATARS.ELENA_ROSTOVA,
    workerRole: 'Commercial Grain Handler',
    cooperativeName: 'Apex Agro Cooperative',
    certificationName: 'OSHA Grain Handling Facility Standard (1910.272)',
    issuingOrganization: 'OSHA Agricultural Division',
    credentialNumber: 'OSHA-GH-12903',
    issueDate: '2026-08-27',
    expiryDate: '2029-08-27',
    status: 'pending',
    verificationMethod: 'Self-attested with supervisor verification',
    urgency: 'high',
    reviewDueDays: 3
  },
  {
    id: 'CRT-1404',
    workerId: 'WKR-3312',
    workerName: 'Mateo Morales',
    workerAvatar: MASTER_AVATARS.CARLOS_MENDEZ,
    workerRole: 'Heavy Rigging Specialist',
    cooperativeName: 'Cascadia Forestry Cooperative',
    certificationName: 'Rigging & Signal Person Level 1',
    issuingOrganization: 'NCCCO',
    credentialNumber: 'CCO-RIG-55201',
    issueDate: '2026-08-28',
    expiryDate: '2029-08-28',
    status: 'pending',
    urgency: 'medium',
    reviewDueDays: 5
  },
  {
    id: 'CRT-1405',
    workerId: 'WKR-4109',
    workerName: 'Aisha Bennett',
    workerAvatar: MASTER_AVATARS.ADMIN_USER,
    workerRole: 'Cold Chain Fleet Operator',
    cooperativeName: 'Great Lakes Logistics Cooperative',
    certificationName: 'FDA FSMA Sanitary Transportation of Human Foods',
    issuingOrganization: 'FDA / Safe Food Institute',
    credentialNumber: 'FDA-FSMA-80124',
    issueDate: '2026-08-30',
    expiryDate: '2028-08-30',
    status: 'pending',
    urgency: 'medium',
    reviewDueDays: 6
  },
  {
    id: 'CRT-1406',
    workerId: 'WKR-5521',
    workerName: 'Dmitri Volkov',
    workerAvatar: MASTER_AVATARS.DAVID_OSEI,
    workerRole: 'Pressure Vessel Welder',
    cooperativeName: 'Midland Fabrication Cooperative',
    certificationName: 'ASME Section IX Boiler & Pressure Vessel',
    issuingOrganization: 'American Society of Mechanical Engineers',
    credentialNumber: 'ASME-IX-66290',
    issueDate: '2026-09-01',
    expiryDate: '2028-09-01',
    status: 'pending',
    urgency: 'high',
    reviewDueDays: 1
  },
  {
    id: 'CRT-1407',
    workerId: 'WKR-6119',
    workerName: 'Mei-Ling Zhou',
    workerAvatar: MASTER_AVATARS.MARIA_SANTOS,
    workerRole: 'Solar Inverter Specialist',
    cooperativeName: 'SunGrid Energy Cooperative',
    certificationName: 'SMA Solar High-Voltage Commissioning',
    issuingOrganization: 'SMA Solar Academy',
    credentialNumber: 'SMA-HV-44012',
    issueDate: '2026-09-02',
    expiryDate: '2029-09-02',
    status: 'pending',
    urgency: 'medium',
    reviewDueDays: 7
  },
  {
    id: 'CRT-1408',
    workerId: 'WKR-7023',
    workerName: 'Samuel Jackson',
    workerAvatar: MASTER_AVATARS.CARLOS_MENDEZ,
    workerRole: 'Pesticide Application Supervisor',
    cooperativeName: 'Apex Agro Cooperative',
    certificationName: 'EPA Category 1A Agricultural Plant Pest Control',
    issuingOrganization: 'EPA / State Dept of Agriculture',
    credentialNumber: 'EPA-1A-77890',
    issueDate: '2026-09-02',
    expiryDate: '2029-09-02',
    status: 'pending',
    urgency: 'high',
    reviewDueDays: 2
  },
  {
    id: 'CRT-1409',
    workerId: 'WKR-8190',
    workerName: 'Clara Oswald',
    workerAvatar: MASTER_AVATARS.ELENA_ROSTOVA,
    workerRole: 'Timber Transport Hauler',
    cooperativeName: 'Cascadia Forestry Cooperative',
    certificationName: 'DOT Oversize/Overweight Load Endorsement',
    issuingOrganization: 'Washington State DOT',
    credentialNumber: 'WSDOT-OS-33109',
    issueDate: '2026-09-03',
    expiryDate: '2028-09-03',
    status: 'pending',
    urgency: 'medium',
    reviewDueDays: 8
  },
  {
    id: 'CRT-1410',
    workerId: 'WKR-9014',
    workerName: 'Lucas Dubois',
    workerAvatar: MASTER_AVATARS.DAVID_OSEI,
    workerRole: 'CNC Machining Lead',
    cooperativeName: 'Midland Fabrication Cooperative',
    certificationName: 'NIMS CNC Mill Operations Specialist',
    issuingOrganization: 'National Institute for Metalworking Skills',
    credentialNumber: 'NIMS-CNC-22904',
    issueDate: '2026-09-04',
    expiryDate: '2029-09-04',
    status: 'pending',
    urgency: 'low',
    reviewDueDays: 10
  },
  {
    id: 'CRT-1411',
    workerId: 'WKR-1102',
    workerName: 'Rosa Gutierrez',
    workerAvatar: MASTER_AVATARS.MARIA_SANTOS,
    workerRole: 'Battery Storage Safety Specialist',
    cooperativeName: 'SunGrid Energy Cooperative',
    certificationName: 'NFPA 855 Energy Storage Systems Safety',
    issuingOrganization: 'NFPA',
    credentialNumber: 'NFPA-855-66120',
    issueDate: '2026-09-05',
    expiryDate: '2029-09-05',
    status: 'pending',
    urgency: 'medium',
    reviewDueDays: 6
  },
  {
    id: 'CRT-1412',
    workerId: 'WKR-2240',
    workerName: 'Tariq Al-Mansoor',
    workerAvatar: MASTER_AVATARS.ADMIN_USER,
    workerRole: 'Logistics Fleet Mechanic',
    cooperativeName: 'Great Lakes Logistics Cooperative',
    certificationName: 'ASE Medium-Heavy Truck Technician (T4 Brakes)',
    issuingOrganization: 'National Institute for Automotive Service Excellence',
    credentialNumber: 'ASE-T4-991204',
    issueDate: '2026-09-06',
    expiryDate: '2031-09-06',
    status: 'pending',
    urgency: 'low',
    reviewDueDays: 12
  },
  {
    id: 'CRT-1413',
    workerId: 'WKR-3399',
    workerName: 'Evelyn Reed',
    workerAvatar: MASTER_AVATARS.ELENA_ROSTOVA,
    workerRole: 'Soil Microbiologist',
    cooperativeName: 'Apex Agro Cooperative',
    certificationName: 'Certified Crop Advisor (CCA) Sustainability',
    issuingOrganization: 'American Society of Agronomy',
    credentialNumber: 'ASA-CCA-33019',
    issueDate: '2026-09-07',
    expiryDate: '2028-09-07',
    status: 'pending',
    urgency: 'medium',
    reviewDueDays: 9
  },
  {
    id: 'CRT-1414',
    workerId: 'WKR-4820',
    workerName: 'Jonah Sterling',
    workerAvatar: MASTER_AVATARS.DAVID_OSEI,
    workerRole: 'Forestry First Responder',
    cooperativeName: 'Cascadia Forestry Cooperative',
    certificationName: 'Wilderness First Responder (WFR)',
    issuingOrganization: 'Wilderness Medical Associates',
    credentialNumber: 'WMA-WFR-77120',
    issueDate: '2026-09-07',
    expiryDate: '2029-09-07',
    status: 'pending',
    urgency: 'high',
    reviewDueDays: 2
  }
];

// Initial Workers (Master reference synchronized)
export const INITIAL_WORKERS: WorkerRecord[] = [
  {
    id: 'WKR-8042',
    fullName: 'Carlos Mendez',
    role: 'Senior Agronomist & Machine Specialist',
    cooperativeId: 'COOP-01',
    cooperativeName: 'Apex Agro Cooperative',
    employmentType: 'Full-Time',
    status: 'active',
    email: 'carlos.m@apexagro.org',
    phone: '+1 (555) 382-9104',
    joinedDate: 'Mar 14, 2021',
    yearsOfService: '4 Yrs',
    avatar: MASTER_AVATARS.CARLOS_MENDEZ,
    skills: [
      { skillId: 'SKL-1042', name: 'Tractor Operations', level: 'Expert', verified: true },
      { skillId: 'SKL-1088', name: 'Soil Testing', level: 'Adv', verified: true },
      { skillId: 'SKL-1120', name: 'Organic Certification', level: 'Adv', verified: true },
      { skillId: 'SKL-3140', name: 'Site Safety Compliance', level: 'Int', verified: false }
    ],
    certifications: [
      { certId: 'CRT-8042', name: 'OSHA-30 Construction & Field Safety', issuer: 'OSHA', expiryDate: '2027-08-15', status: 'valid' },
      { certId: 'CRT-8043', name: 'Agro-Tech II Machinery License', issuer: 'State Ag Board', expiryDate: '2028-03-20', status: 'valid' }
    ]
  },
  {
    id: 'WKR-9120',
    fullName: 'Elena Rostova',
    role: 'Lead Industrial Welder & QA',
    cooperativeId: 'COOP-02',
    cooperativeName: 'Midland Fabrication Cooperative',
    employmentType: 'Full-Time',
    status: 'active',
    email: 'elena.r@midlandfab.org',
    phone: '+1 (555) 492-8812',
    joinedDate: 'Jan 10, 2019',
    yearsOfService: '6 Yrs',
    avatar: MASTER_AVATARS.ELENA_ROSTOVA,
    skills: [
      { skillId: 'SKL-2201', name: 'Robotic MIG Welding', level: 'Expert', verified: true },
      { skillId: 'SKL-2245', name: 'NDT Level II', level: 'Adv', verified: true },
      { skillId: 'SKL-2280', name: 'Blueprint Fabrication', level: 'Expert', verified: true }
    ],
    certifications: [
      { certId: 'CRT-9921', name: 'AWS D1.1 Structural Welding', issuer: 'American Welding Society', expiryDate: '2027-05-12', status: 'valid' }
    ]
  },
  {
    id: 'WKR-7301',
    fullName: 'David K. Osei',
    role: 'Heavy Civil Equipment Operator',
    cooperativeId: 'COOP-03',
    cooperativeName: 'Cascadia Forestry Cooperative',
    employmentType: 'Contract',
    status: 'expiring',
    email: 'david.o@cascadiaforestry.org',
    phone: '+1 (555) 721-3940',
    joinedDate: 'Jun 22, 2023',
    yearsOfService: '2 Yrs',
    avatar: MASTER_AVATARS.DAVID_OSEI,
    skills: [
      { skillId: 'SKL-3104', name: 'Hydraulic Excavators', level: 'Adv', verified: true },
      { skillId: 'SKL-3140', name: 'Site Safety Compliance', level: 'Int', verified: true }
    ],
    certifications: [
      { certId: 'CRT-7301', name: 'Heavy Machinery Operations Cert', issuer: 'NCCCO', expiryDate: '2026-09-17', status: 'expiring' }
    ]
  },
  {
    id: 'WKR-6512',
    fullName: 'Maria Santos',
    role: 'Solar Array Technician',
    cooperativeId: 'COOP-04',
    cooperativeName: 'SunGrid Energy Cooperative',
    employmentType: 'In Onboarding',
    status: 'onboarding',
    email: 'maria.s@sungridcoop.org',
    phone: '+1 (555) 604-1823',
    joinedDate: 'Aug 02, 2024',
    yearsOfService: '1 Yr',
    avatar: MASTER_AVATARS.MARIA_SANTOS,
    skills: [
      { skillId: 'SKL-4012', name: 'Photovoltaic Assembly', level: 'Int', verified: false },
      { skillId: 'SKL-4050', name: 'High Voltage Safety', level: 'Beg', verified: false }
    ],
    certifications: [
      { certId: 'CRT-6512', name: 'NABCEP Associate Credential', issuer: 'NABCEP', expiryDate: '2029-08-20', status: 'pending' }
    ]
  },
  {
    id: 'WKR-4491',
    fullName: 'Marcus Vance',
    role: 'Fleet & Logistics Dispatcher',
    cooperativeId: 'COOP-05',
    cooperativeName: 'Great Lakes Logistics Cooperative',
    employmentType: 'Full-Time',
    status: 'active',
    email: 'marcus.v@greatlakeslog.org',
    phone: '+1 (555) 839-4410',
    joinedDate: 'Nov 18, 2020',
    yearsOfService: '5 Yrs',
    avatar: MASTER_AVATARS.ADMIN_USER,
    skills: [
      { skillId: 'SKL-5100', name: 'Hazmat Transport', level: 'Adv', verified: true },
      { skillId: 'SKL-5120', name: 'Fleet Route Optimization', level: 'Expert', verified: true }
    ],
    certifications: [
      { certId: 'CRT-4491', name: 'CDL-A Commercial & Hazmat', issuer: 'FMCSA', expiryDate: '2027-11-14', status: 'valid' }
    ]
  },
  {
    id: 'WKR-5210',
    fullName: 'Priya Sharma',
    role: 'Quality Assurance & Materials Inspector',
    cooperativeId: 'COOP-02',
    cooperativeName: 'Midland Fabrication Cooperative',
    employmentType: 'Full-Time',
    status: 'active',
    email: 'priya.s@midlandfab.org',
    phone: '+1 (555) 914-7265',
    joinedDate: 'Feb 05, 2022',
    yearsOfService: '3 Yrs',
    avatar: MASTER_AVATARS.ADMIN_USER,
    skills: [
      { skillId: 'SKL-2245', name: 'NDT Level II', level: 'Expert', verified: true },
      { skillId: 'SKL-3140', name: 'Site Safety Compliance', level: 'Adv', verified: true }
    ],
    certifications: [
      { certId: 'CRT-5210', name: 'ASNT NDT Level III', issuer: 'ASNT', expiryDate: '2028-01-10', status: 'valid' }
    ]
  },
  {
    id: 'WKR-3108',
    fullName: 'Thomas Vance',
    role: 'Forestry Equipment Specialist',
    cooperativeId: 'COOP-03',
    cooperativeName: 'Cascadia Forestry Cooperative',
    employmentType: 'Stand-down',
    status: 'inactive',
    email: 'thomas.v@cascadiaforestry.org',
    phone: '+1 (555) 412-9904',
    joinedDate: 'Apr 12, 2018',
    yearsOfService: '8 Yrs',
    avatar: MASTER_AVATARS.ADMIN_USER,
    skills: [
      { skillId: 'SKL-3104', name: 'Hydraulic Excavators', level: 'Expert', verified: true }
    ],
    certifications: [
      { certId: 'CRT-3108', name: 'Timber Faller Tier 3', issuer: 'PRFSC', expiryDate: '2026-06-30', status: 'expired' }
    ]
  }
];

// Initial Reports
export const INITIAL_REPORTS: ReportRecord[] = [
  {
    id: 'REP-2026-Q3-01',
    title: 'Workforce Regulatory & Safety Compliance Audit',
    category: 'Regulatory & Governance',
    generatedDate: 'Sep 08, 2026',
    fileSize: '4.8 MB',
    format: 'PDF',
    recordCount: 2845,
    downloadUrl: '#download-rep-1',
    summary: 'Comprehensive cross-cooperative audit covering OSHA, DOT, AWS, and regional labor standard adherence.'
  },
  {
    id: 'REP-2026-Q3-02',
    title: 'Workforce Skills Deficit & Gap Analysis Forecast',
    category: 'Skills & Capabilities',
    generatedDate: 'Sep 06, 2026',
    fileSize: '2.3 MB',
    format: 'Excel',
    recordCount: 142,
    downloadUrl: '#download-rep-2',
    summary: 'Identifies high-urgency capacity deficits in robotic welding, high-voltage battery storage, and precision irrigation.'
  },
  {
    id: 'REP-2026-Q3-03',
    title: '30-60-90 Day Credential Expiration Risk Register',
    category: 'Certifications',
    generatedDate: 'Sep 05, 2026',
    fileSize: '1.4 MB',
    format: 'CSV',
    recordCount: 140,
    downloadUrl: '#download-rep-3',
    summary: 'Detailed roster of 28 critical 30-day credential expiries and 112 stand-down expired records needing renewal.'
  },
  {
    id: 'REP-2026-Q3-04',
    title: 'Federation Member Headcount & Shift Utilization Matrix',
    category: 'Operations',
    generatedDate: 'Sep 01, 2026',
    fileSize: '3.1 MB',
    format: 'PDF',
    recordCount: 18,
    downloadUrl: '#download-rep-4',
    summary: 'Operational utilization across 18 regional societies with shift coverage breakdowns and overtime ratios.'
  }
];

// System Total Numbers (Guaranteed Internal Consistency)
export const SYSTEM_METRICS = {
  totalWorkforce: 2845,
  activeWorkers: 2410,
  inactiveWorkers: 285,
  onboardingWorkers: 150,
  totalCooperatives: 18,
  activeCooperatives: 18,
  avgComplianceRate: 95.8,
  totalCertifications: 2835,
  validCertifications: 2546,
  expiringCertifications: 28,
  expiredCertifications: 112,
  pendingCertifications: 149,
  urgentVerificationQueue: 14,
  totalSkills: 142,
  skillCategories: 12,
  mappedWorkersCount: 2710,
  verifiedSkillsCount: 1940
};
