import React, { useState } from 'react';
import { View, Button, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useDispatch, useSelector } from 'react-redux';
import { addMatch } from '../store';
import { RootStackParamList } from '../App';

type ScheduleScreenProps = StackScreenProps<RootStackParamList, 'Schedule'>;

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ navigation, route }) => {
  const { selectedDates } = route.params;
  const [eventName, setEventName] = useState('');
  const [participants, setParticipants] = useState('');
  const [timeSlots, setTimeSlots] = useState<{ [key: string]: { from: Date; to: Date } }>({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isDisabled,setIsDisabled]=useState(false)
  const matches = useSelector((state: any) => state.matches);
  const dispatch = useDispatch();

  function checkTimeSlotOverlap(newDate:string, newTimeSlot:any, matches:any) {
    for (const match of matches) {
        if (match.date === newDate) {
            const existingFrom = parseTime(match.from);
            const existingTo = parseTime(match.to);
            const newFrom = parseTime(newTimeSlot.from);
            const newTo = parseTime(newTimeSlot.to);

            if ((newFrom >= existingFrom && newFrom < existingTo) || // New event starts during existing event
                (newTo > existingFrom && newTo <= existingTo) || // New event ends during existing event
                (newFrom <= existingFrom && newTo >= existingTo)) { // New event completely overlaps existing event
                return true; // Overlapping time slots
            }
        }
    }
    return false; // No overlapping time slots
}

function parseTime(timeString:any) {
    const [time, period] = timeString.split(' ');
    const [hours, minutes, seconds] = time.split(':');
    let hours24 = parseInt(hours, 10);
    if (period === 'PM') {
        hours24 += 12;
    }
    return new Date(0, 0, 0, hours24, parseInt(minutes, 10), parseInt(seconds, 10));
}

  const handleAddMatch = () => {
    setIsDisabled(true)
    const newMatches = selectedDates.map((date: any) => ({
      eventName,
      participants: participants.split(',').map((p) => p.trim()),
      date,
      from: timeSlots[date]?.from.toLocaleTimeString(),
      to: timeSlots[date]?.to.toLocaleTimeString(),
    }));

    const overlaps = newMatches.some((newMatch) => {
      return checkTimeSlotOverlap(newMatch.date, { from: newMatch.from, to: newMatch.to }, matches);
  });

  if (overlaps) {
      // Handle overlapping time slots
      console.error('Time slot overlaps with existing events');
  } else {
      // Dispatch action to add matches
      dispatch(addMatch(newMatches));
      navigation.navigate('MatchList');
  }
  };

  const showDatePicker = (date: string) => {
    setSelectedDate(date);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (selectedDateTime: Date) => {
    setTimeSlots((prevSlots) => ({
      ...prevSlots,
      [selectedDate]: {
        from: selectedDateTime,
        to: new Date(selectedDateTime.getTime() + 1 * 60 * 60 * 1000), // Assuming 1-hour duration
      },
    }));
    hideDatePicker();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.label}>Event Name:</Text>
    <TextInput style={styles.input} value={eventName} onChangeText={setEventName} />
    <Text style={styles.label}>Participants:</Text>
    <TextInput style={[styles.input, styles.multiline]} multiline value={participants} onChangeText={setParticipants} />
    {selectedDates.map((date) => (
      <View key={date.toString()} style={styles.dateContainer}>
        <Text style={styles.dateText}>{date.toString()}</Text>
        <View style={styles.buttonContainer}>
  <TouchableOpacity onPress={() => showDatePicker(date.toString())} style={styles.button}>
    <Text style={styles.buttonText}>Time Slot: {timeSlots[date]?.from.toLocaleTimeString()} - {timeSlots[date]?.to.toLocaleTimeString()}</Text>
  </TouchableOpacity>
</View>
      </View>
    ))}
    <DateTimePickerModal
      isVisible={isDatePickerVisible}
      mode="time"
      onConfirm={handleDateConfirm}
      onCancel={hideDatePicker}
    />
    <Button title="Add Match" disabled={isDisabled} onPress={handleAddMatch} />
  </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  multiline: {
    height: 100,
  },
  dateContainer: {
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 5,
  },
  timeSlotText: {
    fontSize: 14,
    color: 'blue',
  },
  buttonContainer: {
    // alignItems: 'center',
  },
  button: {
    borderWidth:1,
    borderColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    // color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default ScheduleScreen;
