import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Alert, StatusBar 
} from 'react-native';
import CustomInput from '../components/CustomInput';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { setUser } = useUser(); // Get setUser from context

  const handleLogin = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Field Required", "Please fill in all details.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      // Laptop IP as requested
      const response = await axios.post('http://192.168.1.46:5000/api/login', {
        email, password
      });

      if (response.data.success) {
        const userData = response.data.user;
        
        // Store user in context for global access (including guardians!)
        setUser({
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          guardianOne: userData.guardianOne,
          guardianTwo: userData.guardianTwo,
          token: response.data.token
        });

        console.log("✅ User logged in:", userData);
        console.log("📞 Guardians registered:", userData.guardianOne, userData.guardianTwo);

        // Navigate to Dashboard
        navigation.navigate('Dashboard', { 
          name: userData.name
        });
      }
    } catch (error: any) {
      Alert.alert("Login Error", error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FFF4" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MindGuard AI</Text>
        <Text style={styles.headerSub}>Welcome back! Sign in to continue.</Text>
      </View>
      <View style={styles.shadowOverlay} />
      <View style={styles.formCard}>
        <View style={styles.innerForm}>
          <CustomInput placeholder="Email Address" value={email} onChangeText={setEmail} />
          <CustomInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
          <CustomInput placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} /> 
          <TouchableOpacity style={styles.mainButton} activeOpacity={0.8} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0FFF4' },
  header: { paddingHorizontal: 30, height: height * 0.25, justifyContent: 'center', marginTop: 10, alignItems: 'center' },
  headerTitle: { fontSize: 34, fontWeight: '900', color: '#276749', marginTop: 40 },
  headerSub: { fontSize: 16, color: '#4A5568', marginTop: 8, textAlign: 'center' },
  shadowOverlay: { position: 'absolute', top: height * 0.25 + 55 - 5, left: 30, right: 30, height: 18, backgroundColor: '#C6F6D5', borderTopLeftRadius: 40, borderTopRightRadius: 40, opacity: 0.5 },
  formCard: { backgroundColor: 'white', marginTop: 50, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 50, flex: 1 },
  innerForm: { width: '100%' },
  mainButton: { backgroundColor: '#2F855A', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#718096', fontSize: 15 },
  link: { color: '#38A169', fontWeight: 'bold', fontSize: 15 },
});

export default LoginScreen;