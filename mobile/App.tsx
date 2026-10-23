import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, Modal } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Header } from './src/components/Header';
import { HomeScreen } from './src/screens/HomeScreen';
import { DoctorSearchScreen } from './src/screens/DoctorSearchScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { AppointmentsListScreen } from './src/screens/AppointmentsListScreen';
import { PrescriptionsScreen } from './src/screens/PrescriptionsScreen';
import { AIAssistantScreen } from './src/screens/AIAssistantScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { Doctor, Appointment } from './src/types';

type Tab = 'home' | 'doctors' | 'appointments' | 'prescriptions' | 'ai' | 'profile';

const MainNavigator: React.FC = () => {
  const { user } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [activeVideoAppt, setActiveVideoAppt] = useState<Appointment | null>(null);
  const [searchInitialDept, setSearchInitialDept] = useState<string>('All');

  if (!user) {
    if (authView === 'register') {
      return (
        <RegisterScreen
          onSuccess={() => setActiveTab('home')}
          onNavigateLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginScreen
        onSuccess={() => setActiveTab('home')}
        onNavigateRegister={() => setAuthView('register')}
      />
    );
  }

  const handleNavigateSearchWithDept = (dept?: string) => {
    setSearchInitialDept(dept || 'All');
    setActiveTab('doctors');
  };

  const handleSelectDoctorForBooking = (doc: Doctor) => {
    setBookingDoctor(doc);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0284c7" />

      {/* Branded Header */}
      <Header
        title="MediBook AI"
        subtitle="Book Smarter. Consult Better. Stay Healthier."
        onNotificationPress={() => setActiveTab('appointments')}
      />

      {/* Main Screen Canvas */}
      <View style={styles.screenArea}>
        {bookingDoctor ? (
          <BookingScreen
            doctor={bookingDoctor}
            onSuccess={() => {
              setBookingDoctor(null);
              setActiveTab('appointments');
            }}
            onCancel={() => setBookingDoctor(null)}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                onNavigateSearch={handleNavigateSearchWithDept}
                onNavigateBooking={handleSelectDoctorForBooking}
                onNavigateAppointments={() => setActiveTab('appointments')}
                onNavigatePrescriptions={() => setActiveTab('prescriptions')}
                onNavigateAI={() => setActiveTab('ai')}
              />
            )}
            {activeTab === 'doctors' && (
              <DoctorSearchScreen
                initialDepartment={searchInitialDept}
                onSelectDoctor={handleSelectDoctorForBooking}
              />
            )}
            {activeTab === 'appointments' && (
              <AppointmentsListScreen
                onJoinVideo={(appt) => setActiveVideoAppt(appt)}
              />
            )}
            {activeTab === 'prescriptions' && <PrescriptionsScreen />}
            {activeTab === 'ai' && (
              <AIAssistantScreen
                onSelectDepartment={(dept) => {
                  setSearchInitialDept(dept);
                  setActiveTab('doctors');
                }}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileScreen onLogout={() => setAuthView('login')} />
            )}
          </>
        )}
      </View>

      {/* Telehealth Video Room Modal */}
      <Modal visible={!!activeVideoAppt} transparent animationType="slide">
        <View style={styles.videoModalBackdrop}>
          <View style={styles.videoModalCard}>
            <View style={styles.videoTopHeader}>
              <View>
                <Text style={styles.videoLiveBadge}>● ENCRYPTED WEBRTC ROOM</Text>
                <Text style={styles.videoTitle}>{activeVideoAppt?.doctorName}</Text>
                <Text style={styles.videoSub}>{activeVideoAppt?.department} Consultation</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveVideoAppt(null)}>
                <Text style={styles.videoClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.videoPreviewArea}>
              <View style={styles.videoDoctorFrame}>
                <Text style={styles.videoFrameText}>Doctor Video Feed</Text>
                <Text style={styles.videoFrameSub}>Connected • HD Audio/Video Active</Text>
              </View>
              <View style={styles.videoPatientSelfFrame}>
                <Text style={styles.videoSelfText}>You (Live)</Text>
              </View>
            </View>

            <View style={styles.videoControlsRow}>
              <View style={styles.controlCircle}>
                <Text style={styles.controlIcon}>🎤</Text>
              </View>
              <View style={styles.controlCircle}>
                <Text style={styles.controlIcon}>📹</Text>
              </View>
              <TouchableOpacity
                style={styles.endCallCircle}
                onPress={() => setActiveVideoAppt(null)}
              >
                <Text style={styles.endCallIcon}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Tabs */}
      <View style={styles.bottomNav}>
        {[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'doctors', label: 'Doctors', icon: '🔍' },
          { id: 'appointments', label: 'Bookings', icon: '📅' },
          { id: 'prescriptions', label: 'Meds', icon: '💊' },
          { id: 'ai', label: 'AI Triage', icon: '🤖' },
          { id: 'profile', label: 'Profile', icon: '👤' },
        ].map((tab) => {
          const isActive = activeTab === tab.id && !bookingDoctor;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.navItem}
              onPress={() => {
                setBookingDoctor(null);
                setActiveTab(tab.id as Tab);
              }}
            >
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0284c7',
  },
  screenArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
    paddingBottom: 16,
    paddingHorizontal: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  navLabelActive: {
    color: '#0284c7',
    fontWeight: '900',
  },
  videoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    padding: 16,
  },
  videoModalCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  videoTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  videoLiveBadge: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  videoTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  videoSub: {
    color: '#94a3b8',
    fontSize: 11,
  },
  videoClose: {
    color: '#94a3b8',
    fontSize: 20,
    padding: 4,
  },
  videoPreviewArea: {
    height: 260,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  videoDoctorFrame: {
    alignItems: 'center',
  },
  videoFrameText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  videoFrameSub: {
    color: '#10b981',
    fontSize: 11,
    marginTop: 4,
  },
  videoPatientSelfFrame: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 90,
    height: 110,
    backgroundColor: '#334155',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#64748b',
  },
  videoSelfText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  videoControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  controlCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    fontSize: 18,
  },
  endCallCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallIcon: {
    fontSize: 18,
  },
});
