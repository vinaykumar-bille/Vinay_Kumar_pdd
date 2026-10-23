import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import mobileApi from '../services/api';
import { Doctor } from '../types';

interface DoctorSearchScreenProps {
  initialDepartment?: string;
  onSelectDoctor: (doctor: Doctor) => void;
}

export const DoctorSearchScreen: React.FC<DoctorSearchScreenProps> = ({
  initialDepartment = 'All',
  onSelectDoctor,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(initialDepartment);
  const [loading, setLoading] = useState(true);

  const departments = [
    "All", "Cardiology", "Orthopedics", "Neurology", "Dermatology", "ENT", "Pediatrics", "General Medicine"
  ];

  useEffect(() => {
    fetchDoctors();
  }, [selectedDept]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await mobileApi.doctors.getAll(selectedDept === 'All' ? undefined : selectedDept);
      setDoctors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by physician name or specialty..."
          placeholderTextColor="#94a3b8"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Horizontal Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {departments.map((dept) => (
          <TouchableOpacity
            key={dept}
            style={[
              styles.filterChip,
              selectedDept === dept && styles.filterChipActive
            ]}
            onPress={() => setSelectedDept(dept)}
          >
            <Text style={[
              styles.filterChipText,
              selectedDept === dept && styles.filterChipTextActive
            ]}>
              {dept}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Doctor Cards */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator color="#0284c7" size="large" style={{ marginTop: 40 }} />
        ) : filteredDoctors.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🩺</Text>
            <Text style={styles.emptyTitle}>No matching physicians found</Text>
            <Text style={styles.emptySub}>Try searching for another specialty or clear your filter criteria.</Text>
          </View>
        ) : (
          filteredDoctors.map((doc) => (
            <View key={doc.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: doc.imageUrl }} style={styles.avatar} />
                <View style={styles.cardDetails}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docSpec}>{doc.specialization}</Text>
                  <Text style={styles.docDept}>Department: {doc.department}</Text>
                  <View style={styles.tagRow}>
                    <Text style={styles.tagChip}>⭐ {doc.rating || 4.9}</Text>
                    <Text style={styles.tagChip}>{doc.experience} Yrs Experience</Text>
                    <Text style={styles.feeChip}>₹{doc.fees}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.aboutText} numberOfLines={2}>
                {doc.about}
              </Text>

              <View style={styles.cardActions}>
                <View style={styles.modesRow}>
                  <Text style={styles.modeText}>📍 Clinic Visit</Text>
                  <Text style={styles.modeText}>📹 Video Call</Text>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => onSelectDoctor(doc)}
                >
                  <Text style={styles.bookBtnText}>Book Appointment →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  clearSearch: {
    fontSize: 14,
    color: '#94a3b8',
    padding: 4,
  },
  chipsScroll: {
    maxHeight: 44,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
  },
  docName: {
    fontSize: 14,
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
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    alignItems: 'center',
  },
  tagChip: {
    fontSize: 10,
    backgroundColor: '#f1f5f9',
    color: '#334155',
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  feeChip: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0f172a',
    marginLeft: 'auto',
  },
  aboutText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 10,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  bookBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bookBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 240,
    marginTop: 4,
  },
});

export default DoctorSearchScreen;
