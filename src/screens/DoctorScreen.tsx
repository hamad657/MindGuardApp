import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  Image, StatusBar 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons'; 
import MCOIcon from 'react-native-vector-icons/MaterialCommunityIcons'; 

// Theme Context import
import { useTheme } from '../context/ThemeContext';

const DoctorScreen = ({ navigation }: any) => {
  const [selectedCat, setSelectedCat] = useState('2');
  const { theme } = useTheme();

  return (
    <LinearGradient colors={[theme.primary, theme.secondary, theme.background]} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* TOP CARD */}
        <TouchableOpacity activeOpacity={0.9} style={styles.cardWrapper}>
          <LinearGradient colors={[theme.secondary, theme.primary]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.featuredCard}>
            <View style={styles.featTextSide}>
              <Text style={styles.featName}>Dr. Brian Cumin</Text>
              <Text style={styles.featSpec}>Heart Surgeon</Text>
              <View style={styles.timeTag}>
                <Icon name="time-outline" size={14} color="white" />
                <Text style={styles.timeText}>Mar 30, 08:00 am</Text>
              </View>
            </View>
            <Image 
              source={{ uri: 'https://pngimg.com/uploads/doctor/doctor_PNG15988.png' }} 
              style={styles.featImage} 
              resizeMode="contain"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories Section */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {[
            { id: '1', name: 'Psychology', icon: 'brain' },
            { id: '2', name: 'Cardiology', icon: 'heart-pulse' },
            { id: '3', name: 'Roentgen', icon: 'lungs' },
            { id: '4', name: 'Neurology', icon: 'head-cog' },
            { id: '5', name: 'Dentist', icon: 'tooth' },
          ].map((item) => (
            <TouchableOpacity key={item.id} style={styles.catItem} onPress={() => setSelectedCat(item.id)}>
              <View style={[styles.catIconBox, selectedCat === item.id && { backgroundColor: theme.primary }]}>
                <MCOIcon name={item.icon} size={28} color={selectedCat === item.id ? 'white' : '#718096'} />
              </View>
              <Text style={styles.catName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Doctor List */}
        <View style={styles.topDocsHeader}>
          <Text style={styles.sectionTitle}>Top Doctors</Text>
        </View>

        {[
          { id: '1', name: 'Dr. Natalya Undergrowth', spec: 'Mental Specialist', img: 'https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg' },
          { id: '2', name: 'Dr. Fleece Marigold', spec: 'Orthopedics', img: 'https://img.freepik.com/free-photo/beautiful-young-female-doctor-looking-camera-office_23-2147896173.jpg' }
        ].map((doc) => (
          <TouchableOpacity key={doc.id} style={styles.docCard}>
            <Image source={{ uri: doc.img }} style={styles.docImg} />
            <View style={styles.docDetails}>
              <Text style={[styles.docName, {color: theme.primary}]}>{doc.name}</Text>
              <Text style={styles.docSpec}>{doc.spec}</Text>
              <View style={styles.starRow}>
                <Icon name="star" size={14} color="#FBBF24" />
                <Text style={styles.reviewTxt}> 4.9 (120 reviews)</Text>
              </View>
            </View>
            <MCOIcon name="chevron-right" size={24} color="#CBD5E0" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* BOTTOM TABS */}
      <View style={styles.tabContainer}>
        <View style={styles.bottomTabsContainer}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
            <Icon name="home-outline" size={22} color="#718096" />
            <Text style={styles.tabLabel}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem}>
            <Icon name="chatbubble-outline" size={22} color="#718096" />
            <Text style={styles.tabLabel}>Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem}>
            <Icon name="medical" size={24} color={theme.primary} />
            <Text style={[styles.tabLabel, {color: theme.primary, fontWeight: 'bold'}]}>Doctor</Text>
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
  cardWrapper: { marginBottom: 30 },
  featuredCard: { 
    height: 180, 
    borderRadius: 35, 
    padding: 25, 
    flexDirection: 'row', 
    alignItems: 'center', 
    overflow: 'hidden',
    elevation: 8 
  },
  featTextSide: { flex: 1.5, zIndex: 5 },
  featName: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  featSpec: { color: 'white', opacity: 0.9, fontSize: 14, marginTop: 4 },
  timeTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    padding: 8, 
    borderRadius: 12, 
    marginTop: 15, 
    alignSelf: 'flex-start' 
  },
  timeText: { color: 'white', fontSize: 11, marginLeft: 5 },
  featImage: { width: 140, height: 160, position: 'absolute', right: 5, bottom: 0 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  topDocsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 25 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', color: 'white' },
  seeAll: { color: 'white', fontSize: 13, opacity: 0.8 },
  catScroll: { marginBottom: 10 },
  catItem: { alignItems: 'center', marginRight: 20 },
  catIconBox: { width: 70, height: 70, borderRadius: 22, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  catName: { fontSize: 12, color: 'white', marginTop: 8, fontWeight: '500' },
  docCard: { flexDirection: 'row', backgroundColor: 'white', padding: 18, borderRadius: 24, marginBottom: 16, alignItems: 'center', elevation: 4 },
  docImg: { width: 65, height: 65, borderRadius: 18 },
  docDetails: { flex: 1, marginLeft: 16 },
  docName: { fontWeight: 'bold', fontSize: 17 },
  docSpec: { color: '#718096', fontSize: 13 },
  starRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  reviewTxt: { fontSize: 12, color: '#A0AEC0' },
  tabContainer: { position: 'absolute', bottom: 25, left: 20, right: 20 },
  bottomTabsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 80, borderRadius: 35, backgroundColor: 'white', elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, color: '#718096', marginTop: 4 }
});

export default DoctorScreen;