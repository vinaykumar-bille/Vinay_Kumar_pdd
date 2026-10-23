import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import mobileApi from '../services/api';
import { Appointment } from '../types';

interface AppointmentsListScreenProps {
  onJoinVideo?: (appointment: Appointment) => void;
}

export const AppointmentsListScreen: React.FC<AppointmentsListScreenProps> = ({ onJoinVideo }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Completed' | 'Cancelled'>('All');
  const [loading, setLoading] = useState(true);

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('2026-10-28');
  const [newSlot, setNewSlot] = useState('11:00 AM');
  const [rescheduleReason, setRescheduleReason] = useState('Personal schedule conflict');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('Patient personal emergency');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await mobileApi.appointments.getAll(user?.id);
      setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleTarget) return;
    setRescheduleLoading(true);
    try {
      await mobileApi.appointments.reschedule(rescheduleTarget.id, newDate, newSlot, rescheduleReason);
      setRescheduleTarget(null);
      loadAppointments();
    } catch (e: any) {
      Alert.alert("Reschedule Failed", e.message || "Failed to update slot.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await mobileApi.appointments.cancel(cancelTarget.id, cancelReason);
      setCancelTarget(null);
      loadAppointments();
    } catch (e: any) {
      Alert.alert("Cancellation Failed", e.message || "Failed to cancel.");
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (filterTab === 'Active') return a.status === 'Approved' || a.status === 'Pending' || a.status === 'CONFIRMED';
    if (filterTab === 'Completed') return a.status === 'Completed' || a.status === 'COMPLETED';
    if (filterTab === 'Cancelled') return a.status === 'Cancelled' || a.status === 'CANCELLED' || a.status === 'Rejected';
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {(['All', 'Active', 'Completed', 'Cancelled'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filterTab === tab && styles.tabActive]}
            onPress={() => setFilterTab(tab)}
          >
            <Text style={[styles.tabText, filterTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color="#0284c7" size="large" style={{ marginTop: 40 }} />
        ) : filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No appointments found</Text>
            <Text style={styles.emptySub}>You have no records under the {filterTab} filter.</Text>
          </View>
        ) : (
          filteredAppointments.map(appt => {
            const isCompleted = appt.status === 'Completed' || appt.status === 'COMPLETED';
            const isCancelled = appt.status === 'Cancelled' || appt.status === 'CANCELLED';
            const isActive = !isCompleted && !isCancelled;

            return (
              <View key={appt.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <Text style={styles.doctorName}>{appt.doctorName}</Text>
                    <Text style={styles.departmentText}>{appt.department}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    isCompleted ? styles.statusBadgeCompleted : isCancelled ? styles.statusBadgeCancelled : styles.statusBadgeActive
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      isCompleted ? styles.statusTextCompleted : isCancelled ? styles.statusTextCancelled : styles.statusTextActive
                    ]}>
                      {appt.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <Text style={styles.timeDetail}>📅 {appt.date}</Text>
                  <Text style={styles.timeDetail}>⏰ {appt.timeSlot}</Text>
                  <Text style={styles.modeDetail}>
                    {appt.consultationType === 'VIDEO' ? '📹 Video' : '📍 In-Person'}
                  </Text>
                </View>

                {appt.symptoms ? (
                  <Text style={styles.symptomsText} numberOfLines={2}>
                    Reason: "{appt.symptoms}"
                  </Text>
                ) : null}

                {/* Actions Row */}
                <View style={styles.actionsRow}>
                  {appt.consultationType === 'VIDEO' && isActive && onJoinVideo ? (
                    <TouchableOpacity
                      style={styles.videoBtn}
                      onPress={() => onJoinVideo(appt)}
                    >
                      <Text style={styles.videoBtnText}>📹 Launch Video</Text>
                    </TouchableOpacity>
                  ) : null}

                  {isActive ? (
                    <>
                      <TouchableOpacity
                        style={styles.rescheduleBtn}
                        onPress={() => {
                          setRescheduleTarget(appt);
                          setNewDate(appt.date);
                          setNewSlot(appt.timeSlot);
                        }}
                      >
                        <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setCancelTarget(appt)}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : null}

                  {isCompleted ? (
                    <Text style={styles.sessionClosedText}>✔️ Consultation Finished & Prescribed</Text>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal visible={!!rescheduleTarget} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reschedule Appointment</Text>
            <Text style={styles.modalSub}>
              Choose a new available date and time slot for {rescheduleTarget?.doctorName}.
            </Text>

            <Text style={styles.modalLabel}>New Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              value={newDate}
              onChangeText={setNewDate}
              placeholder="2026-10-28"
            />

            <Text style={styles.modalLabel}>New Time Slot</Text>
            <TextInput
              style={styles.modalInput}
              value={newSlot}
              onChangeText={setNewSlot}
              placeholder="11:00 AM"
            />

            <Text style={styles.modalLabel}>Reason for Rescheduling</Text>
            <TextInput
              style={styles.modalInput}
              value={rescheduleReason}
              onChangeText={setRescheduleReason}
              placeholder="Personal reason..."
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRescheduleTarget(null)}
              >
                <Text style={styles.modalCancelBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleRescheduleSubmit}
                disabled={rescheduleLoading}
              >
                {rescheduleLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Confirm Reschedule</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Modal */}
      <Modal visible={!!cancelTarget} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: '#dc2626' }]}>Cancel Appointment</Text>
            <Text style={styles.modalSub}>
              Are you sure you want to cancel with {cancelTarget?.doctorName}? The vacant slot will be immediately returned to availability.
            </Text>

            <Text style={styles.modalLabel}>Cancellation Reason *</Text>
            <TextInput
              style={styles.modalInput}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Reason for cancellation..."
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCancelTarget(null)}
              >
                <Text style={styles.modalCancelBtnText}>Keep Slot</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#dc2626' }]}
                onPress={handleCancelSubmit}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Confirm Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#0284c7',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  departmentText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeActive: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusTextActive: {
    color: '#15803d',
    fontSize: 9,
    fontWeight: '800',
  },
  statusBadgeCompleted: {
    backgroundColor: '#e0f2fe',
  },
  statusTextCompleted: {
    color: '#0369a1',
    fontSize: 9,
    fontWeight: '800',
  },
  statusBadgeCancelled: {
    backgroundColor: '#fee2e2',
  },
  statusTextCancelled: {
    color: '#b91c1c',
    fontSize: 9,
    fontWeight: '800',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  timeDetail: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  modeDetail: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    marginLeft: 'auto',
  },
  symptomsText: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  videoBtn: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  videoBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  rescheduleBtn: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rescheduleBtnText: {
    color: '#0284c7',
    fontSize: 10,
    fontWeight: '800',
  },
  cancelBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '800',
  },
  sessionClosedText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 16,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  modalCancelBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  modalSubmitBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#0284c7',
  },
  modalSubmitBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
});

export default AppointmentsListScreen;
