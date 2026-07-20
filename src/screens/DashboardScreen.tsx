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
import MotivationalNotification from '../components/MotivationalNotification';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ route, navigation }: any) => {
  const { user, setUser, quoteNotificationShown, setQuoteNotificationShown } = useUser();
  const { theme } = useTheme();
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allAssessments, setAllAssessments] = useState([]); 
  const [latestSeverity, setLatestSeverity] = useState("Minimal");
  
  // Motivational Quote Notification States
  const [showQuoteNotification, setShowQuoteNotification] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<{ text: string; author: string }>({
    text: '',
    author: ''
  });
  
  // Emergency States
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [timer, setTimer] = useState(30);

  // Help Center Modal State
  const [showHelplineModal, setShowHelplineModal] = useState(false);

  const [chartData, setChartData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      { data: [0, 0, 0, 0, 0, 0, 0], label: "PHQ-9", color: () => '#EF4444' },
      { data: [0, 0, 0, 0, 0, 0, 0], label: "GAD-7", color: () => '#3B82F6' }
    ]
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
    const phqScores = sorted.map(item => getSeverityLevel(item.phqSeverity));
    const gadScores = sorted.map(item => getSeverityLevel(item.gadSeverity));
    setChartData({ 
      labels, 
      datasets: [
        { data: phqScores, label: "PHQ-9", color: () => '#EF4444' },
        { data: gadScores, label: "GAD-7", color: () => '#3B82F6' }
      ] 
    });
  }, []);

  // --- EMERGENCY ACTION LOGIC (FIXED BACKDROP STUCK) ---
  const handleEmergencyAction = useCallback(async () => {
    try {
      console.log("🚨 Starting automatic emergency alert process...");
      
      // Jaise hi trigger ho popup pehle close kar dein taake background task loading UI freeze na kare
      setShowEmergencyModal(false);

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
      }

      let locationUrl = "Location unavailable";
      try {
        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 5000, // Timeout kam kiya taake freeze na lage
        });
        locationUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      } catch (locError) {
        console.log("⚠️ Could not get location:", locError.message);
      }

      const message = `🚨 EMERGENCY ALERT: MindGuard AI detected a critical emotional state for ${displayName}.\n\nLocation: ${locationUrl}`;

      const currentUser = Array.isArray(user) ? user[0] : user;
      const g1 = currentUser?.guardianOne;
      const g2 = currentUser?.guardianTwo;
      const numbers = [g1, g2].filter(n => n && n.toString().trim() !== "");
      
      if (numbers.length === 0) {
        Alert.alert("Emergency", "Guardian numbers not found! Please update Profile.");
        setTimer(30);
        return;
      }

      let phoneNumber = numbers[0].toString().trim();
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = phoneNumber.replace(/\D/g, '').replace(/^0/, '');
        phoneNumber = '+92' + phoneNumber;
      }
      
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      
      try {
        await Linking.openURL(whatsappUrl);
      } catch (err) {
        const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        try {
          await Linking.openURL(smsUrl);
        } catch (smsErr) {
          Alert.alert("Error", "Could not open WhatsApp or SMS");
        }
      }

    } catch (error) {
      console.log("❌ Emergency Error:", error);
    } finally {
      setTimer(30);
    }
  }, [user, displayName]);

  // --- DATA FETCHING & EMERGENCY CHECK ---
  const fetchAllData = useCallback(async () => {
    const userId = user?.id || user?._id || (Array.isArray(user) && user[0]?._id);
    if (!userId) return;

    try {
      setLoading(true);
      const statsRes = await axios.get(`http://192.168.18.121:5000/api/get-weekly-stats/${userId}`);
      const userProfileRes = await axios.get(`http://192.168.18.121:5000/api/users/${userId}`).catch(() => null);

      if (userProfileRes?.data) {
        if (userProfileRes.data.guardianOne !== user?.guardianOne) {
            setUser({ ...user, ...userProfileRes.data });
        }
      }

      if (statsRes.data.success && statsRes.data.data.length > 0) {
        const sortedData = [...statsRes.data.data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setAllAssessments(sortedData);
        
        const latest = sortedData[sortedData.length - 1];
        const severity = latest.phqSeverity || "Minimal";
        setLatestSeverity(severity);
        updateChartWithWeekly(sortedData); 

        const hasJustTested = route?.params?.fromAssessment === true || route?.params?.showEmergency === true;
        
        if (hasJustTested && (severity.toLowerCase().includes('severe') || route?.params?.severity?.toLowerCase().includes('severe'))) {
          console.log("🚨 Severe Condition detected! Triggering popup...");
          setTimer(30);
          setShowEmergencyModal(true);
          navigation.setParams({ showEmergency: false, severity: undefined, fromAssessment: false });
        }
      }
    } catch (err) {
      console.log("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?._id, updateChartWithWeekly, route?.params, navigation]);

  // --- FALLBACK EFFECT FOR PARAMS ---
  useEffect(() => {
    if (route?.params?.showEmergency === true || route?.params?.severity?.toLowerCase().includes('severe')) {
      setTimer(30);
      setShowEmergencyModal(true);
      navigation.setParams({ showEmergency: false, severity: undefined, fromAssessment: false });
    }
  }, [route?.params, navigation]);

  // --- 🎯 FIXED EFFECT FOR COUNTDOWN TIMER (FORAN COUNTDOWN SHURU HOGA) ---
  useEffect(() => {
    let intervalId = null;

    if (showEmergencyModal && timer > 0) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(intervalId);
            handleEmergencyAction(); 
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showEmergencyModal]); // Optimized dependency matrix to fix freeze issue

  useEffect(() => { 
    fetchAllData(); 
  }, [fetchAllData]);

  // --- MOTIVATIONAL QUOTE NOTIFICATION ---
  useEffect(() => {
    const fetchAndShowMotivationalQuote = async () => {
      try {
        if (quoteNotificationShown) return;

        const response = await axios.get('http://192.168.1.30:5000/api/quotes/random');
        if (response.data.success && response.data.data) {
          const quote = response.data.data;
          setCurrentQuote({
            text: quote.text,
            author: quote.author || 'MindGuard Team'
          });

          setTimeout(() => {
            setShowQuoteNotification(true);
          }, 5000);

          setQuoteNotificationShown(true);
        }
      } catch (error) {
        console.log('⚠️ Could not fetch quote:', error.message);
      }
    };

    if (user && !quoteNotificationShown) {
      fetchAndShowMotivationalQuote();
    }
  }, [user, quoteNotificationShown, setQuoteNotificationShown]);

  // --- UI DYNAMIC RECS ---
  const getDynamicData = () => {
    const level = latestSeverity.toLowerCase();
    if (level.includes('severe')) {
      return {
        stress: "High Stress",
        recs: [
          { id: '1', title: 'Consult Expert', sub: 'Talk to a specialist now', icon: 'medical', bgColor: '#FEE2E2' },
          { id: '2', title: 'Deep Breathing', sub: 'Urgent stress relief', icon: 'leaf', bgColor: '#FEE2E2' },
          { id: '3', title: 'Emergency Contact', sub: 'Reach out to loved ones', icon: 'call', bgColor: '#FEE2E2' },
        ]
      };
    } else if (level.includes('moderate')) {
      return {
        stress: "Moderate",
        recs: [
          { id: '1', title: 'Yoga Session', sub: 'Balance your emotions', icon: 'body', bgColor: '#FEF3C7' },
          { id: '2', title: 'Journaling', sub: 'Write down your thoughts', icon: 'journal', bgColor: '#FEF3C7' },
          { id: '3', title: 'Unplug Now', sub: '30 min digital detox', icon: 'notifications-off', bgColor: '#FEF3C7' },
        ]
      };
    } else if (level.includes('mild')) {
      return {
        stress: "Mild",
        recs: [
          { id: '1', title: 'Evening Walk', sub: 'Fresh air for clarity', icon: 'walk', bgColor: '#E0F2FE' },
          { id: '2', title: 'Calm Music', sub: 'Relaxing lo-fi beats', icon: 'musical-notes', bgColor: '#E0F2FE' },
          { id: '3', title: 'Green Tea', sub: 'Soothing hydration', icon: 'cafe', bgColor: '#E0F2FE' },
        ]
      };
    } else {
      return {
        stress: "Calm",
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
      const phqScores = filtered.map(item => getSeverityLevel(item.phqSeverity));
      const gadScores = filtered.map(item => getSeverityLevel(item.gadSeverity));
      setChartData({ 
        labels, 
        datasets: [
          { data: phqScores, label: "PHQ-9", color: () => '#EF4444' },
          { data: gadScores, label: "GAD-7", color: () => '#3B82F6' }
        ] 
      });
      setLatestSeverity(filtered[filtered.length - 1].phqSeverity);
    } else {
      Alert.alert("No Data", `No results for ${selectedDateString}.`);
    }
  };

  const handleCancelAlertTrigger = () => {
    setShowEmergencyModal(false);
    setTimer(30);
    setTimeout(() => {
      setShowHelplineModal(true);
    }, 400);
  };

  return (
    <LinearGradient colors={[theme.primary, theme.secondary, theme.background]} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {showQuoteNotification && currentQuote.text && (
        <MotivationalNotification
          quote={currentQuote.text}
          author={currentQuote.author}
          onDismiss={() => setShowQuoteNotification(false)}
          autoHideDelay={8000}
        />
      )}
      
      {/* 1. MAIN EMERGENCY COUNTDOWN MODAL */}
      <Modal visible={showEmergencyModal} transparent animationType="fade">
        <View style={styles.emergencyOverlay}>
          <LinearGradient colors={['white', '#FFF5F5']} style={styles.emergencyCard}>
            <View style={[styles.alertIconBadge, {backgroundColor: theme.primary + '20'}]}>
                <Icon name="warning" size={45} color="#EF4444" />
            </View>
            
            <Text style={[styles.emergencyTitle, {color: theme.primary}]}>Critical Alert Detected</Text>
            <Text style={styles.emergencyDesc}>
              We detected a critical emotional state. Your WhatsApp will open with a pre-written message and your location ready to send to your guardian in:
            </Text>
            
            <View style={[styles.timerCircle, {borderColor: theme.secondary}]}>
                <Text style={[styles.timerText, {color: theme.primary}]}>{timer}</Text>
                <Text style={[styles.secText, {color: theme.primary}]}>SEC</Text>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.imFineBtn, {backgroundColor: theme.secondary}]} 
              onPress={handleCancelAlertTrigger}
            >
              <Text style={styles.imFineText}>CANCEL ALERT</Text>
            </TouchableOpacity>
            
            <Text style={styles.autoNote}>WhatsApp/SMS will auto-open when timer ends. Just click Send to notify your guardian!</Text>
          </LinearGradient>
        </View>
      </Modal>

      {/* HELP CENTER MODAL JSX */}
      <Modal visible={showHelplineModal} transparent animationType="fade">
        <View style={styles.customPopupOverlay}>
          <LinearGradient colors={['#FFFFFF', '#F8FAFF', '#EEF4FF']} style={styles.newEmergencyPopup}>
            <LinearGradient colors={[theme.secondary, theme.primary]} style={styles.newHeartWrapper}>
              <Icon name="shield-checkmark" size={30} color="white" />
            </LinearGradient>

            <Text style={[styles.newPopupTitle, { color: theme.primary }]}>Support Center</Text>
            <Text style={styles.newPopupSubtitle}>
              You\'re not alone. Emergency and mental health support services are available anytime you need help.
            </Text>

            <TouchableOpacity activeOpacity={0.85} style={styles.newHelplineCard} onPress={() => Linking.openURL('tel:1122')}>
              <LinearGradient colors={[theme.secondary + '20', theme.primary + '15']} style={styles.newHelplineIcon}>
                <Icon name="flash" size={20} color={theme.primary} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.newHelplineTitle}>Rescue Services</Text>
                <Text style={[styles.newHelplineNumber, { color: theme.primary }]}>Dial: 1122</Text>
              </View>
              <Icon name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} style={styles.newHelplineCard} onPress={() => Linking.openURL('tel:115')}>
              <LinearGradient colors={[theme.secondary + '20', theme.primary + '15']} style={styles.newHelplineIcon}>
                <Icon name="medkit" size={20} color={theme.primary} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.newHelplineTitle}>Medical Emergency</Text>
                <Text style={[styles.newHelplineNumber, { color: theme.primary }]}>Dial: 115</Text>
              </View>
              <Icon name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} style={styles.newHelplineCard} onPress={() => Linking.openURL('tel:1414')}>
              <LinearGradient colors={[theme.secondary + '20', theme.primary + '15']} style={styles.newHelplineIcon}>
                <Icon name="heart" size={20} color={theme.primary} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.newHelplineTitle}>Mental Health Support</Text>
                <Text style={[styles.newHelplineNumber, { color: theme.primary }]}>Dial: 1414</Text>
              </View>
              <Icon name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} style={styles.newCallButton} onPress={() => { setShowHelplineModal(false); Linking.openURL('tel:1122'); }}>
              <LinearGradient colors={[theme.secondary, theme.primary]} style={styles.newCallGradient}>
                <Icon name="call" size={18} color="white" />
                <Text style={styles.newCallText}>CALL EMERGENCY</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.newDismissBtn} onPress={() => setShowHelplineModal(false)}>
              <Text style={[styles.newDismissText, { color: theme.primary }]}>I\'M SAFE NOW</Text>
            </TouchableOpacity>
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
          <LinearGradient colors={[theme.secondary, theme.primary]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.infoCardFullWidth}>
            <View style={styles.conditionHeader}>
              <MCOIcon name="chart-line-variant" size={32} color="white" />
              <Text style={styles.stressLabel}>Current Condition</Text>
            </View>
            <Text style={styles.stressValue}>{dynamicContent.stress}</Text>
          </LinearGradient>
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

          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#EF4444'}]} />
              <Text style={styles.legendLabel}>PHQ-9 (Depression)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#3B82F6'}]} />
              <Text style={styles.legendLabel}>GAD-7 (Anxiety)</Text>
            </View>
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
                propsForLabels: { fontSize: 9, dx: 5 }, 
                paddingLeft: 115,
                propsForMultilineLabels: {
                  backgroundColor: "white",
                  borderRadius: 10,
                  paddingHorizontal: 6,
                  paddingVertical: 4
                }
              }}
              style={{ marginVertical: 8, borderRadius: 16, paddingRight: 45 }}
              withVerticalLabels={true}
              withHorizontalLabels={true}
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

      {/* --- BOTTOM CUSTOM TABS --- */}
      <View style={styles.tabContainer}>
        <View style={styles.bottomTabsContainer}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
            <Icon name="home" size={24} color={theme.primary} />
            <Text style={[styles.tabLabel, {color: theme.primary}]}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ChatBot')}>
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
  infoRow: { marginTop: 15 },
  infoCardFullWidth: { width: '100%', padding: 20, borderRadius: 24, height: 110, justifyContent: 'center', elevation: 4 },
  conditionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  stressLabel: { fontSize: 14, fontWeight: '600', color: 'white', marginLeft: 10 },
  stressValue: { fontSize: 26, fontWeight: 'bold', color: 'white', marginLeft: 42 },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 },
  progressTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  chartCardSolid: { padding: 15, borderRadius: 25, backgroundColor: 'white', elevation: 4, overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  chartTitle: { fontWeight: 'bold', fontSize: 16 },
  chartLegend: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, paddingHorizontal: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendLabel: { fontSize: 12, fontWeight: '500', color: '#4B5563' },
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
  autoNote: { fontSize: 11, color: '#9CA3AF', marginTop: 15, fontStyle: 'italic' },
  

/* HELP CENTER MODAL STYLES */



/* ========================= */
/* HELP CENTER MODAL STYLES */
/* ========================= */

customPopupOverlay: {
  flex: 1,
  backgroundColor: 'rgba(15,23,42,0.75)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},

newEmergencyPopup: {
  width: '92%',
  borderRadius: 30,
  paddingVertical: 20,
  paddingHorizontal: 18,
  alignItems: 'center',
  overflow: 'hidden',

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 10,
  },
  shadowOpacity: 0.2,
  shadowRadius: 18,
  elevation: 20,
},

newHeartWrapper: {
  width: 70,
  height: 70,
  borderRadius: 22,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 14,
  elevation: 6,
},

newPopupTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  marginBottom: 6,
},

