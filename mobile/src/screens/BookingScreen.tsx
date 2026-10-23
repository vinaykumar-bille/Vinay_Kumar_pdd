import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import mobileApi from '../services/api';
import { Doctor, ConsultationType, Appointment } from '../types';

interface BookingScreenProps {
  doctor: Doctor;
  onSuccess: (appointment: Appointment) => void;
  onCancel: () => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({ doctor, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [consultType, setConsultType] = useState<ConsultationType>('IN_PERSON');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [symptoms, setSymptoms] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [successAppt, setSuccessAppt] = useState<Appointment | null>(null);

  // Generate next 7 days dates
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    return { dateStr, dayName, dayNum };
  });

  useEffect(() => {
    // Select first day by default
    if (next7Days.length > 0 && !selectedDate) {
      setSelectedDate(next7Days[0].dateStr);
    }
  }, []);

  useEffect(() => {
    if (selectedDate && doctor) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, doctor]);

  const fetchSlots = async (date: string) => {
    setLoadingSlots(true);
    setSelectedSlot('');
    try {
      const data = await mobileApi.doctors.getAvailability(doctor.id, date);
      setAvailableSlots(data.availableSlots || ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"]);
    } catch (e) {
      setAvailableSlots(["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      setBookingError("Please select both a date and an available time slot.");
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      const result = await mobileApi.appointments.create({
        patientId: user?.id || 'usr_1',
        patientName: user?.name || 'Vinay Kumar',
        doctorId: doctor.id,
        doctorName: doctor.name,
        department: doctor.department,
        date: selectedDate,
        timeSlot: selectedSlot,
        symptoms: symptoms || "Routine Clinical Consultation",
        consultationType: consultType
      });
      setSuccessAppt(result);
    } catch (err: any) {
      setBookingError(err.message || "Slot is no longer available. Please choose another time.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Doctor Profile Bar */}
      <View style={styles.doctorHeader}>
        <Image source={{ uri: doctor.imageUrl }} style={styles.avatar} />
        <View style={styles.doctorInfo}>
          <Text style={styles.docName}>{doctor.name}</Text>
          <Text style={styles.docSpec}>{doctor.specialization}</Text>
          <Text style={styles.docDept}>Department: {doctor.department}</Text>
          <Text style={styles.docFee}>Consultation Fee: ₹{doctor.fees}</Text>
        </View>
      </View>

      {/* Success Modal Overlay */}
      {successAppt ? (
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Appointment Confirmed!</Text>
          <Text style={styles.successSub}>
            Your appointment has been reserved on the clinical calendar and synchronized across web & mobile.
          </Text>
          <View style={styles.receiptBox}>
            <Text style={styles.receiptRow}>Receipt Number: <Text style={styles.receiptBold}>#{successAppt.appointmentNumber || successAppt.id}</Text></Text>
            <Text style={styles.receiptRow}>Physician: <Text style={styles.receiptBold}>{successAppt.doctorName}</Text></Text>
            <Text style={styles.receiptRow}>Scheduled Date: <Text style={styles.receiptBold}>{successAppt.date} at {successAppt.timeSlot}</Text></Text>
            <Text style={styles.receiptRow}>Consultation Mode: <Text style={styles.receiptBold}>{successAppt.consultationType}</Text></Text>
          </View>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => onSuccess(successAppt)}
          >
            <Text style={styles.doneBtnText}>View in My Appointments →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Consultation Mode Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select Consultation Mode</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeCard, consultType === 'IN_PERSON' && styles.modeCardActive]}
                onPress={() => setConsultType('IN_PERSON')}
              >
                <Text style={styles.modeIcon}>📍</Text>
                <Text style={[styles.modeTitle, consultType === 'IN_PERSON' && styles.modeTitleActive]}>
                  In-Person Visit
                </Text>
                <Text style={styles.modeSub}>At Hospital Clinic</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeCard, consultType === 'VIDEO' && styles.modeCardActive]}
                onPress={() => setConsultType('VIDEO')}
              >
                <Text style={styles.modeIcon}>📹</Text>
                <Text style={[styles.modeTitle, consultType === 'VIDEO' && styles.modeTitleActive]}>
                  Telehealth Video
                </Text>
                <Text style={styles.modeSub}>Encrypted Call Room</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Choose Appointment Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {next7Days.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <TouchableOpacity
                    key={item.dateStr}
                    style={[styles.dateCard, isSelected && styles.dateCardActive]}
                    onPress={() => setSelectedDate(item.dateStr)}
                  >
                    <Text style={[styles.dayName, isSelected && styles.dayTextActive]}>{item.dayName}</Text>
                    <Text style={[styles.dayNum, isSelected && styles.dayTextActive]}>{item.dayNum}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Slot Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Choose Available Time Slot</Text>
            {loadingSlots ? (
              <ActivityIndicator color="#0284c7" style={{ padding: 20 }} />
            ) : availableSlots.length === 0 ? (
              <Text style={styles.noSlotsText}>No vacant slots on this date. Please pick another date.</Text>
            ) : (
              <View style={styles.slotsGrid}>
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[styles.slotChip, isSelected && styles.slotChipActive]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Symptoms Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Symptoms / Reason for Visit</Text>
            <TextInput
              style={styles.symptomsInput}
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="e.g. Mild chest tightness, fever for 2 days, skin rash..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
            />
          </View>

          {bookingError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {bookingError}</Text>
            </View>
          ) : null}

          {/* Confirmation Action */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmBooking}
              disabled={bookingLoading}
            >
              {bookingLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm Booking (₹{doctor.fees})</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
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
  doctorHeader: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 14,
  },
  docName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  docSpec: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    marginTop: 1,
  },
  docDept: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  docFee: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  modeCardActive: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff',
  },
  modeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  modeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  modeTitleActive: {
    color: '#0284c7',
  },
  modeSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  dateScroll: {
    flexDirection: 'row',
  },
  dateCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginRight: 8,
    minWidth: 54,
  },
  dateCardActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  dayName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  dayTextActive: {
    color: '#ffffff',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minWidth: '30%',
    alignItems: 'center',
  },
  slotChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  slotText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  slotTextActive: {
    color: '#ffffff',
  },
  noSlotsText: {
    fontSize: 11,
    color: '#ef4444',
    fontStyle: 'italic',
  },
  symptomsInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    fontSize: 12,
    color: '#0f172a',
    textAlignVertical: 'top',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 11,
    color: '#b91c1c',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 12,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#15803d',
  },
  successSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  receiptBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  receiptRow: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 6,
  },
  receiptBold: {
    fontWeight: '800',
    color: '#0f172a',
  },
  doneBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
});

export default BookingScreen;
