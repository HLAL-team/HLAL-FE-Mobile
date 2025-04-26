import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { PRIMARY_COLOR } from '@/constants/colors';
import { TRANSACTION_API } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const topupNominals = [20000, 50000, 100000, 200000, 300000, 500000];

export default function TopupPage() {
  const [amount, setAmount] = useState('');
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null);
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [sources, setSources] = useState<{ id: number; name: string }[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoadingSources(true);
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'No authentication token found');
          return;
        }

        const response = await fetch(`${TRANSACTION_API}/topupmethod`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch top-up methods');
        }

        const json = await response.json();
        setSources(json.data || []);
      } catch (error) {
        console.error('Failed to fetch top-up methods:', error);
        Alert.alert('Error', 'Failed to fetch top-up methods');
      } finally {
        setLoadingSources(false);
      }
    };

    fetchSources();
  }, []);

  const handleTopup = () => {
    if (!selectedNominal || !source) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Prepare the payload to pass to the confirmation page
    const payload = {
      source,
      amount: selectedNominal.toString(),
      notes: notes || 'Topup', // Optional notes
    };

    // Navigate to the confirmation page with the payload
    router.push({
      pathname: '/confirmationTopup',
      params: payload,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Top Up</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={{ marginBottom: 25 }}>
          <Text
            style={{
              fontSize: 14,
              color: '#666',
              marginRight: 8,
              position: 'absolute',
              top: 48,
              left: 0,
              zIndex: 1,
            }}
          >
            Rp
          </Text>
          <TextInput
            style={{
              fontSize: 36,
              borderBottomColor: '#e0e0e0',
              borderBottomWidth: 1,
              marginBottom: 8,
              paddingVertical: 8,
              marginTop: 40,
              paddingLeft: 30,
            }}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={(value) => {
              setAmount(value);
              const numericValue = parseInt(value, 10);
              setSelectedNominal(isNaN(numericValue) ? null : numericValue); // Update selectedNominal if valid
            }}
          />
        </View>

        <View style={styles.nominalContainer}>
          {topupNominals.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.nominalCard,
                selectedNominal === item && styles.selectedNominal,
              ]}
              onPress={() => {
                setAmount(item.toString());
                setSelectedNominal(item);
              }}
            >
              <Text style={styles.nominalText}>{item.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Source</Text>
          {loadingSources ? (
            <ActivityIndicator size="small" color={PRIMARY_COLOR} />
          ) : (
            <Picker
              selectedValue={source}
              onValueChange={setSource}
              style={styles.picker}
            >
              <Picker.Item label="Select Source" value="" />
              {sources.map((option) => (
                <Picker.Item key={option.id} label={option.name} value={option.id.toString()} />
              ))}
            </Picker>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Optional"
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.topupButton} onPress={handleTopup}>
          <Text style={styles.buttonText}>Top Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  nominalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  nominalCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedNominal: {
    backgroundColor: '#e6f2f2',
    borderColor: PRIMARY_COLOR,
  },
  nominalText: {
    color: '#333',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  picker: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  notesInput: {
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  topupButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});