newPopupSubtitle: {
  textAlign: 'center',
  color: '#64748B',
  fontSize: 13,
  lineHeight: 20,
  marginBottom: 18,
  paddingHorizontal: 8,
},

newHelplineCard: {
  width: '100%',
  backgroundColor: 'white',
  borderRadius: 20,
  paddingVertical: 12,
  paddingHorizontal: 14,
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,

  borderWidth: 1,
  borderColor: '#E2E8F0',

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.06,
  shadowRadius: 5,
  elevation: 2,
},

newHelplineIcon: {
  width: 48,
  height: 48,
  borderRadius: 15,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},

newHelplineTitle: {
  fontSize: 14,
  fontWeight: '700',
  color: '#1E293B',
},

newHelplineNumber: {
  fontSize: 13,
  marginTop: 2,
  fontWeight: 'bold',
},

newCallButton: {
  width: '100%',
  borderRadius: 18,
  overflow: 'hidden',
  marginTop: 8,
  elevation: 5,
},

newCallGradient: {
  height: 52,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
},

newCallText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 14,
  marginLeft: 8,
  letterSpacing: 0.5,
},

newDismissBtn: {
  marginTop: 8,
  paddingVertical: 10,
  width: '100%',
  alignItems: 'center',
},

newDismissText: {
  fontWeight: '700',
  fontSize: 13,
},
});
export default DashboardScreen;