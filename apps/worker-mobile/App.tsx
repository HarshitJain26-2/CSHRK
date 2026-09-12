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
      code: 'ELEC-01',
      name: 'Industrial Electrical Repair',
      category: 'Electrical',
      description: '3-phase wiring, industrial breaker installation',
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
      code: 'PLUMB-02',
      name: 'Commercial Pipefitting',
      category: 'Plumbing',
      description: 'High-pressure water distribution and pump manifolds',
    },
    proficiencyLevel: ProficiencyLevel.ADVANCED,
    isVerified: true,
    createdAt: '2026-02-01T09:00:00.000Z',
    updatedAt: '2026-02-10T11:20:00.000Z',
  },
  {
    id: 'ws-103',
    workerId: 'w-dev-01',
    skillId: 's-ac-03',
    skill: {
      id: 's-ac-03',
      code: 'HVAC-03',
      name: 'Central AC Maintenance',
      category: 'HVAC',
      description: 'Chiller refrigerant checks and duct airflow diagnostics',
    },
    proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
    isVerified: false,
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
  },
];

const INITIAL_JOBS: IJobAssignment[] = [
  {
    id: 'job-01',
    bookingId: 'bk-901',
    serviceRequestId: 'sr-901',
    customerName: 'DLF Cyber City Building 4',
    serviceCategory: 'Electrical',
    title: 'Emergency AC Electrical Panel Tripping',
    description: 'Main breaker trips upon activating condenser unit 2.',
    locationAddress: 'DLF Cyber City, Sector 24, Gurugram',
    distanceKm: 3.2,
    scheduledAt: 'Today, 2:00 PM',
    estimatedPayout: 1500,
    status: 'PENDING_ACCEPTANCE',
  },
  {
    id: 'job-02',
    bookingId: 'bk-842',
    serviceRequestId: 'sr-842',
    customerName: 'Prestige Tech Park Office 3',
    serviceCategory: 'Plumbing',
    title: 'Hydraulic Booster Pump Servicing',
    description: 'Periodic pressure calibration and flange replacement.',
    locationAddress: 'Outer Ring Road, Marathahalli',
    distanceKm: 5.4,
    scheduledAt: 'Today, 4:30 PM',
    estimatedPayout: 2200,
    status: 'ACCEPTED',
  },
  {
    id: 'job-03',
    bookingId: 'bk-710',
    serviceRequestId: 'sr-710',
    customerName: 'Metro Rail Substation Office',
    serviceCategory: 'Electrical',
    title: 'Backup Generator Emergency ATS Test',
    description: 'Tested ATS response under load simulation, replaced auxiliary contacts.',
    locationAddress: 'Barakhamba Road Station Compound, Connaught Place',
    distanceKm: 4.1,
    scheduledAt: 'Yesterday',
    estimatedPayout: 3200,
    status: 'COMPLETED',
  },
];

