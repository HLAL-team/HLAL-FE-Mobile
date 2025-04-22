// pages/topup.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const primaryColor = '#19918F';

const topupNominals = [20000, 50000, 100000, 200000];
const sourceOptions = ["Hasanah Card", "BSI", "Alfamart", "Indomart"];

export default function TopupPage() {
    const [amount, setAmount] = useState('');
    const [selectedNominal, setSelectedNominal] = useState<number | null>(null);
    const [source, setSource] = useState('');
    const [notes, setNotes] = useState('');

    const handleTopup = () => {
        if (!selectedNominal || !source) {
            alert('Please fill all fields');
            return;
        }
        alert(`Topup of Rp ${selectedNominal.toLocaleString()} from ${source} initiated`);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Top Up</Text>
            </View>
            
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <TextInput
                    style={styles.amountInput}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />

                <View style={styles.nominalContainer}>
                    {topupNominals.map((item) => (
                        <TouchableOpacity
                            key={item.toString()}
                            style={[
                                styles.nominalCard,
                                selectedNominal === item && styles.selectedNominal
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
                <TouchableOpacity
                    style={styles.topupButton}
                    onPress={handleTopup}
                >
                    <Text style={styles.buttonText}>Top Up</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        padding: 25,
        backgroundColor: "#fff",
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
        color: primaryColor,
    },
    amountInput: {
        fontSize: 36,
        borderBottomColor: '#e0e0e0',
        borderBottomWidth: 1,
        marginBottom: 16,
        marginTop: 40,
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
        borderColor: primaryColor,
    },
    nominalText: {
        color: "#333",
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
        height: 40,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        borderWidth: 0,
    },
    notesInput: {
        height: 80,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        padding: 10,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        padding: 25,
        paddingTop: 10,
        paddingBottom: 30,
        backgroundColor: "#fff",
    },
    topupButton: {
        backgroundColor: primaryColor,
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
