import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { apiClient } from './src/services/api';
import {
  WorkerAvailabilityStatus,
  ProficiencyLevel,
  IWorkerSkill,
  IJobAssignment,
} from '@cshrk/types';

const INITIAL_SKILLS: IWorkerSkill[] = [
  {
    id: 'ws-101',
    workerId: 'w-dev-01',
    skillId: 's-elec-01',
    skill: {
      id: 's-elec-01',
      code: 'ELEC-IND',
      name: 'Industrial Electrical & Conduit Wiring',
      category: 'Electrical',
      description: '3-phase wiring, industrial breaker installation, commercial transformers',
    },
    proficiencyLevel: ProficiencyLevel.EXPERT,
    isVerified: true,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-20T14:30:00.000Z',
  },
  {
    id: 'ws-102',
    workerId: 'w-dev-01',
    skillId: 's-plumb-02',
    skill: {
      id: 's-plumb-02',
      code: 'PLUMB-COMM',
      name: 'Commercial Pipefitting & Hydraulics',
      category: 'Plumbing',
      description: 'High-pressure water distribution, PPR pipe jointing, pump manifolds',
    },
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    isVerified: true,
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-02-10T11:20:00.000Z',
  },
  {
    id: 'ws-103',
    workerId: 'w-dev-01',
    skillId: 's-solar-03',
    skill: {
      id: 's-solar-03',
      code: 'SOLAR-PV',
      name: 'Rooftop Solar PV Installation',
      category: 'Renewable Energy',
      description: 'Solar panel array mounting, microinverter connections, net metering',
    },
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    isVerified: false,
    createdAt: '2026-03-01T15:00:00.000Z',
    updatedAt: '2026-03-01T15:00:00.000Z',
  },
];

const INITIAL_JOBS: IJobAssignment[] = [
  {
    id: 'job-01',
    bookingId: 'bk-901',
    serviceRequestId: 'sr-901',
    customerName: 'Apex Logistics Distribution Center',
    serviceCategory: 'Electrical',
    title: 'Commercial Breaker Inspection & Thermal Scan',
    description: 'Annual distribution board audit, infrared scan of 400A main switches.',
    locationAddress: 'Plot 42, Okhla Industrial Area Phase III, New Delhi',
    distanceKm: 2.8,
    scheduledAt: 'Today, 2:30 PM',
    estimatedPayout: 2550,
    status: 'PENDING_ACCEPTANCE',
  },
  {
    id: 'job-02',
    bookingId: 'bk-882',
    serviceRequestId: 'sr-882',
    customerName: 'Mayfair Residency Cooperative Society',
    serviceCategory: 'Plumbing',
    title: 'Underground Reservoir Booster Pump Repair',
    description: 'Replace faulty non-return valve and pressure switch calibrator.',
    locationAddress: 'Gate 2, Mayfair Gardens, Hauz Khas, New Delhi',
    distanceKm: 5.4,
    scheduledAt: 'Tomorrow, 10:00 AM',
    estimatedPayout: 1800,
    status: 'ACCEPTED',
  },
  {
    id: 'job-03',
    bookingId: 'bk-710',
    serviceRequestId: 'sr-710',
    customerName: 'Metro Rail Substation Office',
    serviceCategory: 'Electrical',
    title: 'Backup Generator Emergency Auto-Transfer Switch',
    description: 'Tested ATS response under load simulation, replaced auxiliary contacts.',
    locationAddress: 'Barakhamba Road Station Compound, Connaught Place',
    distanceKm: 4.1,
    scheduledAt: '8 Sep 2026',
    estimatedPayout: 3200,
    status: 'COMPLETED',
  },
];