function WorkerAppContent() {
  const { user, login, register, logout, isLoading, error } = useAuth();
  const [screen, setScreen] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'skills' | 'profile'>('home');
  const [jobsFilter, setJobsFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all');

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
        ? 'Available for work'
        : newStatus === WorkerAvailabilityStatus.BUSY
        ? 'Busy on a job'
        : 'Offline';
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
      triggerNotification('Job accepted! Customer notified.');
    } else {
      triggerNotification('Job declined and sent back to cooperative.');
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
    triggerNotification('Skill added! Submitted for cooperative verification.');
  };

  // 1. Authenticated Worker View
  if (user) {
    const pendingJob = jobsList.find((j) => j.status === 'PENDING_ACCEPTANCE');
    const upcomingJob = jobsList.find((j) => j.status === 'ACCEPTED');
    const activeJobs = jobsList.filter((j) => j.status === 'ACCEPTED');
    const completedJobs = jobsList.filter((j) => j.status === 'COMPLETED');

    const filteredJobs = jobsList.filter((j) => {
      if (jobsFilter === 'upcoming') return j.status === 'PENDING_ACCEPTANCE';
      if (jobsFilter === 'active') return j.status === 'ACCEPTED';
      if (jobsFilter === 'completed') return j.status === 'COMPLETED';
      return true;
    });

    return (
      <SafeAreaView style={styles.container}>
        {/* Simple Notification Toast */}
        {notificationMsg && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{notificationMsg}</Text>
          </View>
        )}

        {/* Content Scroll View */}
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* ==================================================== */}
          {/* TAB 1: HOME (Worker Dashboard)                       */}
          {/* ==================================================== */}
          {activeTab === 'home' && (
            <View style={styles.tabContent}>
              {/* Header Greeting */}
              <View style={styles.homeHeader}>
                <Text style={styles.greetingText}>
                  Good morning, {(user as any).fullName || 'Carlos'}
                </Text>
                <Text style={styles.subGreetingText}>
                  Senior Electrician • Apex Agro Cooperative
                </Text>
              </View>

              {/* Status Control Card */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>YOUR STATUS</Text>
                <View style={styles.statusRow}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      availability === WorkerAvailabilityStatus.AVAILABLE && styles.statusBtnAvailableActive,
                    ]}
                    onPress={() => handleAvailabilityChange(WorkerAvailabilityStatus.AVAILABLE)}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            availability === WorkerAvailabilityStatus.AVAILABLE ? '#fff' : '#16a34a',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusBtnText,
                        availability === WorkerAvailabilityStatus.AVAILABLE && styles.statusBtnTextActive,
                      ]}
                    >
                      Available
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      availability === WorkerAvailabilityStatus.BUSY && styles.statusBtnBusyActive,
                    ]}
                    onPress={() => handleAvailabilityChange(WorkerAvailabilityStatus.BUSY)}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            availability === WorkerAvailabilityStatus.BUSY ? '#fff' : '#d97706',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusBtnText,
                        availability === WorkerAvailabilityStatus.BUSY && styles.statusBtnTextActive,
                      ]}
                    >
                      Busy
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      availability === WorkerAvailabilityStatus.OFFLINE && styles.statusBtnOfflineActive,
                    ]}
                    onPress={() => handleAvailabilityChange(WorkerAvailabilityStatus.OFFLINE)}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            availability === WorkerAvailabilityStatus.OFFLINE ? '#fff' : '#64748b',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusBtnText,
                        availability === WorkerAvailabilityStatus.OFFLINE && styles.statusBtnTextActive,
                      ]}
                    >
                      Offline
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* TODAY Summary Card */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>TODAY</Text>
                <View style={styles.todayStatsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>2</Text>
                    <Text style={styles.statLabel}>Today's jobs</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>1</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>1</Text>
                    <Text style={styles.statLabel}>Upcoming</Text>
                  </View>
                </View>
              </View>

              {/* Urgent New Job Request Banner (if any) */}
              {pendingJob && (
                <View style={[styles.card, styles.newJobCard]}>
                  <View style={styles.newJobBadge}>
                    <Text style={styles.newJobBadgeText}>NEW JOB REQUEST</Text>
                  </View>
                  <Text style={styles.newJobTitle}>{pendingJob.title}</Text>
                  <Text style={styles.newJobLocation}>
                    📍 {pendingJob.locationAddress} ({pendingJob.distanceKm} km away)
                  </Text>
                  <Text style={styles.newJobPayout}>₹{pendingJob.estimatedPayout}</Text>

                  <View style={styles.newJobActions}>
                    <TouchableOpacity
                      style={styles.btnAccept}
                      onPress={() => handleJobResponse(pendingJob.id, 'ACCEPT')}
                    >
                      <Text style={styles.btnAcceptText}>Accept Job</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnDecline}
                      onPress={() => handleJobResponse(pendingJob.id, 'DECLINE')}
                    >
                      <Text style={styles.btnDeclineText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* NEXT JOB Card */}
              {upcomingJob && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>NEXT JOB</Text>
                  <Text style={styles.jobTitleText}>{upcomingJob.title}</Text>
                  <Text style={styles.jobDetailText}>🏢 {upcomingJob.customerName}</Text>
                  <Text style={styles.jobDetailText}>🕒 {upcomingJob.scheduledAt}</Text>
                  <Text style={styles.jobDetailText}>📍 {upcomingJob.distanceKm} km away</Text>

                  <TouchableOpacity
                    style={styles.btnViewJob}
                    onPress={() => setActiveTab('jobs')}
                  >
                    <Text style={styles.btnViewJobText}>View Job Details</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* MY WORK (Quick Information) */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>MY WORK</Text>
                <View style={styles.todayStatsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>28</Text>
                    <Text style={styles.statLabel}>Jobs completed</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>⭐ 4.9</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>₹38,500</Text>
                    <Text style={styles.statLabel}>This month</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ==================================================== */}
          {/* TAB 2: MY JOBS                                       */}
          {/* ==================================================== */}
          {activeTab === 'jobs' && (
            <View style={styles.tabContent}>
              <View style={styles.homeHeader}>
                <Text style={styles.greetingText}>My Jobs</Text>
                <Text style={styles.subGreetingText}>
                  Assigned dispatches and job history
                </Text>
              </View>

              {/* Simple 3 Filters */}
              <View style={styles.pillRow}>
                <TouchableOpacity
                  style={[styles.pill, jobsFilter === 'all' && styles.pillActive]}
                  onPress={() => setJobsFilter('all')}
                >
                  <Text style={[styles.pillText, jobsFilter === 'all' && styles.pillTextActive]}>
                    All ({jobsList.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pill, jobsFilter === 'upcoming' && styles.pillActive]}
                  onPress={() => setJobsFilter('upcoming')}
                >
                  <Text style={[styles.pillText, jobsFilter === 'upcoming' && styles.pillTextActive]}>
                    Upcoming ({jobsList.filter((j) => j.status === 'PENDING_ACCEPTANCE').length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pill, jobsFilter === 'active' && styles.pillActive]}
                  onPress={() => setJobsFilter('active')}
                >
                  <Text style={[styles.pillText, jobsFilter === 'active' && styles.pillTextActive]}>
                    Active ({activeJobs.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pill, jobsFilter === 'completed' && styles.pillActive]}
                  onPress={() => setJobsFilter('completed')}
                >
                  <Text style={[styles.pillText, jobsFilter === 'completed' && styles.pillTextActive]}>
                    Completed ({completedJobs.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Jobs List */}
              {filteredJobs.map((job) => (
                <View key={job.id} style={styles.card}>
                  <View style={styles.jobHeaderRow}>
                    <Text style={styles.jobTitleText}>{job.title}</Text>
                    <Text style={styles.jobPayoutTag}>₹{job.estimatedPayout}</Text>
                  </View>
                  <Text style={styles.jobDetailText}>👤 {job.customerName}</Text>
                  <Text style={styles.jobDetailText}>📍 {job.locationAddress}</Text>
                  <Text style={styles.jobDetailText}>
                    🕒 {job.scheduledAt} • {job.distanceKm} km away
                  </Text>

                  {job.status === 'PENDING_ACCEPTANCE' ? (
                    <View style={styles.newJobActions}>
                      <TouchableOpacity
                        style={styles.btnAccept}
                        onPress={() => handleJobResponse(job.id, 'ACCEPT')}
                      >
                        <Text style={styles.btnAcceptText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.btnDecline}
                        onPress={() => handleJobResponse(job.id, 'DECLINE')}
                      >
                        <Text style={styles.btnDeclineText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.jobStatusRow}>
                      <Text
                        style={[
                          styles.jobStatusBadge,
                          job.status === 'ACCEPTED' ? styles.badgeActive : styles.badgeDone,
                        ]}
                      >
                        {job.status === 'ACCEPTED' ? 'Active Job' : 'Completed'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* ==================================================== */}
          {/* TAB 3: MY SKILLS                                     */}
          {/* ==================================================== */}
          {activeTab === 'skills' && (
            <View style={styles.tabContent}>
              <View style={styles.skillsHeaderRow}>
                <View>
                  <Text style={styles.greetingText}>My Skills</Text>
                  <Text style={styles.subGreetingText}>
                    Verified trade competencies
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.btnAddSkill}
                  onPress={() => setIsSkillModalVisible(true)}
                >
                  <Text style={styles.btnAddSkillText}>+ Add Skill</Text>
                </TouchableOpacity>
              </View>

              {skillsList.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.skillRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.skillName}>{item.skill?.name || 'Trade Skill'}</Text>
                      <Text style={styles.skillSub}>
                        Category: {item.skill?.category || 'General'} • Level: {item.proficiencyLevel}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badgeWrapper,
                        item.isVerified ? styles.badgeVerified : styles.badgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          item.isVerified ? styles.badgeTextVerified : styles.badgeTextPending,
                        ]}
                      >
                        {item.isVerified ? 'Verified' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ==================================================== */}
          {/* TAB 4: MY PROFILE                                    */}
          {/* ==================================================== */}
          {activeTab === 'profile' && (
            <View style={styles.tabContent}>
              <View style={styles.homeHeader}>
                <Text style={styles.greetingText}>My Profile</Text>
                <Text style={styles.subGreetingText}>
                  Personal and cooperative society info
                </Text>
              </View>

              {/* Profile Card */}
              <View style={styles.card}>
                <View style={styles.profileRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>
                      {(user as any).fullName ? (user as any).fullName[0].toUpperCase() : 'C'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileName}>{(user as any).fullName || 'Carlos Mendez'}</Text>
                    <Text style={styles.profileRole}>Senior Electrician</Text>
                    <Text style={styles.profileId}>Worker ID: WKR-8042</Text>
                  </View>
                </View>
              </View>

              {/* Details Card */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Phone Number</Text>
                  <Text style={styles.detailVal}>+1 (555) 019-2831</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Email Address</Text>
                  <Text style={styles.detailVal}>{user.email || 'carlos.mendez@worker.cshrk.org'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Cooperative Society</Text>
                  <Text style={styles.detailVal}>Apex Agro Cooperative</Text>
                </View>
              </View>

              {/* Quick Links Card */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>QUALIFICATIONS</Text>
                <TouchableOpacity
                  style={styles.menuRow}
                  onPress={() => setActiveTab('skills')}
                >
                  <Text style={styles.menuLabel}>My Skills ({skillsList.length})</Text>
                  <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>
                <View style={styles.statDivider} />
                <View style={styles.menuRow}>
                  <Text style={styles.menuLabel}>Safety Certificates (2 Valid)</Text>
                  <Text style={styles.menuArrow}>✓</Text>
                </View>
              </View>

              {/* Location Sharing Card */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>SETTINGS</Text>
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuLabel}>Location Sharing</Text>
                    <Text style={styles.skillSub}>
                      Allows nearby jobs to find your location
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      gpsActive ? styles.toggleOn : styles.toggleOff,
                    ]}
                    onPress={() => {
                      const next = !gpsActive;
                      setGpsActive(next);
                      if (next) {
                        apiClient.patch('/workers/me/location', { latitude: 28.6139, longitude: 77.2090 }).catch(() => {});
                      }
                      triggerNotification(next ? 'Location sharing active' : 'Location sharing paused');
                    }}
                  >
                    <Text style={styles.toggleText}>{gpsActive ? 'ON' : 'OFF'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Out Button */}
              <TouchableOpacity style={styles.btnSignOut} onPress={logout}>
                <Text style={styles.btnSignOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* ==================================================== */}
        {/* 4 BOTTOM NAVIGATION ITEMS ONLY                        */}
        {/* ==================================================== */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('home')}
          >
            <Text style={[styles.navIcon, activeTab === 'home' && styles.navIconActive]}>🏠</Text>
            <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('jobs')}
          >
            <Text style={[styles.navIcon, activeTab === 'jobs' && styles.navIconActive]}>💼</Text>
            <Text style={[styles.navLabel, activeTab === 'jobs' && styles.navLabelActive]}>Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('skills')}
          >
            <Text style={[styles.navIcon, activeTab === 'skills' && styles.navIconActive]}>⭐</Text>
            <Text style={[styles.navLabel, activeTab === 'skills' && styles.navLabelActive]}>Skills</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.navIcon, activeTab === 'profile' && styles.navIconActive]}>👤</Text>
            <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Add Skill Modal */}
        <Modal visible={isSkillModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add a Trade Skill</Text>
              <Text style={styles.modalSub}>
                Submit a new skill for cooperative society approval.
              </Text>

              <Text style={styles.inputLabel}>Skill Name</Text>
              <TextInput
                style={styles.input}
                value={newSkillName}
                onChangeText={setNewSkillName}
                placeholder="e.g. Solar Panel Installation"
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={newSkillCategory}
                onChangeText={setNewSkillCategory}
                placeholder="Electrical / Plumbing / HVAC"
                placeholderTextColor="#94a3b8"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.btnModalCancel}
                  onPress={() => setIsSkillModalVisible(false)}
                >
                  <Text style={styles.btnModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnModalSubmit}
                  onPress={handleAddSkillClaim}
                >
                  <Text style={styles.btnModalSubmitText}>Add Skill</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // 2. Unauthenticated Login Screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authBox}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>👷</Text>
        </View>
        <Text style={styles.authTitle}>Worker Portal</Text>
        <Text style={styles.authSubtitle}>Sign in to view jobs and your schedule</Text>

        {error && <Text style={styles.authError}>{error}</Text>}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="worker@cshrk.local"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => login(email, password)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Sign In to Worker App</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnDemo}
          onPress={() => login('dev_worker@cshrk.local', 'DevPass123!')}
        >
          <Text style={styles.btnDemoText}>Use Demo Worker Account</Text>
        </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 14,
  },
  homeHeader: {
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subGreetingText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  statusBtnAvailableActive: {
    backgroundColor: '#16a34a',
  },
  statusBtnBusyActive: {
    backgroundColor: '#d97706',
  },
  statusBtnOfflineActive: {
    backgroundColor: '#475569',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  statusBtnTextActive: {
    color: '#ffffff',
  },
  todayStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  newJobCard: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  newJobBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  newJobBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.5,
  },
  newJobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  newJobLocation: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },
  newJobPayout: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16a34a',
    marginTop: 6,
  },
  newJobActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btnAccept: {
    flex: 2,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnAcceptText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  btnDecline: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDeclineText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  jobTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  jobDetailText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 3,
  },
  btnViewJob: {
    marginTop: 12,
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnViewJobText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  pillActive: {
    backgroundColor: '#0f172a',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  jobHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobPayoutTag: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16a34a',
  },
  jobStatusRow: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  jobStatusBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  badgeDone: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  skillsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnAddSkill: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnAddSkillText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  skillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  skillSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  badgeWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeVerified: {
    backgroundColor: '#dcfce7',
  },
  badgePending: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextVerified: {
    color: '#15803d',
  },
  badgeTextPending: {
    color: '#b45309',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0369a1',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileRole: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 1,
  },
  profileId: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
    fontFamily: 'monospace',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailKey: {
    fontSize: 13,
    color: '#64748b',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  menuArrow: {
    fontSize: 14,
    color: '#94a3b8',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleOn: {
    backgroundColor: '#16a34a',
  },
  toggleOff: {
    backgroundColor: '#94a3b8',
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  btnSignOut: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    marginTop: 8,
  },
  btnSignOutText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
    paddingBottom: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 3,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#0284c7',
    fontWeight: '700',
  },
  toast: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    zIndex: 99,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  btnModalCancel: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  btnModalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  btnModalSubmit: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    alignItems: 'center',
  },
  btnModalSubmitText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  authBox: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 30,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  authError: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    textAlign: 'center',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 14,
  },
  btnPrimary: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  btnDemo: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDemoText: {
    color: '#0284c7',
    fontSize: 13,
    fontWeight: '600',
  },
});
