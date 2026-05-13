// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  Dimensions, StatusBar, Modal, ActivityIndicator, Alert, Linking, PermissionsAndroid, Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import MCOIcon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import LinearGradient from 'react-native-linear-gradient'; 
import { LineChart } from "react-native-chart-kit";
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import GetLocation from 'react-native-get-location'; 
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ route, navigation }: any) => {
  const { user, setUser } = useUser();
  const { theme } = useTheme();
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allAssessments, setAllAssessments] = useState([]); 
  const [latestSeverity, setLatestSeverity] = useState("Minimal");
  
  // Emergency States
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [timer, setTimer] = useState(30);
  const timerRef = useRef(null);

  const [chartData, setChartData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
  });

  // Safe Name Access
  const userDataObj = Array.isArray(user) ? user[0] : user;
  const displayName = userDataObj?.name || route?.params?.name || "User";

  const getSeverityLevel = (label: string) => {
    const l = label?.toLowerCase() || "";
    if (l.includes('minimal')) return 0;
    if (l.includes('mild')) return 1;
    if (l.includes('moderate')) return 2;
    if (l.includes('severe')) return 3;
    return 0;
  };

  const getYAxisLabel = (val) => {
    const labels = ["Minimal", "Mild", "Moderate", "Severe"];
    return labels[Math.round(val)] || "";
  };

  const updateChartWithWeekly = useCallback((data) => {
    if (!data || data.length === 0) return;
    const sorted = [...data].slice(-7);
    const labels = sorted.map(item => {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[new Date(item.timestamp).getDay()];
    });
    const scores = sorted.map(item => getSeverityLevel(item.phqSeverity));
    setChartData({ labels, datasets: [{ data: scores }] });
  }, []);

  // --- EMERGENCY ACTION LOGIC ---
  const handleEmergencyAction = useCallback(async () => {
    try {
      console.log("🚨 EMERGENCY ACTION TRIGGERED - Fetching location...");
      
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission Denied", "Cannot send location without permission.");
          return;
        }
      }

      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,
      });

      console.log("📍 Location obtained:", location.latitude, location.longitude);

      // Google Maps Link
      const locationUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      const message = `🚨 EMERGENCY ALERT: MindGuard AI detected a critical emotional state for ${displayName}. \n\nUser may need immediate assistance.`;

      const currentUser = Array.isArray(user) ? user[0] : user;
      const g1 = currentUser?.guardianOne;
      const g2 = currentUser?.guardianTwo;
      
      console.log("Guardian 1:", g1);
      console.log("Guardian 2:", g2);

      const guardians = [g1, g2].filter(n => n && n.toString().trim() !== "");
      
      if (guardians.length === 0) {
        Alert.alert("Emergency", "Guardian numbers not found! Please update Profile.");
        setShowEmergencyModal(false);
        setTimer(30);
        return;
      }

      // Format phone numbers for API
      const formatPhoneForAPI = (phone: string) => {
        const cleaned = phone.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('03')) {
          return '+92' + cleaned.substring(1); // 0300... -> +92300...
        } else if (cleaned.startsWith('3')) {
          return '+92' + cleaned;
        }
        return '+92' + cleaned;
      };

      const formattedGuardians = guardians.map(g => formatPhoneForAPI(g.toString()));
      
      console.log("📤 Calling backend emergency endpoint...");

      // Call backend to send emergency alert automatically
      const response = await axios.post(
        'http://192.168.1.46:5000/api/send-emergency-alert',
        {
          userId: currentUser?.id || currentUser?._id,
          guardianNumbers: formattedGuardians,
          message: message,
          location: locationUrl
        }
      );

      console.log("✅ Emergency Response:", response.data);

      if (response.data.success) {
        Alert.alert(
          "🚨 Emergency Activated", 
          `✅ Guardians have been notified!\n\n${response.data.message}\n\nSent to: ${response.data.sentCount} guardian(s)`
        );
      } else {
        Alert.alert(
          "Alert Sent", 
          `Your guardians will receive your location: ${locationUrl}`
        );
      }
      
    } catch (error) {
      console.log("❌ Emergency Error:", error);
      Alert.alert("Error", "Failed to send emergency. Check GPS and try again.");
    } finally {
      setShowEmergencyModal(false);
      setTimer(30);
    }
  }, [user, displayName]);

  // --- DATA FETCHING (Guardian Support Included) ---
  const fetchAllData = useCallback(async () => {
    const userId = user?.id || user?._id || (Array.isArray(user) && user[0]?._id);
    if (!userId) return;

    try {
      setLoading(true);
      const statsRes = await axios.get(`http://192.168.1.46:5000/api/get-weekly-stats/${userId}`);
      
      // Fetching Profile to ensure Guardian numbers are in context
      const userProfileRes = await axios.get(`http://192.168.1.46:5000/api/users/${userId}`).catch((err) => {
        console.log("Profile fetch failed:", err.message);
        return null;
      });

      if (userProfileRes?.data?.user) {
        // Update user context with latest guardian numbers from DB
        const userData = userProfileRes.data.user;
        if (userData.guardianOne !== user?.guardianOne || userData.guardianTwo !== user?.guardianTwo) {
          console.log("Updating user with guardians:", userData.guardianOne, userData.guardianTwo);
          setUser({ ...user, ...userData });
        }
      }

      if (statsRes.data.success && statsRes.data.data.length > 0) {
        const sortedData = [...statsRes.data.data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setAllAssessments(sortedData);
        const latest = sortedData[sortedData.length - 1];
        const severity = latest.phqSeverity || "Minimal";
        setLatestSeverity(severity);
        
        if (severity.toLowerCase().includes('severe')) {
          console.log("🚨 SEVERE CONDITION DETECTED - Showing emergency modal");
          setTimer(30);
          setShowEmergencyModal(true);
        }
        updateChartWithWeekly(sortedData); 
      }
    } catch (err) {
      console.log("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?._id, updateChartWithWeekly]); // Corrected dependency for Loop Fix

  // --- EFFECTS ---
  useEffect(() => {
    if (showEmergencyModal && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && showEmergencyModal) {
      handleEmergencyAction();
    }
    return () => clearTimeout(timerRef.current);
  }, [timer, showEmergencyModal, handleEmergencyAction]);

  useEffect(() => { 
    fetchAllData(); 
  }, [fetchAllData]);

  // --- UI LOGIC ---
  const getDynamicData = () => {
    const level = latestSeverity.toLowerCase();
    if (level.includes('severe')) {
      return {
        stress: "High Stress", sleep: "5h 20m",
        recs: [
          { id: '1', title: 'Consult Expert', sub: 'Talk to a specialist now', icon: 'medical', bgColor: '#FEE2E2' },
          { id: '2', title: 'Deep Breathing', sub: 'Urgent stress relief', icon: 'leaf', bgColor: '#FEE2E2' },
          { id: '3', title: 'Emergency Contact', sub: 'Reach out to loved ones', icon: 'call', bgColor: '#FEE2E2' },
        ]
      };
    } else if (level.includes('moderate')) {
      return {
        stress: "Moderate", sleep: "6h 45m",
        recs: [
          { id: '1', title: 'Yoga Session', sub: 'Balance your emotions', icon: 'body', bgColor: '#FEF3C7' },
          { id: '2', title: 'Journaling', sub: 'Write down your thoughts', icon: 'journal', bgColor: '#FEF3C7' },
          { id: '3', title: 'Unplug Now', sub: '30 min digital detox', icon: 'notifications-off', bgColor: '#FEF3C7' },
        ]
      };
    } else if (level.includes('mild')) {
      return {
        stress: "Mild", sleep: "7h 10m",
        recs: [
          { id: '1', title: 'Evening Walk', sub: 'Fresh air for clarity', icon: 'walk', bgColor: '#E0F2FE' },
          { id: '2', title: 'Calm Music', sub: 'Relaxing lo-fi beats', icon: 'musical-notes', bgColor: '#E0F2FE' },
          { id: '3', title: 'Green Tea', sub: 'Soothing hydration', icon: 'cafe', bgColor: '#E0F2FE' },
        ]
      };
    } else {
      return {
        stress: "Calm", sleep: "8h 15m",
        recs: [
          { id: '1', title: 'Deep Sleep', sub: 'Maintain your cycle', icon: 'moon', bgColor: '#DCFCE7' },
          { id: '2', title: 'Morning Focus', sub: 'Keep the momentum', icon: 'sunny', bgColor: '#DCFCE7' },
          { id: '3', title: 'Gratitude', sub: 'List 3 good things', icon: 'heart', bgColor: '#DCFCE7' },
        ]
      };
    }
  };

  const dynamicContent = getDynamicData();

  const handleDayPress = (day) => {
    setShowCalendar(false);
    const selectedDateString = day.dateString; 
    const filtered = allAssessments.filter(item => {
      const d = new Date(item.timestamp);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` === selectedDateString;
    });
    if (filtered.length > 0) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[new Date(selectedDateString).getDay()];
      const labels = filtered.length === 1 ? [dayName] : filtered.map(item => new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const scores = filtered.map(item => getSeverityLevel(item.phqSeverity));
      setChartData({ labels, datasets: [{ data: scores }] });
      setLatestSeverity(filtered[filtered.length - 1].phqSeverity);
    } else {
      Alert.alert("No Data", `No results for ${selectedDateString}.`);
    }
  };

  return (
    <LinearGradient colors={[theme.primary, theme.secondary, theme.background]} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Modal visible={showEmergencyModal} transparent animationType="fade">
        <View style={styles.emergencyOverlay}>
          <LinearGradient colors={['white', '#FFF5F5']} style={styles.emergencyCard}>
            <View style={[styles.alertIconBadge, {backgroundColor: theme.primary + '20'}]}>
                <Icon name="warning" size={45} color="#EF4444" />
            </View>
            
            <Text style={[styles.emergencyTitle, {color: theme.primary}]}>Critical Alert Detected</Text>
            <Text style={styles.emergencyDesc}>
              We noticed you're feeling very low. MindGuard will notify your guardians with your location in:
            </Text>
            
            <View style={[styles.timerCircle, {borderColor: theme.secondary}]}>
                <Text style={[styles.timerText, {color: theme.primary}]}>{timer}</Text>
                <Text style={[styles.secText, {color: theme.primary}]}>SEC</Text>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.imFineBtn, {backgroundColor: theme.secondary}]} 
              onPress={() => { setShowEmergencyModal(false); clearTimeout(timerRef.current); }}
            >
              <Text style={styles.imFineText}>I AM OKAY, DISMISS</Text>
            </TouchableOpacity>
            
            <Text style={styles.autoNote}>Automatic alert for your safety</Text>
          </LinearGradient>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>MindGuard AI</Text>
          <Text style={styles.subWelcome}>Hello, {displayName}! Ready for a mindful day?</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Assessment')}>
          <LinearGradient colors={[theme.secondary, theme.primary]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.wellnessCard}>
            <View style={styles.glassIconBox}><MCOIcon name="brain" size={32} color="white" /></View>
            <View style={styles.wellnessTextWrapper}>
              <Text style={styles.wellnessTitle}>Start Your Daily Wellness Check-in</Text>
              <Text style={styles.wellnessSub}>PHQ-9 & GAD-7 Assessment</Text>
            </View>
            <MCOIcon name="chevron-right" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <View style={styles.infoCardSolid}>
            <MCOIcon name="moon-waning-crescent" size={28} color={theme.secondary} />
            <Text style={styles.infoLabel}>Sleep Status:</Text>
            <Text style={[styles.infoValue, {color: theme.primary}]}>{dynamicContent.sleep}</Text>
          </View>
          <View style={[styles.infoCardSolid, { backgroundColor: theme.secondary }]}>
            <MCOIcon name="chart-line-variant" size={28} color="white" />
            <Text style={styles.stressLabel}>Condition:</Text>
            <Text style={styles.stressValue}>{dynamicContent.stress}</Text>
          </View>
        </View>

        <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <TouchableOpacity onPress={() => setShowCalendar(true)}>
                <Icon name="calendar-outline" size={24} color="white" />
            </TouchableOpacity>
        </View>

        <View style={styles.chartCardSolid}>
          <View style={styles.chartHeader}>
             <Text style={[styles.chartTitle, {color: theme.primary}]}>Emotional Balance</Text>
             <MCOIcon name="dots-vertical" size={20} color="#ccc" />
          </View>
          {loading ? <ActivityIndicator color={theme.primary} size="large" /> : (
            <LineChart
              data={chartData}
              width={width - 50}
              height={220}
              fromZero={true}
              segments={3}
              formatYLabel={(val) => getYAxisLabel(val)}
              bezier
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => theme.primary,
                labelColor: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`,
                fillShadowGradient: theme.primary,
                fillShadowGradientOpacity: 0.2,
                propsForDots: { r: "5", strokeWidth: "2", stroke: theme.secondary },
                propsForBackgroundLines: { strokeDasharray: "5, 5", stroke: "#E2E8F0" },
                propsForLabels: { fontSize: 10 },
              }}
              style={{ marginVertical: 8, borderRadius: 16, paddingRight: 45, marginLeft: -15 }}
            />
          )}
        </View>

        <Text style={styles.recommendTitle}>Recommended for you</Text>
        {dynamicContent.recs.map((item) => (
          <TouchableOpacity key={item.id} style={styles.recommendationCard}>
            <View style={[styles.listIconBox, {backgroundColor: item.bgColor}]}><Icon name={item.icon} size={26} color={theme.primary} /></View>
            <View style={styles.listTextContent}>
              <Text style={[styles.itemTitle, {color: theme.primary}]}>{item.title}</Text>
              <Text style={styles.itemSub}>{item.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={showCalendar} transparent animationType="fade">
          <View style={styles.modalOverlay}>
              <View style={styles.calendarContainer}>
                  <Calendar onDayPress={handleDayPress} theme={{ todayTextColor: theme.primary, selectedDayBackgroundColor: theme.primary, arrowColor: theme.primary }} />
                  <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.closeBtn}>
                      <Text style={{color: theme.primary, fontWeight: 'bold', padding: 10}}>CLOSE</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

      <View style={styles.tabContainer}>
        <View style={styles.bottomTabsContainer}>
          <TouchableOpacity style={styles.tabItem}>
            <Icon name="home" size={24} color={theme.primary} />
            <Text style={[styles.tabLabel, {color: theme.primary}]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Chat')}>
            <Icon name="chatbubble-outline" size={22} color="#718096" />
            <Text style={styles.tabLabel}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Doctor')}>
            <Icon name="medical-outline" size={24} color="#718096" />
            <Text style={styles.tabLabel}>Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
            <Icon name="person-outline" size={22} color="#718096" />
            <Text style={styles.tabLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 140 },
  header: { marginBottom: 20 },
  welcomeText: { fontSize: 30, fontWeight: 'bold', color: 'white' },
  subWelcome: { fontSize: 16, color: 'white', opacity: 0.9 },
  wellnessCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, elevation: 8 },
  glassIconBox: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 18 },
  wellnessTextWrapper: { flex: 1, marginLeft: 15 },
  wellnessTitle: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  wellnessSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  infoCardSolid: { width: '47%', padding: 20, borderRadius: 24, height: 120, justifyContent: 'space-between', backgroundColor: 'white' },
  infoLabel: { fontSize: 11, fontWeight: '600' },
  infoValue: { fontSize: 18, fontWeight: 'bold' },
  stressLabel: { fontSize: 11, fontWeight: '600', color: 'white' },
  stressValue: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 },
  progressTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  chartCardSolid: { padding: 15, borderRadius: 25, backgroundColor: 'white', elevation: 4, overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  chartTitle: { fontWeight: 'bold', fontSize: 16 },
  recommendTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginTop: 25, marginBottom: 10 },
  recommendationCard: { flexDirection: 'row', padding: 15, borderRadius: 25, marginBottom: 15, backgroundColor: 'white' },
  listIconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  listTextContent: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemTitle: { fontSize: 16, fontWeight: 'bold' },
  itemSub: { fontSize: 12, color: '#666' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 25 },
  calendarContainer: { backgroundColor: 'white', borderRadius: 25, padding: 15 },
  closeBtn: { marginTop: 10, alignSelf: 'center' },
  tabContainer: { position: 'absolute', bottom: 25, left: 20, right: 20 },
  bottomTabsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 70, borderRadius: 30, backgroundColor: 'white', elevation: 10 },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 10, color: '#718096' },
  emergencyOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  emergencyCard: { padding: 25, borderRadius: 35, alignItems: 'center', width: '100%', elevation: 20 },
  alertIconBadge: { padding: 15, borderRadius: 25, marginBottom: 15 },
  emergencyTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  emergencyDesc: { textAlign: 'center', color: '#4B5563', lineHeight: 20, marginBottom: 20, paddingHorizontal: 10 },
  timerCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  timerText: { fontSize: 36, fontWeight: 'bold' },
  secText: { fontSize: 10, fontWeight: 'bold', marginTop: -5 },
  imFineBtn: { width: '100%', paddingVertical: 18, borderRadius: 22, alignItems: 'center', elevation: 5 },
  imFineText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  autoNote: { fontSize: 11, color: '#9CA3AF', marginTop: 15, fontStyle: 'italic' }
});

export default DashboardScreen;