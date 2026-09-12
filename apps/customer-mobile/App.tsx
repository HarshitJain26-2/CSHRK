import React, { useState, useEffect, useCallback } from 'react';
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
  BookingStatus,
  IBookingCandidate,
  IService,
} from '@cshrk/types';

interface ServiceItem extends IService {
  skillId?: string;
  skill?: {
    id: string;
    code: string;
    name: string;
    category: string;
  };
}

interface CategoryItem {
  name: string;
  count: number;
}

interface CustomerBooking {
  id: string;
  serviceRequestId: string;
  customerId: string;
  workerId?: string;
  status: BookingStatus;
  totalAmount: number;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  serviceRequest?: {
    id: string;
    description: string;
    addressText?: string;
    urgency?: string;
    service?: ServiceItem;
  };
  worker?: {
    id: string;
    fullName: string;
    memberId?: string;
    ratingAvg?: number;
    totalJobs?: number;
    cooperative?: {
      id: string;
      name: string;
      district?: string;
    };
  };
}

function CustomerAppContent() {
  const { user, login, register, logout, isLoading: authLoading, error: authError } = useAuth();
  const [screen, setScreen] = useState<'welcome' | 'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'explore' | 'request' | 'bookings' | 'profile'>('explore');

  // Auth Form State
  const [email, setEmail] = useState('dev_customer@cshrk.local');
  const [password, setPassword] = useState('DevPass123!');
  const [fullName, setFullName] = useState('');

  // Marketplace Catalog State
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(false);

  // Booking Flow State
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'STANDARD' | 'URGENT' | 'EMERGENCY'>('STANDARD');
  const [addressText, setAddressText] = useState('A-42, Connaught Place, New Delhi 110001');
  const [latitude, setLatitude] = useState(28.6328);
  const [longitude, setLongitude] = useState(77.2167);
  const [scheduleTime, setScheduleTime] = useState(
    new Date(Date.now() + 2 * 3600000).toISOString(),
  );
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<IBookingCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<IBookingCandidate | null>(null);
  const [isCreatingRequest, setIsCreatingRequest] = useState<boolean>(false);
  const [isSearchingCandidates, setIsSearchingCandidates] = useState<boolean>(false);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState<boolean>(false);
  const [bookingSuccessNotice, setBookingSuccessNotice] = useState<string | null>(null);

  // Customer Bookings State
  const [myBookings, setMyBookings] = useState<CustomerBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);
  const [isBookingsLoading, setIsBookingsLoading] = useState<boolean>(false);
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  // Rating Modal State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [isRatingSubmitting, setIsRatingSubmitting] = useState<boolean>(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);

  // 1. Fetch Catalog & Categories
  const loadCatalog = useCallback(async () => {
    setIsCatalogLoading(true);
    try {
      const [catsRes, servsRes] = await Promise.all([
        apiClient.get('/services/categories'),
        apiClient.get('/services', {
          params: {
            category: selectedCategory === 'ALL' ? undefined : selectedCategory,
            search: searchQuery.trim() || undefined,
          },
        }),
      ]);

      if (catsRes.data) {
        setCategories(catsRes.data);
      }
      if (servsRes.data && servsRes.data.data) {
        setServices(servsRes.data.data);
      }
    } catch {
      // Retain fallback data if network glitch
    } finally {
      setIsCatalogLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // 2. Fetch Customer Bookings
  const loadMyBookings = useCallback(async () => {
    if (!user) return;
    setIsBookingsLoading(true);
    try {
      const res = await apiClient.get('/bookings/me');
      if (res.data && res.data.data) {
        setMyBookings(res.data.data);
      }
    } catch {
      // Silently handle
    } finally {
      setIsBookingsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCatalog();
      loadMyBookings();
    }
  }, [user, loadCatalog, loadMyBookings]);

  // Handle Step 1 -> 2: Select Service
  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
    setStep(2);
    setActiveTab('request');
  };

  // Handle Step 2 & 3 -> 4: Create Service Request & Discover Candidates
  const handleProceedToDiscovery = async () => {
    if (!selectedService) return;
    if (description.trim().length < 5) {
      alert('Please describe your requirements in at least 5 characters.');
      return;
    }

    setIsCreatingRequest(true);
    try {
      const reqRes = await apiClient.post('/service-requests', {
        serviceId: selectedService.id,
        description,
        latitude,
        longitude,
        addressText,
        urgency,
        scheduledTime: scheduleTime,
      });

      const newRequestId = reqRes.data.id;
      setCreatedRequestId(newRequestId);

      // Immediately discover candidates with PostGIS ST_DistanceSphere
      setIsSearchingCandidates(true);
      setStep(4);

      const candRes = await apiClient.get(`/service-requests/${newRequestId}/candidates`, {
        params: { radiusKm: 30 },
      });

      setCandidates(candRes.data || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit service request.');
    } finally {
      setIsCreatingRequest(false);
      setIsSearchingCandidates(false);
    }
  };

  // Handle Step 4 -> 5: Confirm Booking
  const handleConfirmBooking = async () => {
    if (!createdRequestId || !selectedCandidate) return;

    setIsBookingSubmitting(true);
    try {
      const res = await apiClient.post('/bookings', {
        serviceRequestId: createdRequestId,
        workerId: selectedCandidate.workerId,
        startTime: scheduleTime,
        durationHours: 2,
      });

      setBookingSuccessNotice(
        `Booking request sent to ${selectedCandidate.fullName}. Status: PENDING ACCEPTANCE.`,
      );
      setStep(5);
      loadMyBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to dispatch booking request.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // Handle Rating Submission
  const handleSubmitRating = async () => {
    if (!selectedBooking) return;
    setIsRatingSubmitting(true);
    try {
      await apiClient.post(`/bookings/${selectedBooking.id}/rate`, {
        score: ratingScore,
        comment: ratingComment,
      });

      setRatingSuccessMsg('Thank you! Your feedback has been registered.');
      setIsRatingModalOpen(false);
      loadMyBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not submit rating.');
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  // Reset Booking Form
  const handleResetRequest = () => {
    setStep(1);
    setSelectedService(null);
    setDescription('');
    setSelectedCandidate(null);
    setCandidates([]);
    setCreatedRequestId(null);
    setBookingSuccessNotice(null);
  };

  // --------------------------------------------------------------------------
  // RENDER: Unauthenticated State
  // --------------------------------------------------------------------------
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <View style={styles.authHeaderBox}>
            <Text style={styles.logoTitle}>CSHRK</Text>
            <Text style={styles.logoSubtitle}>Cooperative Labour & Service Marketplace</Text>
            <Text style={styles.logoTagline}>Certified Workers • Fair Pricing • Zero Middlemen</Text>
          </View>

          {authError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          {screen === 'login' && (
            <View style={styles.formBox}>
              <Text style={styles.formTitle}>Customer Sign In</Text>
              <Text style={styles.formSubtitle}>Access verified trade services in your area</Text>

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="dev_customer@cshrk.local"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="DevPass123!"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => login(email, password)}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In as Customer</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setScreen('register')}
                style={styles.secondaryActionBtn}
              >
                <Text style={styles.secondaryActionText}>New customer? Create account</Text>
              </TouchableOpacity>
            </View>
          )}

          {screen === 'register' && (
            <View style={styles.formBox}>
              <Text style={styles.formTitle}>Create Customer Account</Text>
              <Text style={styles.formSubtitle}>Join the cooperative marketplace</Text>

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Chandra"
                placeholderTextColor="#94a3b8"
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="email@domain.local"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password (min 8 chars, letter & number)</Text>
              <TextInput
                style={styles.input}
                placeholder="DevPass123!"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => register(fullName, email, password)}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Register Customer</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setScreen('login')}
                style={styles.secondaryActionBtn}
              >
                <Text style={styles.secondaryActionText}>Already have an account? Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Authenticated Customer Shell
  // --------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CSHRK Marketplace</Text>
          <Text style={styles.headerSubtitle}>Delhi State Labour Cooperative Federation</Text>
        </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.headerBadge}>Phase 2 Active</Text>
        </View>
      </View>

      {/* Main Workspace Body */}
      <View style={styles.body}>
        {/* ================================================================= */}
        {/* TAB 1: EXPLORE / MARKETPLACE HOME                                */}
        {/* ================================================================= */}
        {activeTab === 'explore' && (
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Active Booking Banner if any */}
            {myBookings.some((b) => b.status === BookingStatus.PENDING_ACCEPTANCE) && (
              <TouchableOpacity
                style={styles.activeBanner}
                onPress={() => setActiveTab('bookings')}
              >
                <Text style={styles.activeBannerTitle}>⏳ Booking Request in Progress</Text>
                <Text style={styles.activeBannerText}>
                  A dispatched service request is awaiting worker acceptance. Tap to track.
                </Text>
              </TouchableOpacity>
            )}

            {/* Search Bar */}
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search plumbing, electrical, carpentry..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={loadCatalog}
              />
              <TouchableOpacity style={styles.searchButton} onPress={loadCatalog}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            {/* Category Filter Chips */}
            <Text style={styles.sectionHeading}>Service Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <TouchableOpacity
                style={[styles.chip, selectedCategory === 'ALL' && styles.chipActive]}
                onPress={() => setSelectedCategory('ALL')}
              >
                <Text
                  style={[styles.chipText, selectedCategory === 'ALL' && styles.chipTextActive]}
                >
                  All Services
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.chip,
                    selectedCategory === cat.name && styles.chipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategory === cat.name && styles.chipTextActive,
                    ]}
                  >
                    {cat.name} ({cat.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Service Catalog List */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Available Certified Services</Text>
              <TouchableOpacity onPress={loadCatalog}>
                <Text style={styles.refreshLink}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {isCatalogLoading ? (
              <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 20 }} />
            ) : services.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No services found</Text>
                <Text style={styles.emptySubtitle}>Try changing your search query or category.</Text>
              </View>
            ) : (
              services.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceCardHeader}>
                    <Text style={styles.serviceTitle}>{service.name}</Text>
                    <Text style={styles.serviceCategoryTag}>{service.category}</Text>
                  </View>
                  <Text style={styles.serviceDesc}>{service.description}</Text>

                  <View style={styles.serviceMetaRow}>
                    <View>
                      <Text style={styles.rateLabel}>Estimated Base Rate</Text>
                      <Text style={styles.rateValue}>
                        ₹{service.basePrice} / {service.unit.toLowerCase()}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.bookNowButton}
                      onPress={() => handleSelectService(service)}
                    >
                      <Text style={styles.bookNowText}>Request Service</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* ================================================================= */}
        {/* TAB 2: REQUEST & BOOKING WORKFLOW (5 STEPS)                       */}
        {/* ================================================================= */}
        {activeTab === 'request' && (
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Step Stepper Header */}
            <View style={styles.stepperContainer}>
              <Text style={styles.stepperTitle}>New Service Request</Text>
              <Text style={styles.stepperSubtitle}>Step {step} of 5</Text>
            </View>

            {/* Step 1: Select Service */}
            {step === 1 && (
              <View style={styles.stepBox}>
                <Text style={styles.stepTitle}>Choose a Service from the Catalog</Text>
                {services.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.selectableServiceCard}
                    onPress={() => handleSelectService(s)}
                  >
                    <Text style={styles.serviceTitle}>{s.name}</Text>
                    <Text style={styles.serviceCategoryTag}>{s.category}</Text>
                    <Text style={styles.rateValue}>₹{s.basePrice} base rate</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Step 2: Requirements Description */}
            {step === 2 && selectedService && (
              <View style={styles.stepBox}>
                <Text style={styles.stepTitle}>Service: {selectedService.name}</Text>
                <Text style={styles.stepSubtitle}>
                  Please describe the specific issue or task you need completed.
                </Text>

                <Text style={styles.label}>Job Details & Requirements</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="e.g. Kitchen tap pipe is leaking, water shutoff required."
                  placeholderTextColor="#94a3b8"
                  value={description}
                  onChangeText={setDescription}
                />

                <Text style={styles.label}>Urgency Level</Text>
                <View style={styles.urgencyRow}>
                  {(['STANDARD', 'URGENT', 'EMERGENCY'] as const).map((lvl) => (
                    <TouchableOpacity
                      key={lvl}
                      style={[
                        styles.urgencyBtn,
                        urgency === lvl && styles.urgencyBtnActive,
                      ]}
                      onPress={() => setUrgency(lvl)}
                    >
                      <Text
                        style={[
                          styles.urgencyText,
                          urgency === lvl && styles.urgencyTextActive,
                        ]}
                      >
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setStep(3)}
                >
                  <Text style={styles.buttonText}>Continue to Location & Schedule</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 3: Location & Schedule */}
            {step === 3 && selectedService && (
              <View style={styles.stepBox}>
                <Text style={styles.stepTitle}>Service Location & Schedule</Text>

                <Text style={styles.label}>Address / Landmark</Text>
                <TextInput
                  style={styles.input}
                  value={addressText}
                  onChangeText={setAddressText}
                  placeholder="Street address in Delhi"
                  placeholderTextColor="#94a3b8"
                />

                <Text style={styles.label}>Coordinates (Delhi GPS Test Pin)</Text>
                <View style={styles.coordsRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.subLabel}>Latitude</Text>
                    <TextInput
                      style={styles.input}
                      value={String(latitude)}
                      onChangeText={(v) => setLatitude(parseFloat(v) || 28.6328)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subLabel}>Longitude</Text>
                    <TextInput
                      style={styles.input}
                      value={String(longitude)}
                      onChangeText={(v) => setLongitude(parseFloat(v) || 77.2167)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleProceedToDiscovery}
                  disabled={isCreatingRequest}
                >
                  {isCreatingRequest ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Find Matching Workers (PostGIS)</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => setStep(2)}>
                  <Text style={styles.secondaryActionText}>Back</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 4: Worker Candidate Discovery (PostGIS Results) */}
            {step === 4 && (
              <View style={styles.stepBox}>
                <Text style={styles.stepTitle}>Matching Certified Workers</Text>
                <Text style={styles.stepSubtitle}>
                  Identified via PostGIS ST_DistanceSphere within 30 km radius.
                </Text>

                {isSearchingCandidates ? (
                  <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 20 }} />
                ) : candidates.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No workers currently available nearby</Text>
                    <Text style={styles.emptySubtitle}>
                      All certified workers for this trade are currently occupied or outside the 30km radius.
                    </Text>
                  </View>
                ) : (
                  candidates.map((worker) => (
                    <TouchableOpacity
                      key={worker.workerId}
                      style={[
                        styles.candidateCard,
                        selectedCandidate?.workerId === worker.workerId &&
                          styles.candidateCardActive,
                      ]}
                      onPress={() => setSelectedCandidate(worker)}
                    >
                      <View style={styles.candidateTopRow}>
                        <Text style={styles.candidateName}>{worker.fullName}</Text>
                        <Text style={styles.candidateDistance}>{worker.distanceKm} km away</Text>
                      </View>
                      <Text style={styles.candidateCoop}>{worker.cooperativeName}</Text>
                      <View style={styles.candidateMetaRow}>
                        <Text style={styles.candidateRating}>⭐ {worker.ratingAvg} ({worker.totalJobs} jobs)</Text>
                        <Text style={styles.candidateSkillBadge}>{worker.verifiedSkillName}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}

                {selectedCandidate && (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleConfirmBooking}
                    disabled={isBookingSubmitting}
                  >
                    {isBookingSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>
                        Send Booking Request to {selectedCandidate.fullName}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => setStep(3)}>
                  <Text style={styles.secondaryActionText}>Change Location / Schedule</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 5: Booking Request Sent (PENDING_ACCEPTANCE) */}
            {step === 5 && (
              <View style={styles.successCard}>
                <Text style={styles.successBadge}>✓ REQUEST DISPATCHED</Text>
                <Text style={styles.successHeading}>Booking Request Sent!</Text>
                <Text style={styles.successBody}>
                  {bookingSuccessNotice ||
                    'Your service request has been dispatched to the candidate worker. Status is PENDING ACCEPTANCE until the worker confirms.'}
                </Text>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    handleResetRequest();
                    setActiveTab('bookings');
                  }}
                >
                  <Text style={styles.buttonText}>View My Bookings</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* ================================================================= */}
        {/* TAB 3: BOOKING HISTORY & TRACKING                                 */}
        {/* ================================================================= */}
        {activeTab === 'bookings' && (
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>My Bookings</Text>
              <TouchableOpacity onPress={loadMyBookings}>
                <Text style={styles.refreshLink}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterTab, bookingFilter === f && styles.filterTabActive]}
                  onPress={() => setBookingFilter(f)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      bookingFilter === f && styles.filterTabTextActive,
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {ratingSuccessMsg && (
              <View style={styles.toastNotice}>
                <Text style={styles.toastNoticeText}>{ratingSuccessMsg}</Text>
              </View>
            )}

            {isBookingsLoading ? (
              <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 20 }} />
            ) : myBookings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No bookings found</Text>
                <Text style={styles.emptySubtitle}>
                  You have not created any service bookings yet.
                </Text>
              </View>
            ) : (
              myBookings
                .filter((b) => {
                  if (bookingFilter === 'ACTIVE') {
                    return (
                      b.status === BookingStatus.PENDING_ACCEPTANCE ||
                      b.status === BookingStatus.CONFIRMED ||
                      b.status === BookingStatus.SCHEDULED ||
                      b.status === BookingStatus.IN_PROGRESS
                    );
                  }
                  if (bookingFilter === 'COMPLETED') {
                    return b.status === BookingStatus.COMPLETED;
                  }
                  return true;
                })
                .map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={styles.bookingCard}
                    onPress={() => setSelectedBooking(b)}
                  >
                    <View style={styles.bookingTopRow}>
                      <Text style={styles.bookingServiceTitle}>
                        {b.serviceRequest?.service?.name || 'On-Demand Service'}
                      </Text>
                      <Text
                        style={[
                          styles.statusPill,
                          b.status === BookingStatus.PENDING_ACCEPTANCE && styles.statusPending,
                          b.status === BookingStatus.CONFIRMED && styles.statusConfirmed,
                          b.status === BookingStatus.IN_PROGRESS && styles.statusInProgress,
                          b.status === BookingStatus.COMPLETED && styles.statusCompleted,
                          b.status === BookingStatus.REJECTED && styles.statusRejected,
                        ]}
                      >
                        {b.status.replace('_', ' ')}
                      </Text>
                    </View>

                    <Text style={styles.bookingWorkerInfo}>
                      Worker: {b.worker?.fullName || 'Assigned Worker'} (
                      {b.worker?.cooperative?.name || 'Cooperative Society'})
                    </Text>
                    <Text style={styles.bookingAddress}>
                      📍 {b.serviceRequest?.addressText || 'Delhi Service Location'}
                    </Text>
                    <Text style={styles.bookingCost}>
                      Estimated Service Cost: ₹{b.totalAmount}
                    </Text>

                    {b.status === BookingStatus.REJECTED && (
                      <View style={styles.declinedNoticeBox}>
                        <Text style={styles.declinedNoticeText}>
                          Worker declined this assignment. You can select another available worker.
                        </Text>
                      </View>
                    )}

                    {b.status === BookingStatus.COMPLETED && (
                      <TouchableOpacity
                        style={styles.rateCtaBtn}
                        onPress={() => {
                          setSelectedBooking(b);
                          setIsRatingModalOpen(true);
                        }}
                      >
                        <Text style={styles.rateCtaText}>★ Rate Worker</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PROFILE & SETTINGS                                         */}
        {/* ================================================================= */}
        {activeTab === 'profile' && (
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>{user.fullName || 'Valued Customer'}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <Text style={styles.profileRole}>Role: {user.role}</Text>

              <View style={styles.divider} />

              <Text style={styles.profileSectionTitle}>Marketplace Affiliation</Text>
              <Text style={styles.profileText}>
                Supported by Delhi State Labour Cooperative Federation. All transactions are
                governed by primary worker cooperative societies.
              </Text>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutButtonText}>Sign Out of Customer Portal</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {/* ================================================================= */}
      {/* RATING MODAL (Customer -> Worker)                                 */}
      {/* ================================================================= */}
      <Modal visible={isRatingModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Worker Service</Text>
            <Text style={styles.modalSubtitle}>
              Worker: {selectedBooking?.worker?.fullName || 'Assigned Worker'}
            </Text>

            <Text style={styles.label}>Select Rating (1 to 5 Stars)</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRatingScore(star)}
                  style={styles.starBtn}
                >
                  <Text style={[styles.starText, star <= ratingScore && styles.starActive]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Feedback / Comment</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
              placeholder="How was the service provided?"
              placeholderTextColor="#94a3b8"
              value={ratingComment}
              onChangeText={setRatingComment}
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsRatingModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSubmitRating}
                disabled={isRatingSubmitting}
              >
                {isRatingSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit Rating</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'explore' && styles.navItemActive]}
          onPress={() => setActiveTab('explore')}
        >
          <Text style={[styles.navText, activeTab === 'explore' && styles.navTextActive]}>
            Explore
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'request' && styles.navItemActive]}
          onPress={() => setActiveTab('request')}
        >
          <Text style={[styles.navText, activeTab === 'request' && styles.navTextActive]}>
            New Request
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'bookings' && styles.navItemActive]}
          onPress={() => {
            setActiveTab('bookings');
            loadMyBookings();
          }}
        >
          <Text style={[styles.navText, activeTab === 'bookings' && styles.navTextActive]}>
            Bookings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'profile' && styles.navItemActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CustomerAppContent />
    </AuthProvider>
  );
}

// ----------------------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  badgeContainer: {
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369a1',
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  activeBanner: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  activeBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
  },
  activeBannerText: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  searchButton: {
    backgroundColor: '#0284c7',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshLink: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
  },
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  serviceCategoryTag: {
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  serviceDesc: {
    fontSize: 12,
    color: '#64748b',
    marginVertical: 6,
    lineHeight: 16,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 8,
  },
  rateLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  rateValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284c7',
  },
  bookNowButton: {
    backgroundColor: '#0284c7',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bookNowText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  stepperContainer: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  stepperTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  stepperSubtitle: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 2,
  },
  stepBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
  },
  selectableServiceCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
    marginTop: 10,
  },
  subLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  urgencyBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  urgencyBtnActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  urgencyTextActive: {
    color: '#0284c7',
  },
  coordsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  candidateCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  candidateCardActive: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff',
  },
  candidateTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  candidateDistance: {
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '600',
  },
  candidateCoop: {
    fontSize: 11,
    color: '#64748b',
    marginVertical: 2,
  },
  candidateMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  candidateRating: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '700',
  },
  candidateSkillBadge: {
    fontSize: 10,
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  successBadge: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  successHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  successBody: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTabActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 10,
  },
  bookingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingServiceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  statusPill: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusConfirmed: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  statusInProgress: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  statusRejected: {
    backgroundColor: '#ffe4e6',
    color: '#9f1239',
  },
  bookingWorkerInfo: {
    fontSize: 12,
    color: '#334155',
    marginTop: 4,
  },
  bookingAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  bookingCost: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
    marginTop: 6,
  },
  declinedNoticeBox: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  declinedNoticeText: {
    fontSize: 11,
    color: '#be123c',
    fontWeight: '600',
  },
  rateCtaBtn: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  rateCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  profileRole: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  profileSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 10,
    justifyContent: 'center',
  },
  starBtn: {
    padding: 4,
  },
  starText: {
    fontSize: 32,
    color: '#cbd5e1',
  },
  starActive: {
    color: '#f59e0b',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  toastNotice: {
    backgroundColor: '#dcfce7',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  toastNoticeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#0284c7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#0284c7',
    fontSize: 12,
    fontWeight: '600',
  },
  authContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  authHeaderBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0284c7',
    letterSpacing: 1,
  },
  logoSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
  },
  logoTagline: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  formBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#0284c7',
  },
  navText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  navTextActive: {
    color: '#0284c7',
  },
});
