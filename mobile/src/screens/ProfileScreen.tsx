import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProfileScreenProps {
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const { user, role, demoLogin, logout } = useAuth();
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalDocType, setLegalDocType] = useState<'privacy' | 'terms'>('privacy');

  const handleRoleSwitch = async (newRole: Role) => {
    await demoLogin(newRole);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const openLegalDoc = (type: 'privacy' | 'terms') => {
    setLegalDocType(type);
    setLegalModalVisible(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Vinay Kumar'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'vinay@gmail.com'}</Text>
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
        <Text style={styles.cardTitle}>Verified Clinical Roles</Text>
        <Text style={styles.cardSub}>Switch your authenticated role for testing and presentation.</Text>
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

      {/* Legal & Compliance Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Legal & Compliance</Text>
        <Text style={styles.cardSub}>Review healthcare data policies, medical disclaimers, and user terms.</Text>
        <View style={styles.legalBtnRow}>
          <TouchableOpacity
            style={styles.legalBtn}
            onPress={() => openLegalDoc('privacy')}
          >
            <Text style={styles.legalBtnText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.legalBtn}
            onPress={() => openLegalDoc('terms')}
          >
            <Text style={styles.legalBtnText}>Terms & Conditions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Hotline Contact */}
      <View style={styles.emergencyCard}>
        <Text style={styles.emergencyTitle}>Emergency Medical Hotlines</Text>
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
        <Text style={styles.logoutText}>Sign Out from MediFlow AI</Text>
      </TouchableOpacity>

      {/* Legal Document Modal */}
      <Modal
        visible={legalModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setLegalModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {legalDocType === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions'}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setLegalModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {legalDocType === 'privacy' ? (
              <View style={styles.legalDocBody}>
                <Text style={styles.docHeading}>1. Information We Collect</Text>
                <Text style={styles.docText}>
                  MediFlow AI collects patient names, verified credentials, clinical appointment choices, and uploaded diagnostic records strictly to facilitate clinical scheduling and telehealth sessions.
                </Text>

                <Text style={styles.docHeading}>2. HIPAA & GDPR Alignment</Text>
                <Text style={styles.docText}>
                  All communication is encrypted via TLS 1.3 and database storage uses AES-256 encryption. Role-based access controls strictly limit medical charts: patients access only their own charts and doctors access only patients assigned to their schedules.
                </Text>

                <Text style={styles.docHeading}>3. Patient Data Ownership</Text>
                <Text style={styles.docText}>
                  You own your medical data. You have the right to inspect, download, and delete discretionary uploaded medical documents at any time.
                </Text>

                <Text style={styles.docHeading}>4. Medical Disclaimer</Text>
                <Text style={styles.docText}>
                  MediFlow AI is an administrative and scheduling coordination platform. AI assistant guidance is informational and does not constitute formal medical diagnosis or emergency intervention.
                </Text>
              </View>
            ) : (
              <View style={styles.legalDocBody}>
                <Text style={styles.docHeading}>1. Emergency Medical Care</Text>
                <Text style={styles.docText}>
                  Do not use MediFlow AI for acute emergencies. In life-threatening emergencies (e.g., severe chest pain, stroke symptoms, acute shortness of breath), call 108 or 112 immediately.
                </Text>

                <Text style={styles.docHeading}>2. Telehealth Consent</Text>
                <Text style={styles.docText}>
                  By participating in virtual teleconsultations, you acknowledge that remote exams have clinical limitations. Consulting physicians reserve full clinical discretion to require in-person visits.
                </Text>

                <Text style={styles.docHeading}>3. Booking & Cancellation Rules</Text>
                <Text style={styles.docText}>
                  Time slots are reserved in real time. Cancellations and rescheduling must be performed at least 2 hours in advance of the scheduled appointment time.
                </Text>

                <Text style={styles.docHeading}>4. User Responsibilities</Text>
                <Text style={styles.docText}>
                  Users agree to provide accurate medical information and maintain login credential confidentiality.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#15324F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#087F8C',
    fontSize: 26,
    fontWeight: '800',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15324F',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#f0fdf9',
    borderWidth: 1,
    borderColor: '#99f6e0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  roleBadgeText: {
    color: '#087F8C',
    fontSize: 10,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15324F',
    marginBottom: 4,
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
    color: '#15324F',
    marginTop: 2,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleSwitchBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  roleSwitchBtnActive: {
    backgroundColor: '#15324F',
  },
  roleSwitchText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  roleSwitchTextActive: {
    color: '#087F8C',
  },
  legalBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  legalBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  legalBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15324F',
  },
  emergencyCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
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
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '800',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 48,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15324F',
  },
  modalCloseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  modalContent: {
    padding: 20,
  },
  legalDocBody: {
    paddingBottom: 40,
  },
  docHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15324F',
    marginTop: 14,
    marginBottom: 4,
  },
  docText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
});

export default ProfileScreen;
