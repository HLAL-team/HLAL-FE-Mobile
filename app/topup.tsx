import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { PRIMARY_COLOR } from '@/constants/colors';

const topupNominals = [20000, 50000, 100000, 200000, 300000, 500000];
const sourceOptions = ['Hasanah Card', 'BSI'];

export default function TopupPage() {
  const [amount, setAmount] = useState('');
  const [selectedNominal, setSelectedNominal] = useState<number | null>(null);
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const router = useRouter();

  const handleTopup = () => {
    if (!selectedNominal || !source) {
      alert('Please fill all fields');
      return;
    }

    router.push({
      pathname: '/confirmationTopup',
      params: {
        amount: selectedNominal.toString(),
        source,
        notes,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Top Up</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={{ marginBottom: 25 }}>
                    <Text style={{ fontSize: 14, color: '#666', marginRight: 8, position: 'absolute', top: 48, left: 0, zIndex: 1 }}>Rp</Text>
                    <TextInput
                        style={{ 
                            fontSize: 36, 
                            borderBottomColor: '#e0e0e0',
                            borderBottomWidth: 1, 
                            marginBottom: 8, 
                            paddingVertical: 8, 
                            marginTop: 40,
                            paddingLeft: 30
                        }}
                        placeholder="Enter amount"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
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
          <Picker
            selectedValue={source}
            onValueChange={setSource}
            style={styles.picker}
          >
            <Picker.Item label="Select Source" value="" />
            {sourceOptions.map((option, index) => (
              <Picker.Item key={index} label={option} value={option} />
            ))}
          </Picker>
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
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  rpText: {
    fontSize: 50,
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    fontSize: 50,
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    paddingVertical: 8,
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
