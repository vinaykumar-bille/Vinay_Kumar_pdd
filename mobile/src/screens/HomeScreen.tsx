import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import mobileApi from '../services/api';
import { Doctor, Appointment } from '../types';

interface HomeScreenProps {
  onNavigateSearch: (department?: string) => void;
  onNavigateBooking: (doctor: Doctor) => void;
  onNavigateAppointments: () => void;
  onNavigatePrescriptions: () => void;
  onNavigateAI: () => void;
}

const DEPARTMENTS = [
  { id: 'Cardiology', name: 'Cardiology', icon: '❤️', color: '#ef4444', desc: 'Heart & Vascular' },
  { id: 'Orthopedics', name: 'Orthopedics', icon: '🦴', color: '#f59e0b', desc: 'Joints & Bones' },
  { id: 'Neurology', name: 'Neurology', icon: '🧠', color: '#8b5cf6', desc: 'Brain & Nerves' },
  { id: 'Dermatology', name: 'Dermatology', icon: '✨', color: '#ec4899', desc: 'Skin & Aesthetics' },
  { id: 'ENT', name: 'ENT', icon: '👂', color: '#06b6d4', desc: 'Ear, Nose & Throat' },
  { id: 'Pediatrics', name: 'Pediatrics', icon: '👶', color: '#10b981', desc: 'Child Healthcare' },
  { id: 'General Medicine', name: 'General Medicine', icon: '🩺', color: '#3b82f6', desc: 'Primary & Internal' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateSearch,
  onNavigateBooking,
  onNavigateAppointments,
  onNavigatePrescriptions,
  onNavigateAI,
}) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = async () => {
    try {
      const [allDocs, allAppts] = await Promise.all([
        mobileApi.doctors.getAll(),
        mobileApi.appointments.getAll(user?.id),
      ]);
      setDoctors(allDocs.slice(0, 5));

      // Find first active or upcoming appointment
      const active = allAppts.find(
        (a) => a.status === 'Approved' || a.status === 'CONFIRMED' || a.status === 'PENDING'
      );
      setUpcomingAppointment(active || null);
    } catch (e) {
      console.error('Error loading home data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284c7']} />}
    >
      {/* Personalized Welcome Header */}
      <View style={styles.greetingBar}>
        <View>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.userNameText}>{user?.name || 'Vinay Kumar'}</Text>
        </View>
        <TouchableOpacity style={styles.avatarButton} onPress={onNavigateAppointments}>
          <Text style={styles.avatarButtonText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'V'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI Symptom Triage Banner */}
      <View style={styles.aiBanner}>
        <View style={styles.aiBannerTop}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>🤖 CLINICAL AI TRIAGE</Text>
          </View>
          <Text style={styles.aiBannerPulse}>● 24/7 Live</Text>
        </View>
        <Text style={styles.aiBannerTitle}>Not sure which doctor to see?</Text>
        <Text style={styles.aiBannerSubtitle}>
          Describe your symptoms to our medical NLP assistant and receive instant department suggestions.
        </Text>
        <TouchableOpacity style={styles.aiBannerButton} onPress={onNavigateAI}>
          <Text style={styles.aiBannerButtonText}>Launch AI Symptom Checker →</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Matrix */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Services</Text>
      </View>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}
          onPress={() => onNavigateSearch('All')}
        >
          <Text style={styles.actionIcon}>🩺</Text>
          <Text style={styles.actionTitle}>Find Doctor</Text>
          <Text style={styles.actionSubtitle}>Book specialists</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}
          onPress={onNavigateAppointments}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <Text style={styles.actionTitle}>Bookings</Text>
          <Text style={styles.actionSubtitle}>Manage visits</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}
          onPress={onNavigatePrescriptions}
        >
          <Text style={styles.actionIcon}>💊</Text>
          <Text style={styles.actionTitle}>Prescriptions</Text>
          <Text style={styles.actionSubtitle}>Digital medicines</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }]}
          onPress={onNavigateAI}
        >
          <Text style={styles.actionIcon}>⚡</Text>
          <Text style={styles.actionTitle}>AI Triage</Text>
          <Text style={styles.actionSubtitle}>Symptom analysis</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Appointment Card (if any) */}
      {upcomingAppointment && (
        <View style={styles.upcomingContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
            <TouchableOpacity onPress={onNavigateAppointments}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.appointmentCard}>
            <View style={styles.apptTopRow}>
              <View>
                <Text style={styles.apptDoctorName}>{upcomingAppointment.doctorName}</Text>
                <Text style={styles.apptDept}>{upcomingAppointment.department}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{upcomingAppointment.status}</Text>
              </View>
            </View>

            <View style={styles.apptMetaRow}>
              <View style={styles.apptMetaItem}>
                <Text style={styles.apptMetaIcon}>📅</Text>
                <Text style={styles.apptMetaText}>{upcomingAppointment.date}</Text>
              </View>
              <View style={styles.apptMetaItem}>
                <Text style={styles.apptMetaIcon}>⏰</Text>
                <Text style={styles.apptMetaText}>{upcomingAppointment.timeSlot}</Text>
              </View>
              <View style={styles.apptMetaItem}>
                <Text style={styles.apptMetaIcon}>
                  {upcomingAppointment.consultationType === 'VIDEO' ? '📹' : '🏥'}
                </Text>
                <Text style={styles.apptMetaText}>
                  {upcomingAppointment.consultationType === 'VIDEO' ? 'Video' : 'In-Person'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.apptActionBtn} onPress={onNavigateAppointments}>
              <Text style={styles.apptActionBtnText}>Manage Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Clinical Departments Carousel / Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Medical Specialties</Text>
        <TouchableOpacity onPress={() => onNavigateSearch('All')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptScrollView}>
        {DEPARTMENTS.map((dept) => (
          <TouchableOpacity
            key={dept.id}
            style={styles.deptCard}
            onPress={() => onNavigateSearch(dept.id)}
          >
            <View style={[styles.deptIconCircle, { backgroundColor: dept.color + '15' }]}>
              <Text style={styles.deptIcon}>{dept.icon}</Text>
            </View>
            <Text style={styles.deptName}>{dept.name}</Text>
            <Text style={styles.deptDesc}>{dept.desc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Top Doctors Showcase */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Doctors</Text>
        <TouchableOpacity onPress={() => onNavigateSearch('All')}>
          <Text style={styles.viewAllText}>All Doctors ({doctors.length})</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#0284c7" size="large" style={{ marginVertical: 20 }} />
      ) : (
        doctors.map((doc) => (
          <View key={doc.id} style={styles.doctorCard}>
            <Image source={{ uri: doc.imageUrl }} style={styles.doctorImage} />
            <View style={styles.doctorInfo}>
              <View style={styles.docHeaderRow}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docRating}>⭐ {doc.rating}</Text>
              </View>
              <Text style={styles.docSpecialty}>{doc.specialization}</Text>
              <Text style={styles.docDept}>{doc.department} • {doc.experience} yrs exp</Text>
              <View style={styles.docBottomRow}>
                <Text style={styles.docFee}>₹{doc.fees} <Text style={styles.feeSub}>consultation</Text></Text>
                <TouchableOpacity
                  style={styles.bookDocButton}
                  onPress={() => onNavigateBooking(doc)}
                >
                  <Text style={styles.bookDocButtonText}>Book Slot</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}

      {/* Emergency Hotline Alert Footer */}
      <View style={styles.emergencyBox}>
        <View style={styles.emergencyIconArea}>
          <Text style={styles.emergencyIcon}>🚨</Text>
        </View>
        <View style={styles.emergencyTextWrap}>
          <Text style={styles.emergencyTitle}>24/7 Hospital Emergency</Text>
          <Text style={styles.emergencyDesc}>
            For acute chest pain or trauma, dial Saveetha Emergency Ambulance: <Text style={styles.emergencyBold}>108 / 112</Text>
          </Text>
        </View>
      </View>
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
  greetingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  greetingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  userNameText: {
    fontSize: 20,
    color: '#0f172a',
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  aiBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  aiBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiBadge: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  aiBannerPulse: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
  },
  aiBannerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  aiBannerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  aiBannerButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  aiBannerButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  actionCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  upcomingContainer: {
    marginBottom: 18,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  apptTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  apptDoctorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  apptDept: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 1,
  },
  statusPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillText: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '800',
  },
  apptMetaRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  apptMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  apptMetaIcon: {
    fontSize: 12,
  },
  apptMetaText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  apptActionBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  apptActionBtnText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  deptScrollView: {
    marginBottom: 20,
    marginHorizontal: -4,
  },
  deptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    width: 120,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  deptIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deptIcon: {
    fontSize: 22,
  },
  deptName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 2,
  },
  deptDesc: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  docHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  docRating: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f59e0b',
  },
  docSpecialty: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
  },
  docDept: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 6,
  },
  docBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docFee: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  feeSub: {
    fontSize: 9,
    fontWeight: '400',
    color: '#64748b',
  },
  bookDocButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  bookDocButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  emergencyBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  emergencyIconArea: {
    marginRight: 12,
  },
  emergencyIcon: {
    fontSize: 24,
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991b1b',
    marginBottom: 2,
  },
  emergencyDesc: {
    fontSize: 10,
    color: '#b91c1c',
    lineHeight: 14,
  },
  emergencyBold: {
    fontWeight: '800',
    color: '#7f1d1d',
  },
});
