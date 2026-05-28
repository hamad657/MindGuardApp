// @ts-nocheck
import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, 
  LayoutAnimation, Platform, UIManager, StatusBar, Alert, ActivityIndicator 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { runInference } from '../services/tfliteService';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking so slowly or being too fidgety",
  "Thoughts of hurting yourself"
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

const OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 }
];

const AssessmentScreen = ({ navigation }: any) => {
  const [activeCard, setActiveCard] = useState<string | null>('PHQ');
  const [phqAnswers, setPhqAnswers] = useState(new Array(9).fill(-1));
  const [gadAnswers, setGadAnswers] = useState(new Array(7).fill(-1));
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useUser(); // Get user from UserContext
  const { theme } = useTheme();

  // Debug: Log user data
  React.useEffect(() => {
    console.log("📋 User Data in AssessmentScreen:", user);
  }, [user]);

  const toggleCard = (card: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveCard(activeCard === card ? null : card);
  };

  const handleFinalSubmit = async () => {
    // 1. Validation check
    if (phqAnswers.includes(-1) || gadAnswers.includes(-1)) {
      Alert.alert("Incomplete", "Please answer all questions in both PHQ-9 and GAD-7 sections.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. ML Inference (Prediction)
      console.log("🔄 Starting ML prediction...");
      const phqResult = await runInference('PHQ9', phqAnswers);
      const gadResult = await runInference('GAD7', gadAnswers);

      console.log("PHQ Result:", phqResult);
      console.log("GAD Result:", gadResult);

      if (!phqResult || !gadResult) {
        Alert.alert("Error", "ML Model prediction failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // 3. User ID Check
      const finalUserId = user?.id || user?._id;
      console.log("🔍 User ID Check - ID:", finalUserId, "Full User:", user);
      if (!finalUserId) {
        Alert.alert("Error", "User details missing. Please login again. (No user ID found)");
        setIsLoading(false);
        return;
      }

      // 4. API CALL (Backend mein save karna)
      const payload = {
        userId: finalUserId,
        phqScore: phqResult.score,
        phqSeverity: phqResult.label,
        gadScore: gadResult.score,
        gadSeverity: gadResult.label,
        timestamp: new Date().toISOString(),
      };

      console.log("📤 Sending to backend:", payload);

      try {
        const response = await axios.post('http://192.168.18.121:5000/api/save-full-assessment', payload);
        
        if (response.status === 200 || response.status === 201) {
          const predictionType = phqResult.isLocalPrediction ? "(Calculated)" : "(AI Predicted)";
          Alert.alert(
            "✅ Assessment Complete",
            `Results ${predictionType}:\n\nPHQ-9: ${phqResult.label}\nGAD-7: ${gadResult.label}`,
            [{ text: "OK", onPress: () => navigation.navigate('Dashboard') }]
          );
        }
      } catch (apiErr: any) {
        console.warn("⚠️ Backend save failed:", apiErr.message);
        
        // Still show results even if backend fails
        const predictionType = phqResult.isLocalPrediction ? "(Calculated)" : "(AI Predicted)";
        Alert.alert(
          "Assessment Complete", 
          `Results ${predictionType}:\n\nPHQ-9: ${phqResult.label}\nGAD-7: ${gadResult.label}\n\n⚠️ Note: Data will be saved when internet is available.`,
          [{ text: "OK", onPress: () => navigation.navigate('Dashboard') }]
        );
      }

    } catch (error: any) {
      console.error("❌ Critical Error:", error);
      Alert.alert("Process Error", `Something went wrong. Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionList = (questions: string[], answers: any, setAnswers: any) => (
    <View style={styles.expandedContent}>
      {questions.map((q, i) => (
        <View key={i} style={styles.questionWrapper}>
          <Text style={[styles.questionText, {color: theme.primary}]}>{i + 1}. {q}</Text>
          <View style={styles.optionsColumn}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  let newAns = [...answers];
                  newAns[i] = opt.value;
                  setAnswers(newAns);
                }}
                style={[
                  styles.optionRow,
                  answers[i] === opt.value && { borderColor: theme.primary, backgroundColor: theme.background + '40' } 
                ]}
              >
                <View style={[styles.radioOuter, answers[i] === opt.value && {borderColor: theme.primary}]}>
                  {answers[i] === opt.value && <View style={[styles.radioInner, {backgroundColor: theme.primary}]} />}
                </View>
                <Text style={[styles.optionLabel, answers[i] === opt.value && styles.selectedOptionLabel]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <LinearGradient colors={[theme.primary, theme.secondary, theme.background]} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assessments</Text>
          <Text style={styles.headerSub}>Complete both screenings for a full report.</Text>
        </View>

        <View style={styles.tipCard}>
          <Icon name="bulb-outline" size={20} color={theme.primary} />
          <Text style={[styles.tipText, {color: theme.primary}]}>Please answer honestly for the most accurate analysis.</Text>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={[styles.cardHeader, { borderLeftColor: theme.secondary }]} 
            onPress={() => toggleCard('PHQ')}
            activeOpacity={0.9}
          >
            <View>
              <Text style={[styles.cardMainTitle, {color: theme.primary}]}>PHQ-9(Patient Health Questionnaire-9)</Text>
              <Text style={styles.cardSubTitle}>Depression Screening</Text>
            </View>
            <Icon name={activeCard === 'PHQ' ? 'chevron-up' : 'chevron-down'} size={20} color="#718096" />
          </TouchableOpacity>
          {activeCard === 'PHQ' && renderQuestionList(PHQ9_QUESTIONS, phqAnswers, setPhqAnswers)}
        </View>

        <View style={styles.gadCardWrapper}>
          <TouchableOpacity 
            style={[styles.cardHeader, { borderLeftColor: theme.primary }]} 
            onPress={() => toggleCard('GAD')}
            activeOpacity={0.9}
          >
            <View>
              <Text style={[styles.cardMainTitle, {color: theme.primary}]}>GAD-7(Generalized Anxiety Disorder-7)</Text>
              <Text style={styles.cardSubTitle}>Anxiety Screening</Text>
            </View>
            <Icon name={activeCard === 'GAD' ? 'chevron-up' : 'chevron-down'} size={20} color="#718096" />
          </TouchableOpacity>
          {activeCard === 'GAD' && renderQuestionList(GAD7_QUESTIONS, gadAnswers, setGadAnswers)}
        </View>

        <TouchableOpacity 
          style={[
            styles.submitBtn, 
            {
              backgroundColor: theme.primary, 
              opacity: isLoading ? 0.7 : 1
            } as any
          ]}
          onPress={handleFinalSubmit}
          disabled={isLoading}
        >
          {isLoading && <ActivityIndicator color="white" size="small" style={{ marginRight: 10 } as any} />}
          <Text style={styles.submitBtnText}>
            {isLoading ? 'Processing...' : 'Submit All Assessments'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- FLOATING TABS --- */}
      <View style={styles.tabContainer}>
        <View style={styles.bottomTabsContainer}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
            <Icon name="home-outline" size={22} color="#718096" />
            <Text style={styles.tabLabel}>Home</Text>
          </TouchableOpacity>
          
          {/* Linked directly to ChatBot screen */}
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
  headerTitle: { fontSize: 30, fontWeight: 'bold', color: 'white' },
  headerSub: { fontSize: 15, color: 'white', opacity: 0.9, marginTop: 5 },
  tipCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.9)', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 25 },
  tipText: { flex: 1, marginLeft: 10, fontSize: 13, fontWeight: '500' },
  cardContainer: { backgroundColor: 'white', borderRadius: 25, elevation: 5, overflow: 'hidden' },
  gadCardWrapper: { backgroundColor: 'white', borderRadius: 25, elevation: 5, overflow: 'hidden', marginTop: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 22, borderLeftWidth: 8 },
  cardMainTitle: { fontSize: 20, fontWeight: 'bold' },
  cardSubTitle: { fontSize: 13, color: '#718096', marginTop: 2 },
  expandedContent: { padding: 20, backgroundColor: '#FCFFFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  questionWrapper: { marginBottom: 25 },
  questionText: { fontSize: 15, fontWeight: '700', marginBottom: 15, lineHeight: 20 },
  optionsColumn: { gap: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 15, borderWidth: 1, borderColor: '#EDF2F7', backgroundColor: 'white' },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#CBD5E0', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: { fontSize: 14, color: '#4A5568' },
  selectedOptionLabel: { color: '#000', fontWeight: 'bold' },
  submitBtn: { flexDirection: 'row', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 30, elevation: 8 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  tabContainer: { position: 'absolute', bottom: 25, left: 20, right: 20 },
  bottomTabsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 80, borderRadius: 35, backgroundColor: 'white', elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, color: '#718096', marginTop: 4 }
});

export default AssessmentScreen;