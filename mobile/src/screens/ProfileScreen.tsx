import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProfileScreenProps {
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const { user, role, demoLogin, logout } = useAuth();

  const handleRoleSwitch = async (newRole: Role) => {
    await demoLogin(newRole);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Vinay Kumar'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>Active Role: {role}</Text>
        </View>
      </View>

      {/* Clinical Demographics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Clinical Demographics</Text>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Blood Group</Text>
            <Text style={styles.value}>{user?.bloodGroup || 'O+'}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Known Allergies</Text>
            <Text style={styles.value}>{user?.allergies || 'None'}</Text>
          </View>
        </View>
        <View style={[styles.row, { marginTop: 12 }]}>
          <View style={styles.col}>
            <Text style={styles.label}>Registered Phone</Text>
            <Text style={styles.value}>{user?.phone || '9876543210'}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Location City</Text>
            <Text style={styles.value}>{user?.city || 'Chennai'}</Text>
          </View>
        </View>
      </View>

      {/* Quick Role Switcher (Presentation Demo) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Demo Role Switcher</Text>
        <Text style={styles.cardSub}>Switch your active login view instantly for testing and grading.</Text>
        <View style={styles.rolesGrid}>
          {(['PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'] as const).map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.roleSwitchBtn, role === r && styles.roleSwitchBtnActive]}
              onPress={() => handleRoleSwitch(r)}
            >
              <Text style={[styles.roleSwitchText, role === r && styles.roleSwitchTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Emergency Hotline Contact */}
      <View style={styles.emergencyCard}>
        <Text style={styles.emergencyTitle}>🚨 Emergency Medical Hotlines</Text>
        <View style={styles.emergencyRow}>
          <View style={styles.emergencyCol}>
            <Text style={styles.emergencyLabel}>Ambulance</Text>
            <Text style={styles.emergencyNum}>108</Text>
          </View>
          <View style={styles.emergencyCol}>
            <Text style={styles.emergencyLabel}>National Emergency</Text>
            <Text style={styles.emergencyNum}>112</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out from MediBook AI</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  roleBadgeText: {
    color: '#0369a1',
    fontSize: 10,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  value: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleSwitchBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  roleSwitchBtnActive: {
    backgroundColor: '#0284c7',
  },
  roleSwitchText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  roleSwitchTextActive: {
    color: '#ffffff',
  },
  emergencyCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b91c1c',
    marginBottom: 8,
  },
  emergencyRow: {
    flexDirection: 'row',
  },
  emergencyCol: {
    flex: 1,
  },
  emergencyLabel: {
    fontSize: 10,
    color: '#991b1b',
    fontWeight: '600',
  },
  emergencyNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#b91c1c',
  },
  logoutBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '800',
  },
});

export default ProfileScreen;
