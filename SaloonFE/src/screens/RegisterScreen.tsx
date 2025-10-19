
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../services/api';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'customer', // Default: customer
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const isDark = useColorScheme() === 'dark';

  const theme = isDark 
    ? { bg: '#000000', card: '#1A1A1A', text: '#C0C0C0', primary: '#C0C0C0', border: '#333333', inputBg: '#0D0D0D', accent: '#808080' }
    : { bg: '#F5F5F5', card: '#FFFFFF', text: '#000000', primary: '#000000', border: '#E0E0E0', inputBg: '#FAFAFA', accent: '#666666' };

  const userTypes = [
    { value: 'customer', label: 'Customer', icon: 'person' },
    { value: 'owner', label: 'Salon Owner', icon: 'business' },
    { value: 'barber', label: 'Barber', icon: 'cut' },
  ];

  const handleRegister = async () => {
    // Validation
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Error', 'Valid email is required');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      Alert.alert('Error', 'Valid phone number is required (e.g., +919876543210)');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim(),
        user_type: formData.userType,
      });

      Alert.alert(
        'Success!', 
        `Account created successfully as ${userTypes.find(t => t.value === formData.userType)?.label}`,
        [{ text: 'Login Now', onPress: () => navigation.replace('Login' as never) }]
      );
    } catch (error: any) {
      console.error('Registration error:', error.response?.data);
      
      let errorMsg = 'Registration failed. Please try again.';
      if (error.response?.data) {
        const data = error.response.data;
        if (data.username) errorMsg = `Username: ${data.username[0]}`;
        else if (data.email) errorMsg = `Email: ${data.email[0]}`;
        else if (data.phone) errorMsg = `Phone: ${data.phone[0]}`;
        else if (data.password) errorMsg = `Password: ${data.password[0]}`;
      } else if (error.message === 'Network Error') {
        errorMsg = 'Cannot connect to server. Please check your connection.';
      }
      
      Alert.alert('Registration Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.text, opacity: 0.6 }]}>Join us today!</Text>
          </View>

          <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
            {/* User Type Selection */}
            <Text style={[styles.label, { color: theme.text }]}>I am a...</Text>
            <View style={styles.userTypeContainer}>
              {userTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.userTypeButton,
                    { 
                      backgroundColor: formData.userType === type.value ? theme.primary : theme.inputBg,
                      borderColor: formData.userType === type.value ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => setFormData({ ...formData, userType: type.value })}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={24} 
                    color={formData.userType === type.value ? (isDark ? '#000' : '#FFF') : theme.text} 
                  />
                  <Text 
                    style={[
                      styles.userTypeText,
                      { 
                        color: formData.userType === type.value ? (isDark ? '#000' : '#FFF') : theme.text,
                        fontWeight: formData.userType === type.value ? 'bold' : 'normal'
                      }
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Username */}
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="person-outline" size={20} color={theme.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Username"
                placeholderTextColor={theme.text + '70'}
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                autoCapitalize="none"
              />
              <Text style={[styles.required, { color: '#FF6B6B' }]}>*</Text>
            </View>

            {/* Email */}
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="mail-outline" size={20} color={theme.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email Address"
                placeholderTextColor={theme.text + '70'}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={[styles.required, { color: '#FF6B6B' }]}>*</Text>
            </View>

            {/* First and Last Name */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfInput, { backgroundColor: theme.inputBg }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="First Name"
                  placeholderTextColor={theme.text + '70'}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfInput, { backgroundColor: theme.inputBg }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Last Name"
                  placeholderTextColor={theme.text + '70'}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="call-outline" size={20} color={theme.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Phone Number"
                placeholderTextColor={theme.text + '70'}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
              <Text style={[styles.required, { color: '#FF6B6B' }]}>*</Text>
            </View>
            <Text style={[styles.hint, { color: theme.accent }]}>Format: +919876543210</Text>

            {/* Password */}
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.text + '70'}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.required, { color: '#FF6B6B' }]}>*</Text>
            </View>
            <Text style={[styles.hint, { color: theme.accent }]}>Minimum 8 characters</Text>

            {/* Confirm Password */}
            <View style={[styles.inputContainer, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Confirm Password"
                placeholderTextColor={theme.text + '70'}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry={!showPassword}
              />
              <Text style={[styles.required, { color: '#FF6B6B' }]}>*</Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={[styles.registerButtonText, { color: isDark ? '#000' : '#FFF' }]}>
                {loading ? 'Creating Account...' : 'Register'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.text, opacity: 0.6 }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                <Text style={[styles.loginLink, { color: theme.primary, fontWeight: '700' }]}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollView: { flexGrow: 1, padding: 20, paddingTop: 60, paddingBottom: 40 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  header: { alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 36, fontWeight: 'bold', letterSpacing: 0.5 },
  subtitle: { fontSize: 16, marginTop: 8 },
  formContainer: { borderRadius: 30, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 12, marginTop: 5 },
  userTypeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  userTypeButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
  },
  userTypeText: { fontSize: 12, marginTop: 6, textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginTop: 12,
    height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  required: { fontSize: 16, fontWeight: 'bold', marginLeft: 5 },
  hint: { fontSize: 12, marginLeft: 15, marginTop: 4, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { flex: 0.48 },
  registerButton: { borderRadius: 15, paddingVertical: 16, alignItems: 'center', marginTop: 25, marginBottom: 20 },
  registerButtonText: { fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 10 },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14 },
});