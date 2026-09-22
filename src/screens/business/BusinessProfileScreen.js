import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import PhotoField from '../../components/PhotoField';
import { useAuth } from '../../context/AuthContext';
import {
  createBusiness,
  getBusiness,
  updateBusiness,
} from '../../services/businessService';
import {
  BUSINESS_CATEGORIES,
  DEFAULT_BUSINESS_CATEGORY,
} from '../../utils/businessCategories';
import { colors, radius, spacing, typography } from '../../utils/theme';

// Create or edit the owner's business profile (businesses/<ownerUid>).
// Every registered business owner needs a profile before they can post
// advertisements, so this screen doubles as the post-registration setup step.
export default function BusinessProfileScreen({ navigation }) {
  const { currentUser, userProfile, isBusiness } = useAuth();

  const [existingId, setExistingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState(userProfile?.fullName || '');
  const [category, setCategory] = useState(DEFAULT_BUSINESS_CATEGORY);
  const [description, setDescription] = useState('');
  const [productsServicesText, setProductsServicesText] = useState('');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;
    getBusiness(currentUser.uid)
      .then((data) => {
        if (data) {
          setExistingId(data.businessId);
          setBusinessName(data.businessName || '');
          setOwnerName(data.ownerName || userProfile?.fullName || '');
          setCategory(data.category || DEFAULT_BUSINESS_CATEGORY);
          setDescription(data.description || '');
          setProductsServicesText(
            Array.isArray(data.productsServices) ? data.productsServices.join(', ') : ''
          );
          setPhone(data.phone || userProfile?.phone || '');
          setWhatsapp(data.whatsapp || '');
          setLocation(data.location || '');
          setEmail(data.email || '');
          setBusinessHours(data.businessHours || '');
        }
      })
      .finally(() => setLoading(false));
  }, [currentUser?.uid, userProfile?.fullName, userProfile?.phone]);

  if (!isBusiness) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={36} color={colors.textMuted} />
        <Text style={styles.centerTitle}>Business accounts only</Text>
        <Text style={styles.centerText}>
          Business profiles are created by registered business owners.
        </Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    if (!businessName.trim()) {
      Alert.alert('Missing business name', 'Please enter your business name.');
      return;
    }

    const productsServices = productsServicesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      if (existingId) {
        await updateBusiness(existingId, {
          ownerName: ownerName.trim(),
          businessName: businessName.trim(),
          category,
          description: description.trim(),
          productsServices,
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          location: location.trim(),
          email: email.trim(),
          businessHours: businessHours.trim(),
        });
        Alert.alert('Saved', 'Your business profile has been updated.');
      } else {
        await createBusiness({
          ownerUid: currentUser.uid,
          ownerName: ownerName.trim(),
          businessName: businessName.trim(),
          category,
          description: description.trim(),
          productsServices,
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          location: location.trim(),
          email: email.trim(),
          businessHours: businessHours.trim(),
        });
        Alert.alert(
          'Business profile created',
          'Now subscribe to start advertising on the Business Stage.',
          [
            {
              text: 'Subscribe Now',
              onPress: () => navigation.navigate('BusinessSubscription'),
            },
            { text: 'Later', style: 'cancel' },
          ]
        );
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Save failed', error?.message || 'Could not save your business profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>Loading your business…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.formLabel}>Business Name</Text>
        <TextField
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="e.g. Mama Karisa Seafood"
          autoCapitalize="words"
          icon="storefront-outline"
        />

        <Text style={styles.formLabel}>Owner Name</Text>
        <TextField
          value={ownerName}
          onChangeText={setOwnerName}
          placeholder="Your full name"
          autoCapitalize="words"
          icon="person-outline"
        />

        <Text style={styles.formLabel}>Category</Text>
        <View style={styles.categoryWrap}>
          {BUSINESS_CATEGORIES.map((item) => {
            const selected = item === category;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
              >
                <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.formLabel}>About the Business</Text>
        <TextInput
          style={styles.multiline}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what your business does and who you serve…"
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.formLabel}>Products / Services</Text>
        <TextInput
          style={styles.multilineShort}
          value={productsServicesText}
          onChangeText={setProductsServicesText}
          placeholder="e.g. Fresh fish, Prawns, Catering (separate with commas)"
          placeholderTextColor={colors.placeholder}
        />

        <Text style={styles.formLabel}>Phone Number</Text>
        <TextField
          value={phone}
          onChangeText={setPhone}
          placeholder="+254 7xx xxx xxx"
          keyboardType="phone-pad"
          icon="call-outline"
        />

        <Text style={styles.formLabel}>WhatsApp Number</Text>
        <TextField
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="+254 7xx xxx xxx"
          keyboardType="phone-pad"
          icon="logo-whatsapp"
        />

        <Text style={styles.formLabel}>Location</Text>
        <TextField
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Malindi Town, Lamu Road"
          icon="location-outline"
        />

        <Text style={styles.formLabel}>Email (optional)</Text>
        <TextField
          value={email}
          onChangeText={setEmail}
          placeholder="contact@business.co.ke"
          keyboardType="email-address"
          icon="mail-outline"
        />

        <Text style={styles.formLabel}>Business Hours (optional)</Text>
        <TextField
          value={businessHours}
          onChangeText={setBusinessHours}
          placeholder="e.g. Mon–Sat, 8:00 AM – 6:00 PM"
          icon="time-outline"
        />

        <PhotoField
          label="Business Logo"
          value={false}
          icon="image-outline"
          onPress={() =>
            Alert.alert('Image upload', 'Logo uploads will be available in a later phase.')
          }
        />

        <PrimaryButton
          title={saving ? 'Saving…' : existingId ? 'Save Changes' : 'Create Business Profile'}
          disabled={saving}
          icon={saving ? undefined : 'checkmark-outline'}
          style={styles.saveButton}
          onPress={handleSave}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  centerTitle: {
    ...typography.subtitle,
    fontSize: 18,
    marginTop: spacing.md,
  },
  centerText: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300,
    lineHeight: 20,
  },
  formLabel: {
    ...typography.caption,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextSelected: {
    color: colors.white,
  },
  multiline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
    minHeight: 90,
  },
  multilineShort: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});