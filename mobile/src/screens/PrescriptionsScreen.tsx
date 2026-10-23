import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import mobileApi from '../services/api';
import { Prescription } from '../types';

export const PrescriptionsScreen: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptions();
  }, [user]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await mobileApi.prescriptions.getAll(user?.id);
      setPrescriptions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Digital Health Prescriptions</Text>
        <Text style={styles.headerSub}>Authenticated medication charts issued by certified Saveetha Hospital doctors.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#0284c7" size="large" style={{ marginTop: 40 }} />
      ) : prescriptions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💊</Text>
          <Text style={styles.emptyTitle}>No prescriptions issued yet</Text>
          <Text style={styles.emptySub}>Prescriptions from your completed doctor appointments will automatically sync here.</Text>
        </View>
      ) : (
        prescriptions.map((pres) => (
          <View key={pres.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.doctorName}>{pres.doctorName}</Text>
                <Text style={styles.receiptId}>Prescription #{pres.id}</Text>
              </View>
              <Text style={styles.presDate}>📅 {pres.date}</Text>
            </View>

            <View style={styles.diagnosisBox}>
              <Text style={styles.diagnosisLabel}>DIAGNOSIS</Text>
              <Text style={styles.diagnosisValue}>{pres.diagnosis}</Text>
            </View>

            <Text style={styles.medsHeader}>PRESCRIBED MEDICINES ({pres.medicines ? pres.medicines.length : 0})</Text>
            <View style={styles.medsList}>
              {(pres.medicines || []).map((m, idx) => (
                <View key={idx} style={styles.medItem}>
                  <View style={styles.medItemTop}>
                    <Text style={styles.medName}>💊 {m.name}</Text>
                    <Text style={styles.medDosage}>{m.dosage}</Text>
                  </View>
                  <Text style={styles.medDuration}>Duration: {m.duration} • {m.instructions || 'After meals'}</Text>
                </View>
              ))}
            </View>

            {pres.advice ? (
              <View style={styles.adviceBox}>
                <Text style={styles.adviceLabel}>CLINICAL LIFESTYLE ADVICE</Text>
                <Text style={styles.adviceText}>"{pres.advice}"</Text>
              </View>
            ) : null}

            <View style={styles.verifiedFooter}>
              <Text style={styles.verifiedText}>🩺 Digitally Verified by EHR Portal</Text>
            </View>
          </View>
        ))
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
  headerBox: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 10,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  receiptId: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '700',
    marginTop: 2,
  },
  presDate: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  diagnosisBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  diagnosisLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0369a1',
    letterSpacing: 0.5,
  },
  diagnosisValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0c4a6e',
    marginTop: 2,
  },
  medsHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  medsList: {
    gap: 8,
    marginBottom: 12,
  },
  medItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  medItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  medDosage: {
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: '#e2e8f0',
    color: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  medDuration: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  adviceBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  adviceLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  adviceText: {
    fontSize: 11,
    color: '#334155',
    fontStyle: 'italic',
    marginTop: 2,
    lineHeight: 16,
  },
  verifiedFooter: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  verifiedText: {
    fontSize: 9,
    color: '#059669',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    textAlign: 'center',
    maxWidth: 240,
  },
});

export default PrescriptionsScreen;
