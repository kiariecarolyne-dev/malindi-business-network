import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BrandHeader from '../../components/BrandHeader';
import TextField from '../../components/TextField';
import PhotoField from '../../components/PhotoField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../utils/firebaseErrors';
import { colors, radius, spacing, typography } from '../../utils/theme';

// Business owner account. After registering (role 'business') the owner
// creates a business profile and subscribes (KSh 100/month) to advertise on
// the Business Stage.
export default function BusinessRegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoSelected, setPhotoSelected] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !businessName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please fill in all the fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      // The auth-state listener resolves the new 'business' role and
      // AppNavigator switches to the Network navigation. From there the
      // owner sets up their business profile, then subscribes (KSh 100/month).
      await register(email.trim(), password, {
        role: 'business',
        fullName: fullName.trim(),
        phone: phone.trim(),
        businessName: businessName.trim(),
      });
    } catch (error) {
      Alert.alert('Registration failed', getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <BrandHeader size="medium" tagline={false} />

          <Text style={styles.title}>Business Owner Account</Text>
          <Text style={styles.subtitle}>
            Register your business on Malindi Business Network. After
            registering you will create your business profile and subscribe
            (KSh 100/month) to advertise.
          </Text>

          <View style={styles.badge}>
            <View style={styles.badgeIcon}>
              <Ionicons name="storefront-outline" size={18} color={colors.accent} />
            </View>
            <View style={styles.badgeBody}>
              <Text style={styles.badgeTitle}>KSh 100 / month</Text>
              <Text style={styles.badgeText}>
                Your business profile + advertising on the Business Stage.
              </Text>
            </View>
          </View>

          <TextField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Mary Njeri"
            autoCapitalize="words"
            icon="person"
          />
          <TextField
            label="Business Name"
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="e.g. Mama Njeri Fresh Farm"
            autoCapitalize="words"
            icon="storefront"
          />
          <TextField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+254 7xx xxx xxx"
            keyboardType="phone-pad"
            icon="call"
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            icon="mail"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
            secureTextEntry
            icon="lock-closed"
          />
          <TextField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            secureTextEntry
            icon="lock-closed"
          />

          <PhotoField
            label="Profile Photo"
            value={photoSelected}
            icon="person-outline"
            onPress={() => {
              setPhotoSelected(true);
              Alert.alert('Photo upload', 'Photo uploads will be available in a later phase.');
            }}
          />

          <PrimaryButton
            title="Register Business"
            onPress={handleRegister}
            disabled={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  badgeIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBody: {
    flex: 1,
    marginLeft: spacing.md,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
  },
  badgeText: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});