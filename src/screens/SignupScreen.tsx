import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Dimensions, Alert, StatusBar } from 'react-native';
import CustomInput from '../components/CustomInput';
import axios from 'axios';

const { height } = Dimensions.get('window');

const SignupScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [g1, setG1] = useState('');
  const [g2, setG2] = useState('');

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 4) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 11)}`;
    }
    return cleaned;
  };

  const handleSignup = async () => {
    if (!email.trim() || !name.trim() || !password.trim() || !g1.trim() || !g2.trim()) {
      Alert.alert("Missing Information", "Please complete all fields.");
      return;
    }

    // --- EMAIL VALIDATION (@ MUST BE PRESENT) ---
    if (!email.includes('@')) {
      Alert.alert("Invalid Email", "Please enter a valid email address containing '@'.");
      return;
    }

    // --- PASSWORD VALIDATION (MIN 8 CHARACTERS & AT LEAST ONE SPECIAL CHARACTER) ---
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long.");
      return;
    }
    if (!specialCharRegex.test(password)) {
      Alert.alert("Weak Password", "Password must contain at least one special character (e.g. @, #, $, !, %, *, ?, &).");
      return;
    }

    const phoneRegex = /^\d{4}-\d{7}$/;
    if (!phoneRegex.test(g1) || !phoneRegex.test(g2)) {
      Alert.alert("Invalid Number Format", "Please enter a valid 11-digit guardian number.");
      return;
    }

    try {
      // Clean phone numbers: "0300-6038569" -> "03006038569" -> "+923006038569"
      const cleanG1 = g1.replace('-', '').replace(/^0/, '+92');
      const cleanG2 = g2.replace('-', '').replace(/^0/, '+92');

      const response = await axios.post('http://192.168.18.121:5000/api/signup', {
        name, email, password, guardianOne: cleanG1, guardianTwo: cleanG2
      });

      if (response.data.success) {
        Alert.alert("Success", "Account created successfully!");
        navigation.navigate('Login');
      }
    } catch (error: any) {
      Alert.alert("Signup Failed", error.response?.data?.message || "Server connection error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />
      <ScrollView contentContainerStyle={{flexGrow: 1}} bounces={false}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>MindGuard AI</Text>
            <Text style={styles.headerSub}>Create an account to start.</Text>
        </View>
        <View style={styles.shadowOverlay} />
        <View style={styles.formCard}>
          <CustomInput placeholder="Email Address" value={email} onChangeText={setEmail} />
          <CustomInput placeholder="Your name" value={name} onChangeText={setName} />
          <CustomInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
          <CustomInput placeholder="Guardian 1 (03XX-XXXXXXX)" keyboardType="phone-pad" value={g1} onChangeText={(text: string) => setG1(formatPhoneNumber(text))} maxLength={12} />
          <CustomInput placeholder="Guardian 2 (03XX-XXXXXXX)" keyboardType="phone-pad" value={g2} onChangeText={(text: string) => setG2(formatPhoneNumber(text))} maxLength={12} />
          <TouchableOpacity style={styles.mainButton} activeOpacity={0.8} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0FFF4' },
  header: { paddingHorizontal: 30, paddingTop: height * 0.08, paddingBottom: 20, alignItems: 'center' },
  headerTitle: { fontSize: 34, fontWeight: '900', color: '#276749' },
  headerSub: { fontSize: 16, color: '#4A5568', marginTop: 8 },
  shadowOverlay: { position: 'absolute', top: height * 0.08 + 34 + 65, left: 25, right: 25, height: 25, backgroundColor: '#C6F6D5', borderTopLeftRadius: 40, borderTopRightRadius: 40, opacity: 0.6 },
  formCard: { backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, flex: 1, marginTop: 15 },
  mainButton: { backgroundColor: '#38A169', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 15 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#718096', fontSize: 15 },
  link: { color: '#38A169', fontWeight: 'bold', fontSize: 15 },
});

export default SignupScreen;