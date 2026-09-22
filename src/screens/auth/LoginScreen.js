import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandHeader from '../../components/BrandHeader';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../utils/firebaseErrors';
import { colors, radius, shadow, spacing, typography } from '../../utils/theme';

// Existing network members sign in here. The screen shares the Malindi
// Business Network visual identity (navy / electric blue) with the Welcome
// screen and keeps the same auth behaviour (login + password reset).
export default function LoginScreen({ navigation }) {
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      // The auth-state listener resolves the user's role and AppNavigator
      // switches to the correct role navigator.
      await login(email, password);
    } catch (error) {
      Alert.alert('Login failed', getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email to receive a reset link.');
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert(
        'Check your email',
        'A password reset link has been sent. Follow it to reset your password.'
      );
    } catch (error) {
      Alert.alert('Reset failed', getAuthErrorMessage(error));
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
          <View style={styles.header}>
            <BrandHeader size="medium" tagline={false} />
          </View>

          <Text style={styles.welcome}>Welcome Back</Text>
          <Text style={styles.hint}>
            Sign in to continue building your network on Malindi Business
            Network.
          </Text>

          <View style={styles.formCard}>
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
              placeholder="Enter your password"
              secureTextEntry
              icon="lock-closed"
            />

            <PrimaryButton
              title="Log In"
              onPress={handleLogin}
              disabled={submitting}
            />

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotWrap}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to Malindi Business Network?</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('RegisterRole')}>
              <Text style={styles.footerLink}>Join the Network</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
  },
  welcome: {
    ...typography.title,
    fontSize: 28,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  hint: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
    alignSelf: 'center',
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadow,
  },
  forgotWrap: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  forgot: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
});