import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface LoginScreenProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess, onNavigateRegister }) => {
  const { login, demoLogin, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'receptionist' | 'admin'>('patient');
  const [email, setEmail] = useState('vinay@gmail.com');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState('');

  const handleRoleSelect = (role: 'patient' | 'doctor' | 'receptionist' | 'admin') => {
    setSelectedRole(role);
    setError('');
    if (role === 'patient') {
      setEmail('vinay@gmail.com');
    } else if (role === 'doctor') {
      setEmail('amit.verma@saveethamedicalcollege.com');
    } else if (role === 'receptionist') {
      setEmail('reception@saveethahospital.com');
    } else if (role === 'admin') {
      setEmail('admin@gmail.com');
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please provide email and password.');
      return;
    }
    setError('');
    try {
      await login(email.trim(), selectedRole, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  const handleQuickDemo = async (role: Role) => {
    setError('');
    try {
      await demoLogin(role);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <View style={styles.headerArea}>
          <Text style={styles.icon}>🩺</Text>
          <Text style={styles.brandTitle}>MediBook AI</Text>
          <Text style={styles.tagline}>Book Smarter. Consult Better. Stay Healthier.</Text>
        </View>

        {/* 4-Role Switcher Tabs */}
        <View style={styles.roleTabs}>
          {(['patient', 'doctor', 'receptionist', 'admin'] as const).map(role => (
            <TouchableOpacity
              key={role}
              onPress={() => handleRoleSelect(role)}
              style={[
                styles.roleTab,
                selectedRole === role && styles.roleTabActive
              ]}
            >
              <Text style={[
                styles.roleTabText,
                selectedRole === role && styles.roleTabTextActive
              ]}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Presentation Demo Quick-Logins */}
        <View style={styles.quickLoginBox}>
          <Text style={styles.quickLoginLabel}>⚡ 1-Click Presentation Access:</Text>
          <View style={styles.quickButtonsRow}>
            <TouchableOpacity onPress={() => handleQuickDemo('PATIENT')} style={styles.demoBtn}>
              <Text style={styles.demoBtnText}>Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleQuickDemo('DOCTOR')} style={styles.demoBtn}>
              <Text style={styles.demoBtnText}>Doctor</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleQuickDemo('RECEPTIONIST')} style={styles.demoBtn}>
              <Text style={styles.demoBtnText}>Reception</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleQuickDemo('ADMIN')} style={styles.demoBtn}>
              <Text style={styles.demoBtnText}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="name@domain.com"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Account Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Sign In as {selectedRole.toUpperCase()}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to MediBook AI? </Text>
          <TouchableOpacity onPress={onNavigateRegister}>
            <Text style={styles.footerLink}>Register Patient Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 48,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: '#0284c7',
  },
  roleTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  roleTabTextActive: {
    color: '#ffffff',
  },
  quickLoginBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
  },
  quickLoginLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 6,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  demoBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 11,
    color: '#b91c1c',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  submitBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
  footerLink: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '800',
  },
});

export default LoginScreen;
