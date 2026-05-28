// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Animated, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface MotivationalNotificationProps {
  quote: string;
  author: string;
  onDismiss: () => void;
  autoHideDelay?: number;
}

const MotivationalNotification = ({
  quote,
  author,
  onDismiss,
  autoHideDelay = 8000
}: MotivationalNotificationProps) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in from top
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();

    // Auto hide after delay
    const timer = setTimeout(() => {
      animateOut();
    }, autoHideDelay);

    return () => clearTimeout(timer);
  }, []);

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.content}
        activeOpacity={0.9}
        onPress={animateOut}
      >
        {/* Icon and Header */}
        <View style={styles.header}>
          <Icon name="lightbulb-on" size={24} color="#FF6B6B" />
          <Text style={styles.headerText}>Daily Motivation</Text>
        </View>

        {/* Quote Text */}
        <Text style={styles.quoteText} numberOfLines={3}>
          "{quote}"
        </Text>

        {/* Author */}
        <Text style={styles.authorText}>— {author}</Text>

        {/* Close Button */}
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={animateOut}
        >
          <Icon name="close" size={20} color="#666" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: '500',
  },
  authorText: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});

export default MotivationalNotification;
