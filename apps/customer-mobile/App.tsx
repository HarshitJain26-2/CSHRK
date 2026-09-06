import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';

function CustomerAppContent() {
  const { user, login, register, logout, isLoading, error } = useAuth();
  const [screen, setScreen] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');

  // Form states
  const [email, setEmail] = useState('dev_customer@cshrk.local');
  const [password, setPassword] = useState('DevPass123!');
  const [fullName, setFullName] = useState('');

  // 1. Authenticated Customer Shell
  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CSHRK Customer</Text>
          <Text style={styles.headerBadge}>Phase 0 Shell</Text>
        </View>

        <View style={styles.body}>
          {activeTab === 'home' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Welcome back, {user.email}!</Text>
              <Text style={styles.cardSubtitle}>Role: {user.role}</Text>
              <View style={styles.noticeBox}>
                <Text style={styles.noticeTitle}>Phase 0 Foundation Active</Text>
                <Text style={styles.noticeText}>
                  Marketplace service discovery, worker search, and booking workflows are
                  scheduled for development in Phase 2.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Customer Profile</Text>
              <Text style={styles.detailText}>ID: {user.id}</Text>
              <Text style={styles.detailText}>Email: {user.email}</Text>
              <Text style={styles.detailText}>Status: {user.status}</Text>
              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.buttonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.navBar}>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
            onPress={() => setActiveTab('home')}
          >
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'profile' && styles.navItemActive]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={styles.navText}>Profile</Text>
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
        <Text style={styles.logoSubtitle}>Cooperative Customer Portal</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {screen === 'welcome' && (
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeText}>
              Welcome to CSHRK. Access certified cooperative services from verified workers.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setScreen('login')}
            >
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setScreen('register')}
            >
              <Text style={styles.secondaryButtonText}>Create Customer Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {screen === 'login' && (
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>Customer Login</Text>
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
            <TouchableOpacity onPress={() => setScreen('welcome')} style={styles.linkButton}>
              <Text style={styles.linkText}>Back to Welcome</Text>
            </TouchableOpacity>
          </View>
        )}

        {screen === 'register' && (
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>Customer Registration</Text>
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
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreen('welcome')} style={styles.linkButton}>
              <Text style={styles.linkText}>Back to Welcome</Text>
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
      <CustomerAppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    padding: 16,
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  headerBadge: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  body: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  cardSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  detailText: { fontSize: 14, color: '#334155', marginBottom: 8 },
  noticeBox: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  noticeTitle: { color: '#1E40AF', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  noticeText: { color: '#1E3A8A', fontSize: 13, lineHeight: 18 },
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  navItem: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  navItemActive: { borderTopWidth: 2, borderTopColor: '#1E3A8A' },
  navText: { fontSize: 14, color: '#334155', fontWeight: '600' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  logoTitle: { fontSize: 32, fontWeight: 'bold', color: '#1E3A8A', textAlign: 'center' },
  logoSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 28 },
  welcomeBox: { marginTop: 12 },
  welcomeText: { fontSize: 15, color: '#334155', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  primaryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  secondaryButtonText: { color: '#1E293B', fontWeight: 'bold', fontSize: 16 },
  formBox: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, elevation: 2 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  input: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  linkButton: { alignItems: 'center', marginTop: 12 },
  linkText: { color: '#2563EB', fontSize: 14 },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: { color: '#991B1B', fontSize: 13 },
});