function WorkerAppContent() {
  const { user, login, register, logout, isLoading, error } = useAuth();
  const [screen, setScreen] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'skills' | 'jobs' | 'profile'>('dashboard');

  // Operational State
  const [availability, setAvailability] = useState<WorkerAvailabilityStatus>(WorkerAvailabilityStatus.AVAILABLE);
  const [gpsActive, setGpsActive] = useState<boolean>(true);
  const [skillsList, setSkillsList] = useState<IWorkerSkill[]>(INITIAL_SKILLS);
  const [jobsList, setJobsList] = useState<IJobAssignment[]>(INITIAL_JOBS);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Skill Claim Modal State
  const [isSkillModalVisible, setIsSkillModalVisible] = useState<boolean>(false);
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillCategory, setNewSkillCategory] = useState<string>('Electrical');
  const [newSkillLevel, setNewSkillLevel] = useState<ProficiencyLevel>(ProficiencyLevel.INTERMEDIATE);

  // Form states for login/register
  const [email, setEmail] = useState('dev_worker@cshrk.local');
  const [password, setPassword] = useState('DevPass123!');
  const [fullName, setFullName] = useState('');

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 3500);
  };

  const handleAvailabilityChange = (newStatus: WorkerAvailabilityStatus) => {
    setAvailability(newStatus);
    apiClient.patch('/workers/me/availability', { status: newStatus }).catch(() => {});
    const label =
      newStatus === WorkerAvailabilityStatus.AVAILABLE
        ? 'Active & Available for Dispatches'
        : newStatus === WorkerAvailabilityStatus.BUSY
        ? 'Busy on Active Assignment'
        : 'Offline / Off-Duty';
    triggerNotification(`Status updated: ${label}`);
  };

  const handleJobResponse = (jobId: string, action: 'ACCEPT' | 'DECLINE') => {
    setJobsList((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, status: action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED' }
          : job
      )
    );
    const target = jobsList.find((j) => j.id === jobId);
    const bId = target?.bookingId || jobId;
    apiClient.post(`/workers/me/jobs/${bId}/respond`, { action }).catch(() => {});
    if (action === 'ACCEPT') {
      triggerNotification('Job accepted! Customer notified and dispatch confirmed.');
    } else {
      triggerNotification('Job declined and returned to cooperative dispatch pool.');
    }
  };

  const handleAddSkillClaim = () => {
    if (!newSkillName.trim()) return;
    const customSkillId = `s-custom-${Date.now()}`;
    const newSkill: IWorkerSkill = {
      id: `ws-${Date.now()}`,
      workerId: 'w-dev-01',
      skillId: customSkillId,
      skill: {
        id: customSkillId,
        code: `SKILL-${newSkillCategory.toUpperCase().slice(0, 4)}`,
        name: newSkillName.trim(),
        category: newSkillCategory,
      },
      proficiencyLevel: newSkillLevel,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSkillsList([newSkill, ...skillsList]);
    apiClient.post('/workers/me/skills', { skillId: customSkillId, proficiencyLevel: newSkillLevel }).catch(() => {});
    setNewSkillName('');
    setIsSkillModalVisible(false);
    triggerNotification('New skill endorsement submitted for Cooperative Society verification!');
  };

  // 1. Authenticated Worker View
  if (user) {
    const pendingJob = jobsList.find((j) => j.status === 'PENDING_ACCEPTANCE');
    const activeJobs = jobsList.filter((j) => j.status === 'ACCEPTED');
    const completedJobs = jobsList.filter((j) => j.status === 'COMPLETED');

    return (
      <SafeAreaView style={styles.container}>
        {/* Top Operational Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>CSHRK Worker</Text>
            <Text style={styles.headerSubtitle}>Delhi Central Labour Cooperative Society</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              availability === WorkerAvailabilityStatus.AVAILABLE
                ? styles.badgeAvailable
                : availability === WorkerAvailabilityStatus.BUSY
                ? styles.badgeBusy
                : styles.badgeOffline,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                availability === WorkerAvailabilityStatus.AVAILABLE
                  ? styles.dotAvailable
                  : availability === WorkerAvailabilityStatus.BUSY
                  ? styles.dotBusy
                  : styles.dotOffline,
              ]}
            />
            <Text style={styles.statusBadgeText}>
              {availability === WorkerAvailabilityStatus.AVAILABLE
                ? 'AVAILABLE'
                : availability === WorkerAvailabilityStatus.BUSY
                ? 'BUSY'
                : 'OFFLINE'}
            </Text>
          </View>
        </View>

        {/* Global Toast / Banner */}
        {notificationMsg && (
          <View style={styles.toastBanner}>
            <Text style={styles.toastText}>{notificationMsg}</Text>
          </View>
        )}

        {/* Tab Body */}
        <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* TAB 1: WORKER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <View>
              {/* Availability Switcher Card */}
              <View style={styles.card}>
                <Text style={styles.sectionHeader}>Operational Availability</Text>
                <Text style={styles.sectionSub}>
                  Toggle your current dispatch readiness. Nearby cooperative jobs are matched in real-time.
                </Text>
                <View style={styles.availabilityToggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      availability === WorkerAvailabilityStatus.AVAILABLE && styles.toggleBtnActiveAvail,
                    ]}
                    onPress={() => handleAvailabilityChange(WorkerAvailabilityStatus.AVAILABLE)}
                  >
                    <Text
                      style={[
                        styles.toggleBtnText,
                        availability === WorkerAvailabilityStatus.AVAILABLE && styles.toggleBtnTextActive,
                      ]}
                    >
                      ● Available
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      availability === WorkerAvailabilityStatus.BUSY && styles.toggleBtnActiveBusy,
                    ]}
                    onPress={() => handleAvailabilityChange(WorkerAvailabilityStatus.BUSY)}
                  >
                    <Text
                      style={[
                        styles.toggleBtnText,
                        availability === WorkerAvailabilityStatus.BUSY && styles.toggleBtnTextActive,
                      ]}
                    >
                      ● Busy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      availability === WorkerAvailabilityStatus.OFFLINE && styles.toggleBtnActiveOffline,
                    ]}
                    onPress={() => handleAvailabilityChange(WorkerAvailabilityStatus.OFFLINE)}
                  >
                    <Text
                      style={[
                        styles.toggleBtnText,
                        availability === WorkerAvailabilityStatus.OFFLINE && styles.toggleBtnTextActive,
                      ]}
                    >
                      ● Offline
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Urgent Dispatch Request (Job Acceptance Flow) */}
              {pendingJob && availability !== WorkerAvailabilityStatus.OFFLINE && (
                <View style={styles.urgentDispatchCard}>
                  <View style={styles.urgentHeaderRow}>
                    <Text style={styles.urgentTag}>🚨 INCOMING JOB DISPATCH</Text>
                    <Text style={styles.urgentDistance}>{pendingJob.distanceKm} km away</Text>
                  </View>
                  <Text style={styles.urgentTitle}>{pendingJob.title}</Text>
                  <Text style={styles.urgentCustomer}>{pendingJob.customerName}</Text>
                  <Text style={styles.urgentAddress}>📍 {pendingJob.locationAddress}</Text>

                  <View style={styles.urgentMetaRow}>
                    <View>
                      <Text style={styles.metaLabel}>Schedule</Text>
                      <Text style={styles.metaVal}>{pendingJob.scheduledAt}</Text>
                    </View>
                    <View>
                      <Text style={styles.metaLabel}>Estimated Payout</Text>
                      <Text style={styles.payoutVal}>₹ {pendingJob.estimatedPayout}</Text>
                    </View>
                  </View>

                  <View style={styles.actionButtonRow}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleJobResponse(pendingJob.id, 'ACCEPT')}
                    >
                      <Text style={styles.acceptButtonText}>Accept Assignment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => handleJobResponse(pendingJob.id, 'DECLINE')}
                    >
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* KPI Performance Tiles */}
              <View style={styles.kpiGrid}>
                <View style={styles.kpiTile}>
                  <Text style={styles.kpiLabel}>Jobs Completed</Text>
                  <Text style={styles.kpiValue}>28</Text>
                  <Text style={styles.kpiSub}>+4 this week</Text>
                </View>
                <View style={styles.kpiTile}>
                  <Text style={styles.kpiLabel}>Quality Rating</Text>
                  <Text style={styles.kpiValue}>4.9 ★</Text>
                  <Text style={styles.kpiSub}>32 Customer Reviews</Text>
                </View>
                <View style={styles.kpiTile}>
                  <Text style={styles.kpiLabel}>On-Time Rate</Text>
                  <Text style={styles.kpiValue}>98%</Text>
                  <Text style={styles.kpiSub}>Cooperative Tier 1</Text>
                </View>
                <View style={styles.kpiTile}>
                  <Text style={styles.kpiLabel}>Member ID</Text>
                  <Text style={styles.kpiValueSmall}>DL-2024-89</Text>
                  <Text style={styles.kpiSub}>Full Member</Text>
                </View>
              </View>

              {/* Quick Skill Passport Snapshot */}
              <View style={styles.card}>
                <View style={styles.cardHeaderFlex}>
                  <Text style={styles.sectionHeader}>Verified Skill Passport</Text>
                  <TouchableOpacity onPress={() => setActiveTab('skills')}>
                    <Text style={styles.linkText}>View All →</Text>
                  </TouchableOpacity>
                </View>
                {skillsList.slice(0, 2).map((sk) => (
                  <View key={sk.id} style={styles.miniSkillItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.skillItemName}>{sk.skill?.name}</Text>
                      <Text style={styles.skillItemCat}>{sk.skill?.category} • Level: {sk.proficiencyLevel}</Text>
                    </View>
                    {sk.isVerified ? (
                      <View style={styles.verifiedTag}>
                        <Text style={styles.verifiedTagText}>✓ Verified</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingTag}>
                        <Text style={styles.pendingTagText}>⏳ Pending</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: SKILL PASSPORT */}
          {activeTab === 'skills' && (
            <View>
              <View style={styles.passportBannerCard}>
                <Text style={styles.passportBannerTitle}>Official Skill Passport</Text>
                <Text style={styles.passportBannerSub}>
                  Standardized trades certified by Primary Labour Cooperative Society under National Federation standards.
                </Text>
                <View style={styles.passportStatsRow}>
                  <View style={styles.passportStat}>
                    <Text style={styles.passportStatNum}>
                      {skillsList.filter((s) => s.isVerified).length}
                    </Text>
                    <Text style={styles.passportStatLabel}>Verified Trades</Text>
                  </View>
                  <View style={styles.passportStat}>
                    <Text style={styles.passportStatNum}>
                      {skillsList.filter((s) => !s.isVerified).length}
                    </Text>
                    <Text style={styles.passportStatLabel}>Under Review</Text>
                  </View>
                  <View style={styles.passportStat}>
                    <Text style={styles.passportStatNum}>2</Text>
                    <Text style={styles.passportStatLabel}>Certifications</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionHeaderRow}>
                <Text style={styles.sectionHeader}>Registered Trade Credentials</Text>
                <TouchableOpacity
                  style={styles.claimSkillBtn}
                  onPress={() => setIsSkillModalVisible(true)}
                >
                  <Text style={styles.claimSkillBtnText}>+ Claim Trade</Text>
                </TouchableOpacity>
              </View>

              {skillsList.map((ws) => (
                <View key={ws.id} style={styles.skillFullCard}>
                  <View style={styles.skillCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.skillCardTitle}>{ws.skill?.name}</Text>
                      <Text style={styles.skillCardCode}>Code: {ws.skill?.code} • {ws.skill?.category}</Text>
                    </View>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>{ws.proficiencyLevel}</Text>
                    </View>
                  </View>
                  <Text style={styles.skillCardDesc}>{ws.skill?.description || 'Standardized trade certification.'}</Text>
                  <View style={styles.skillCardBottom}>
                    {ws.isVerified ? (
                      <View style={styles.verifiedBadgeFull}>
                        <Text style={styles.verifiedBadgeText}>
                          ✓ Verified by Delhi Central Labour Society
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.pendingBadgeFull}>
                        <Text style={styles.pendingBadgeText}>
                          ⏳ Pending Cooperative Committee Review
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {/* Certifications Section */}
              <Text style={[styles.sectionHeader, { marginTop: 24, marginBottom: 12 }]}>
                Government & Federation Certifications
              </Text>
              <View style={styles.certCard}>
                <Text style={styles.certTitle}>NSDC National Trade Qualification (Level 4)</Text>
                <Text style={styles.certIssuer}>Issued by: National Skill Development Corporation</Text>
                <Text style={styles.certStatus}>✓ Verified Credentials • Valid through Dec 2028</Text>
              </View>
              <View style={styles.certCard}>
                <Text style={styles.certTitle}>Industrial High-Voltage Safety Accreditation</Text>
                <Text style={styles.certIssuer}>Issued by: Federation Training Academy</Text>
                <Text style={styles.certStatus}>✓ Verified Credentials • Valid through Aug 2027</Text>
              </View>
            </View>
          )}

          {/* TAB 3: JOBS & ASSIGNMENTS */}
          {activeTab === 'jobs' && (
            <View>
              <Text style={styles.sectionHeader}>Dispatch Assignments</Text>
              <Text style={styles.sectionSub}>Review pending tenders, active works, and completed services.</Text>

              {/* Active Jobs */}
              <Text style={[styles.subHeader, { marginTop: 16 }]}>Active / En Route ({activeJobs.length})</Text>
              {activeJobs.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No active jobs currently in progress.</Text>
                </View>
              ) : (
                activeJobs.map((j) => (
                  <View key={j.id} style={styles.jobCard}>
                    <View style={styles.jobStatusRow}>
                      <View style={styles.activeTag}>
                        <Text style={styles.activeTagText}>ACCEPTED & SCHEDULED</Text>
                      </View>
                      <Text style={styles.jobPayout}>₹ {j.estimatedPayout}</Text>
                    </View>
                    <Text style={styles.jobTitle}>{j.title}</Text>
                    <Text style={styles.jobCustomer}>{j.customerName}</Text>
                    <Text style={styles.jobAddress}>📍 {j.locationAddress}</Text>
                    <Text style={styles.jobTime}>🕒 {j.scheduledAt}</Text>
                  </View>
                ))
              )}

              {/* History */}
              <Text style={[styles.subHeader, { marginTop: 20 }]}>Completed History ({completedJobs.length})</Text>
              {completedJobs.map((j) => (
                <View key={j.id} style={styles.jobCardHistory}>
                  <View style={styles.jobStatusRow}>
                    <View style={styles.completedTag}>
                      <Text style={styles.completedTagText}>✓ COMPLETED</Text>
                    </View>
                    <Text style={styles.historyPayout}>₹ {j.estimatedPayout}</Text>
                  </View>
                  <Text style={styles.jobTitle}>{j.title}</Text>
                  <Text style={styles.jobCustomer}>{j.customerName}</Text>
                  <Text style={styles.jobTime}>Finished on {j.scheduledAt}</Text>
                </View>
              ))}
            </View>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <View>
              <View style={styles.card}>
                <View style={styles.profileAvatarRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>
                      {user.email.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 16 }}>
                    <Text style={styles.profileName}>Dev Worker Member</Text>
                    <Text style={styles.profileEmail}>{user.email}</Text>
                    <Text style={styles.profileRole}>Role: {user.role}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionHeader}>Cooperative Affiliation</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Society</Text>
                  <Text style={styles.detailVal}>Delhi Central Labour Society</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Registration ID</Text>
                  <Text style={styles.detailVal}>REG-DL-2018-0912</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Member Code</Text>
                  <Text style={styles.detailVal}>DL-LCS-2024-089</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Welfare Scheme</Text>
                  <Text style={styles.detailVal}>Active (Health & Accident Coverage)</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionHeader}>Operational Settings</Text>
                <TouchableOpacity
                  style={styles.settingToggleRow}
                  onPress={() => {
                    const nextGps = !gpsActive;
                    setGpsActive(nextGps);
                    if (nextGps) {
                      apiClient.patch('/workers/me/location', { latitude: 28.6139, longitude: 77.2090 }).catch(() => {});
                    }
                    triggerNotification(
                      nextGps
                        ? 'Real-time GPS broadcasting active'
                        : 'GPS location broadcasting paused'
                    );
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>GPS Location Broadcasting</Text>
                    <Text style={styles.settingSub}>
                      Transmits coordinates for nearby dispatch matching
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.toggleSwitch,
                      gpsActive ? styles.toggleSwitchOn : styles.toggleSwitchOff,
                    ]}
                  >
                    <Text style={styles.toggleSwitchText}>{gpsActive ? 'ON' : 'OFF'}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.buttonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Claim Skill Modal */}
        <Modal visible={isSkillModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Claim Trade Skill</Text>
              <Text style={styles.modalSubtitle}>
                Add a skill to your Skill Passport. Your cooperative verification committee will review your claim.
              </Text>

              <Text style={styles.inputLabel}>Trade Skill Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Substation Transformer Servicing"
                value={newSkillName}
                onChangeText={setNewSkillName}
              />

              <Text style={styles.inputLabel}>Trade Category</Text>
              <View style={styles.categoryPillRow}>
                {['Electrical', 'Plumbing', 'Carpentry', 'HVAC', 'Masonry'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catPill,
                      newSkillCategory === cat && styles.catPillActive,
                    ]}
                    onPress={() => setNewSkillCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.catPillText,
                        newSkillCategory === cat && styles.catPillTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Self-Assessed Proficiency</Text>
              <View style={styles.categoryPillRow}>
                {[
                  ProficiencyLevel.BEGINNER,
                  ProficiencyLevel.INTERMEDIATE,
                  ProficiencyLevel.ADVANCED,
                  ProficiencyLevel.EXPERT,
                ].map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.catPill,
                      newSkillLevel === lvl && styles.catPillActive,
                    ]}
                    onPress={() => setNewSkillLevel(lvl)}
                  >
                    <Text
                      style={[
                        styles.catPillText,
                        newSkillLevel === lvl && styles.catPillTextActive,
                      ]}
                    >
                      {lvl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsSkillModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleAddSkillClaim}
                >
                  <Text style={styles.modalSubmitText}>Submit Claim</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Bottom Nav Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.navIcon, activeTab === 'dashboard' && styles.navTextActive]}>📊</Text>
            <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'skills' && styles.navItemActive]}
            onPress={() => setActiveTab('skills')}
          >
            <Text style={[styles.navIcon, activeTab === 'skills' && styles.navTextActive]}>🎖️</Text>
            <Text style={[styles.navText, activeTab === 'skills' && styles.navTextActive]}>Passport</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'jobs' && styles.navItemActive]}
            onPress={() => setActiveTab('jobs')}
          >
            <Text style={[styles.navIcon, activeTab === 'jobs' && styles.navTextActive]}>📋</Text>
            <Text style={[styles.navText, activeTab === 'jobs' && styles.navTextActive]}>Assignments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'profile' && styles.navItemActive]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.navIcon, activeTab === 'profile' && styles.navTextActive]}>👤</Text>
            <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Unauthenticated Flows
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.logoTitle}>CSHRK</Text>
        <Text style={styles.logoSubtitle}>Cooperative Worker Portal</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {screen === 'login' ? (
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>Worker Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => login(email, password)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreen('register')} style={styles.linkButton}>
              <Text style={styles.linkText}>New worker? Register account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>Worker Registration</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => register(fullName, email, password)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Register as Worker</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreen('login')} style={styles.linkButton}>
              <Text style={styles.linkText}>Already registered? Log in</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkerAppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#00288E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: '#DDE1FF', fontSize: 11, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeAvailable: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  badgeBusy: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  badgeOffline: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  dotAvailable: { backgroundColor: '#059669' },
  dotBusy: { backgroundColor: '#D97706' },
  dotOffline: { backgroundColor: '#64748B' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#0F172A' },
  toastBanner: {
    backgroundColor: '#00288E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  body: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  sectionSub: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 14 },
  subHeader: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  availabilityToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleBtnActiveAvail: { backgroundColor: '#059669' },
  toggleBtnActiveBusy: { backgroundColor: '#D97706' },
  toggleBtnActiveOffline: { backgroundColor: '#475569' },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  toggleBtnTextActive: { color: '#FFFFFF', fontWeight: '700' },
  urgentDispatchCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  urgentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgentTag: { color: '#1E40AF', fontWeight: '800', fontSize: 12 },
  urgentDistance: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  urgentCustomer: { fontSize: 14, color: '#334155', fontWeight: '600', marginBottom: 6 },
  urgentAddress: { fontSize: 13, color: '#64748B', marginBottom: 12 },
  urgentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 14,
  },
  metaLabel: { fontSize: 11, color: '#64748B', marginBottom: 2 },
  metaVal: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  payoutVal: { fontSize: 16, fontWeight: '800', color: '#059669' },
  actionButtonRow: { flexDirection: 'row', gap: 10 },
  acceptButton: {
    flex: 2,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  declineButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  declineButtonText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiTile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  kpiValue: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginVertical: 4 },
  kpiValueSmall: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginVertical: 6 },
  kpiSub: { fontSize: 11, color: '#059669', fontWeight: '600' },
  miniSkillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  skillItemName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  skillItemCat: { fontSize: 12, color: '#64748B', marginTop: 2 },
  verifiedTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedTagText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  pendingTag: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingTagText: { fontSize: 11, fontWeight: '700', color: '#B45309' },
  passportBannerCard: {
    backgroundColor: '#00288E',
    padding: 18,
    borderRadius: 10,
    marginBottom: 18,
  },
  passportBannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  passportBannerSub: { color: '#DDE1FF', fontSize: 12, marginTop: 4, lineHeight: 18 },
  passportStatsRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
  passportStat: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  passportStatNum: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  passportStatLabel: { color: '#DDE1FF', fontSize: 10, marginTop: 2 },
  actionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  claimSkillBtn: {
    backgroundColor: '#00288E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  claimSkillBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  skillFullCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  skillCardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  skillCardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  skillCardCode: { fontSize: 12, color: '#64748B', marginTop: 2 },
  levelBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    height: 24,
  },
  levelBadgeText: { fontSize: 11, fontWeight: '700', color: '#1E40AF' },
  skillCardDesc: { fontSize: 13, color: '#475569', marginVertical: 10, lineHeight: 18 },
  skillCardBottom: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  verifiedBadgeFull: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  verifiedBadgeText: { fontSize: 12, color: '#059669', fontWeight: '700' },
  pendingBadgeFull: {
    backgroundColor: '#FFFBEB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  pendingBadgeText: { fontSize: 12, color: '#B45309', fontWeight: '700' },
  certCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  certTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  certIssuer: { fontSize: 12, color: '#64748B', marginTop: 3 },
  certStatus: { fontSize: 12, color: '#059669', fontWeight: '600', marginTop: 6 },
  jobCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  jobCardHistory: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  jobStatusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  activeTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  activeTagText: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  completedTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  completedTagText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  jobPayout: { fontSize: 16, fontWeight: '800', color: '#059669' },
  historyPayout: { fontSize: 14, fontWeight: '700', color: '#475569' },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  jobCustomer: { fontSize: 13, color: '#334155', marginTop: 2 },
  jobAddress: { fontSize: 12, color: '#64748B', marginTop: 6 },
  jobTime: { fontSize: 12, color: '#1E40AF', fontWeight: '600', marginTop: 6 },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: { color: '#64748B', fontSize: 13 },
  profileAvatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00288E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  profileName: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  profileEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  profileRole: { fontSize: 12, color: '#059669', fontWeight: '600', marginTop: 2 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: { fontSize: 13, color: '#64748B' },
  detailVal: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  settingToggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  settingSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  toggleSwitch: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  toggleSwitchOn: { backgroundColor: '#059669' },
  toggleSwitchOff: { backgroundColor: '#94A3B8' },
  toggleSwitchText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navItemActive: { borderTopWidth: 2, borderTopColor: '#00288E', marginTop: -8, paddingTop: 6 },
  navIcon: { fontSize: 16, marginBottom: 2 },
  navText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  navTextActive: { color: '#00288E', fontWeight: '700' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  logoTitle: { fontSize: 32, fontWeight: '800', color: '#00288E', textAlign: 'center' },
  logoSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 28 },
  primaryButton: {
    backgroundColor: '#00288E',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  formBox: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  linkButton: { alignItems: 'center', marginTop: 12 },
  linkText: { color: '#00288E', fontSize: 13, fontWeight: '600' },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: { color: '#991B1B', fontSize: 13 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  modalSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  categoryPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  catPillActive: { backgroundColor: '#00288E' },
  catPillText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  catPillTextActive: { color: '#FFFFFF' },
  modalButtonRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCancelText: { color: '#475569', fontWeight: '600' },
  modalSubmitBtn: {
    flex: 2,
    backgroundColor: '#00288E',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalSubmitText: { color: '#FFFFFF', fontWeight: '700' },
});
