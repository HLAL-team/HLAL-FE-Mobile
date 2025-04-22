import FavoriteList from '@/components/Home/FavoriteList';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const primaryColor = '#19918F';

export default function Transfer() {
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const balance = 10000000; // Example balance

    const handleTransfer = () => {
        if (!toAccount || !amount) {
            alert('Please fill all required fields');
            return;
        }
        alert(`Transfer of Rp ${Number(amount).toLocaleString()} to ${toAccount} initiated`);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Transfer</Text>
            </View>
            
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={styles.recipientContainer}>
                    <TextInput
                        style={styles.recipientInput}
                        placeholder="To..."
                        keyboardType="numeric"
                        value={toAccount}
                        onChangeText={setToAccount}
                    />
                </View>

                <TextInput
                    style={styles.amountInput}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />
                
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Balance</Text>
                    <Text style={styles.balanceAmount}>IDR {balance.toLocaleString()}</Text>
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

                <FavoriteList />
            </ScrollView>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.transferButton}
                    onPress={handleTransfer}
                >
                    <Text style={styles.buttonText}>Transfer</Text>
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
    recipientContainer: {
        marginBottom: 25,
        marginTop: 30,
        //backgroundColor: 'red',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    recipientInput: {
        backgroundColor: primaryColor,
        borderRadius: 6,
        padding: 14,
        fontSize: 16,
        color: '#fff',
    },
    amountInput: {
        fontSize: 36,
        borderBottomColor: '#e0e0e0',
        borderBottomWidth: 1,
        marginBottom: 8,
        paddingVertical: 8,
        marginTop: 40,
    },
    balanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#666',
    },
    balanceAmount: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 30,
        marginTop: 50,
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
    transferButton: {
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