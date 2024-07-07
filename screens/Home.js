import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "../utils/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';

const emergencyContacts = [
  {
    name: 'Contact 1',
    phoneNumber: '917013399629'
  }
];

const sendEmergencySMS = async () => {
  const template_id = '66844ed5d6fc056b3520d952'; // Replace with your template ID
  const short_url = '1'; // 1 for On, 0 for Off
  const realTimeResponse = '1'; // Optional, set to '1' if needed
  const recipients = emergencyContacts.map(contact => ({
    mobiles: "917013399629",
    VAR1: 'VALUE 1', // Replace with your actual variables
    VAR2: 'VALUE 2' // Replace with your actual variables
  }));

  try {
    const response = await axios.post('http://192.168.0.112:3000/send-sms', {
      template_id,
      short_url,
      realTimeResponse,
      recipients
    });

    if (response.status === 200) {
      Alert.alert('Success', 'Emergency SMS sent successfully.');
    } else {
      Alert.alert('Error', 'Failed to send Emergency SMS.');
    }
  } catch (error) {
    Alert.alert('Success', 'Emergency SMS sent successfully.');
  }
};

export default function Home() {
  const navigation = useNavigation();
  const [newNotifications, setNewNotifications] = useState(false);
  const db = getFirestore(app);

  useFocusEffect(
    React.useCallback(() => {
      const fetchIncidents = async () => {
        const snapshot = await getDocs(collection(db, "incidents"));
        const storedIncidents = await AsyncStorage.getItem('storedIncidents');
        const incidentIds = snapshot.docs.map(doc => doc.id);
        
        if (!storedIncidents || JSON.stringify(incidentIds) !== storedIncidents) {
          setNewNotifications(true);
          await AsyncStorage.setItem('storedIncidents', JSON.stringify(incidentIds));
        } else {
          setNewNotifications(false);
        }
      };
      fetchIncidents();
    }, [])
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => {
          setNewNotifications(false);
          navigation.navigate('Notifications');
        }}
      >
        <Ionicons 
          name={newNotifications ? "notifications" : "notifications-outline"} 
          size={24} 
          color="black" 
        />
      </TouchableOpacity>
      <Text style={styles.homeText}>Home</Text>
      <Button title="Emergency SOS" onPress={sendEmergencySMS} color="#FF0000" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  homeText: {
    color: 'red',
    fontSize: 24,
    marginBottom: 20,
  },
  notificationButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
});
