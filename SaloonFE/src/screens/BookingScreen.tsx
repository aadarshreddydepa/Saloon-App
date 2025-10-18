import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

export default function BookingScreen() {
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#000000' : '#F5F5F5';
  const textColor = isDark ? '#C0C0C0' : '#000000';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>Bookings Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24 },
});
