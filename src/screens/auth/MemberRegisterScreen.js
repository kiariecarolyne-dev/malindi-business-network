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

// Free membership: browse the Business Stage, Discover businesses, view
// profiles and contact businesses by Call and WhatsApp.
export default function MemberRegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoSelected, setPhotoSelected] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please fill in all the fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      // The auth-state listener resolves the new 'member' role and
      // AppNavigator switches to the Network navigation.
      await register(email.trim(), password, {
        role: 'member',
        fullName: fullName.trim(),
        phone: phone.trim(),
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

          <Text style={styles.title}>Join the Network</Text>
          <Text style={styles.subtitle}>
            Free membership. Discover Malindi businesses, browse the Business
            Stage and contact them directly.
          </Text>

          <View style={styles.badge}>
            <Ionicons name="compass-outline" size={18} color={colors.primary} />
            <Text style={styles.badgeText}>
              Free membership — no subscription required.
            </Text>
          </View>

          <TextField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Jane Wambui"
            autoCapitalize="words"
            icon="person"
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
            title="Create Free Account"
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
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  badgeText: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontWeight: '600',
    marginLeft: spacing.sm,
    flex: 1,
  },
});