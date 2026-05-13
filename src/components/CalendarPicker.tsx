// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   ScrollView,
//   SafeAreaView,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';

// interface CalendarPickerProps {
//   selectedDate: Date;
//   onDateSelect: (date: Date) => void;
//   minDate: Date; // First assessment date
//   theme: any;
// }

// export const CalendarPicker: React.FC<CalendarPickerProps> = ({
//   selectedDate,
//   onDateSelect,
//   minDate,
//   theme,
// }) => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

//   const getDaysInMonth = (date: Date) => {
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (date: Date) => {
//     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//   };

//   const canSelectDate = (date: Date): boolean => {
//     return date >= minDate && date <= new Date();
//   };

//   const handleDateSelect = (day: number) => {
//     const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
//     if (canSelectDate(selected)) {
//       onDateSelect(selected);
//       setIsVisible(false);
//     }
//   };

//   const handlePrevMonth = () => {
//     const newDate = new Date(currentMonth);
//     newDate.setMonth(newDate.getMonth() - 1);
//     if (newDate >= new Date(minDate.getFullYear(), minDate.getMonth())) {
//       setCurrentMonth(newDate);
//     }
//   };

//   const handleNextMonth = () => {
//     const newDate = new Date(currentMonth);
//     newDate.setMonth(newDate.getMonth() + 1);
//     if (newDate <= new Date()) {
//       setCurrentMonth(newDate);
//     }
//   };

//   const monthName = currentMonth.toLocaleString('default', {
//     month: 'long',
//     year: 'numeric',
//   });

//   const daysInMonth = getDaysInMonth(currentMonth);
//   const firstDay = getFirstDayOfMonth(currentMonth);
//   const days: (number | null)[] = [
//     ...Array(firstDay).fill(null),
//     ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
//   ];

//   const weeks: (number | null)[][] = [];
//   for (let i = 0; i < days.length; i += 7) {
//     weeks.push(days.slice(i, i + 7));
//   }

//   const formattedDate = selectedDate.toLocaleDateString('default', {
//     month: 'short',
//     day: 'numeric',
//     year: 'numeric',
//   });

//   return (
//     <>
//       {/* Calendar Icon Button */}
//       <TouchableOpacity
//         style={[styles.calendarButton, { backgroundColor: theme.primary }]}
//         onPress={() => setIsVisible(true)}
//         activeOpacity={0.8}
//       >
//         <Icon name="calendar" size={20} color="white" />
//       </TouchableOpacity>

//       {/* Calendar Modal */}
//       <Modal
//         visible={isVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setIsVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <SafeAreaView style={styles.modalContent}>
//             <View style={[styles.calendarContainer, { backgroundColor: '#ffffff' }]}>
//               {/* Header */}
//               <View style={styles.header}>
//                 <TouchableOpacity onPress={() => setIsVisible(false)}>
//                   <Icon name="close" size={24} color={theme.primary} />
//                 </TouchableOpacity>
//                 <Text style={[styles.headerTitle, { color: theme.primary }]}>
//                   Select Date
//                 </Text>
//                 <View style={{ width: 24 }} />
//               </View>

//               {/* Current Selection Display */}
//               <View style={[styles.dateDisplay, { borderBottomColor: theme.primary }]}>
//                 <Icon name="calendar-outline" size={16} color={theme.primary} />
//                 <Text style={[styles.dateDisplayText, { color: theme.primary }]}>
//                   {formattedDate}
//                 </Text>
//               </View>

//               {/* Calendar Navigation */}
//               <View style={styles.navigationRow}>
//                 <TouchableOpacity
//                   onPress={handlePrevMonth}
//                   disabled={
//                     currentMonth.getFullYear() === minDate.getFullYear() &&
//                     currentMonth.getMonth() === minDate.getMonth()
//                   }
//                 >
//                   <Icon
//                     name="chevron-back"
//                     size={24}
//                     color={
//                       currentMonth.getFullYear() === minDate.getFullYear() &&
//                       currentMonth.getMonth() === minDate.getMonth()
//                         ? '#CBD5E0'
//                         : theme.primary
//                     }
//                   />
//                 </TouchableOpacity>

//                 <Text style={[styles.monthYear, { color: theme.primary }]}>
//                   {monthName}
//                 </Text>

//                 <TouchableOpacity
//                   onPress={handleNextMonth}
//                   disabled={currentMonth >= new Date()}
//                 >
//                   <Icon
//                     name="chevron-forward"
//                     size={24}
//                     color={currentMonth >= new Date() ? '#CBD5E0' : theme.primary}
//                   />
//                 </TouchableOpacity>
//               </View>

//               {/* Weekday Headers */}
//               <View style={styles.weekdayRow}>
//                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
//                   <Text key={day} style={[styles.weekday, { color: theme.primary }]}>
//                     {day}
//                   </Text>
//                 ))}
//               </View>

//               {/* Calendar Grid */}
//               <ScrollView style={styles.calendarGrid}>
//                 {weeks.map((week, weekIndex) => (
//                   <View key={weekIndex} style={styles.week}>
//                     {week.map((day, dayIndex) => {
//                       if (day === null) {
//                         return <View key={dayIndex} style={styles.emptyDay} />;
//                       }

//                       const dateObj = new Date(
//                         currentMonth.getFullYear(),
//                         currentMonth.getMonth(),
//                         day
//                       );
//                       const isSelectable = canSelectDate(dateObj);
//                       const isSelected =
//                         selectedDate.toDateString() === dateObj.toDateString();
//                       const isToday = new Date().toDateString() === dateObj.toDateString();

//                       return (
//                         <TouchableOpacity
//                           key={dayIndex}
//                           style={[
//                             styles.day,
//                             isSelected && {
//                               backgroundColor: theme.primary,
//                               borderColor: theme.primary,
//                             },
//                             isToday &&
//                               !isSelected && {
//                                 borderColor: theme.secondary,
//                                 borderWidth: 2,
//                               },
//                             !isSelectable && styles.disabledDay,
//                           ]}
//                           onPress={() => handleDateSelect(day)}
//                           disabled={!isSelectable}
//                         >
//                           <Text
//                             style={[
//                               styles.dayText,
//                               isSelected && { color: 'white', fontWeight: 'bold' },
//                               !isSelectable && { color: '#CBD5E0' },
//                             ]}
//                           >
//                             {day}
//                           </Text>
//                         </TouchableOpacity>
//                       );
//                     })}
//                   </View>
//                 ))}
//               </ScrollView>

//               {/* Info Text */}
//               <View style={styles.infoBox}>
//                 <Icon name="information-circle-outline" size={16} color={theme.secondary} />
//                 <Text style={[styles.infoText, { color: theme.secondary }]}>
//                   You can only view assessments from {minDate.toLocaleDateString()} onwards
//                 </Text>
//               </View>

//               {/* Close Button */}
//               <TouchableOpacity
//                 style={[styles.closeButton, { backgroundColor: theme.primary }]}
//                 onPress={() => setIsVisible(false)}
//               >
//                 <Text style={styles.closeButtonText}>Done</Text>
//               </TouchableOpacity>
//             </View>
//           </SafeAreaView>
//         </View>
//       </Modal>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   calendarButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 4,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     width: '100%',
//   },
//   calendarContainer: {
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     paddingBottom: 20,
//     maxHeight: '90%',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EDF2F7',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   dateDisplay: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     gap: 10,
//     borderBottomWidth: 2,
//   },
//   dateDisplayText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   navigationRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//   },
//   monthYear: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   weekdayRow: {
//     flexDirection: 'row',
//     paddingHorizontal: 15,
//     marginBottom: 10,
//   },
//   weekday: {
//     flex: 1,
//     textAlign: 'center',
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   calendarGrid: {
//     paddingHorizontal: 15,
//     maxHeight: 280,
//   },
//   week: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   day: {
//     flex: 1,
//     aspectRatio: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#EDF2F7',
//     margin: 4,
//   },
//   emptyDay: {
//     flex: 1,
//   },
//   dayText: {
//     fontSize: 14,
//     color: '#4A5568',
//     fontWeight: '500',
//   },
//   disabledDay: {
//     opacity: 0.4,
//   },
//   infoBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 20,
//     marginVertical: 15,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: '#F0F8FF',
//     borderRadius: 12,
//     gap: 8,
//   },
//   infoText: {
//     fontSize: 12,
//     flex: 1,
//     fontWeight: '500',
//   },
//   closeButton: {
//     marginHorizontal: 20,
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   closeButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default CalendarPicker;
