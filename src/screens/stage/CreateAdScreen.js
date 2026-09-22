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
import { onMyBusiness } from '../../services/businessService';
import { AD_TYPES } from '../../utils/adTypes';
import {
  createAdvertisement,
  getAdvertisement,
  updateAdvertisement,
} from '../../services/advertisementService';
import { businessCanAdvertise } from '../../utils/testMode';
import { colors, radius, spacing, typography } from '../../utils/theme';

// Post (or edit) an advertisement on the Business Stage. Guards in order:
//   1. only business accounts may post;
//   2. the business profile must exist (businessId == ownerUid);
//   3. an active KSh 100/month membership is required to create ads.
export default function CreateAdScreen({ route, navigation }) {
  const { currentUser, userProfile, isBusiness } = useAuth();
  const { adId } = route.params || {};

  const editMode = !!adId;

  const [business, setBusiness] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [type, setType] = useState(AD_TYPES[0].key);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);

  const canAdvertise = businessCanAdvertise(userProfile);

  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    return onMyBusiness(currentUser.uid, (data) => {
      setBusiness(data);
      setProfileLoaded(true);
    });
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!editMode || !adId) return undefined;
    getAdvertisement(adId).then((data) => {
      if (!data) {
        Alert.alert('Not found', 'This advertisement no longer exists.');
        navigation.goBack();
        return;
      }
      setType(data.type || AD_TYPES[0].key);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setLocation(data.location || '');
      setPhone(data.phone || '');
      setWhatsapp(data.whatsapp || '');
    });
  }, [editMode, adId, navigation]);

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please add a short title for your advertisement.');
      return;
    }

    setSaving(true);
    try {
      if (editMode) {
        await updateAdvertisement(adId, {
          type,
          title,
          description,
          location,
          phone,
          whatsapp,
        });
        Alert.alert('Saved', 'Your advertisement has been updated.');
      } else {
        await createAdvertisement({
          ownerUid: currentUser.uid,
          businessId: currentUser.uid,
          type,
          title,
          description,
          category: business?.category || '',
          location,
          phone,
          whatsapp,
          status: 'active',
        });
        Alert.alert('Published', 'Your advertisement is now live on the Business Stage.');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Save failed', error?.message || 'Could not save your advertisement.');
    } finally {
      setSaving(false);
    }
  };

  if (!isBusiness) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={36} color={colors.textMuted} />
        <Text style={styles.centerTitle}>Business accounts only</Text>
        <Text style={styles.centerText}>
          Only registered business owners can post advertisements on the
          Business Stage.
        </Text>
      </View>
    );
  }

  if (!profileLoaded) {
    return (
      <View style={styles.center}>
        <Ionicons name="hourglass-outline" size={30} color={colors.textMuted} />
        <Text style={styles.centerText}>Checking your business…</Text>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.center}>
        <Ionicons name="storefront-outline" size={36} color={colors.textMuted} />
        <Text style={styles.centerTitle}>Set up your business profile first</Text>
        <Text style={styles.centerText}>
          Before advertising, add your business details so customers know who
          is posting.
        </Text>
        <PrimaryButton
          title="Set Up Business Profile"
          icon="storefront-outline"
          onPress={() => navigation.navigate('EditBusiness')}
          style={styles.centerButton}
        />
      </View>
    );
  }

  if (!canAdvertise) {
    return (
      <View style={styles.center}>
        <Ionicons name="card-outline" size={36} color={colors.textMuted} />
        <Text style={styles.centerTitle}>Membership required</Text>
        <Text style={styles.centerText}>
          You need an active KSh 100/month membership to post advertisements.
        </Text>
        <PrimaryButton
          title="Subscribe Now"
          icon="card-outline"
          onPress={() => navigation.navigate('BusinessSubscription')}
          style={styles.centerButton}
        />
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
        <Text style={styles.sectionLabel}>Advertisement Type</Text>
        <View style={styles.typeGrid}>
          {AD_TYPES.map((item) => {
            const selected = item.key === type;
            return (
              <Pressable
                key={item.key}
                onPress={() => setType(item.key)}
                style={[styles.typeChip, selected && styles.typeChipSelected]}
              >
                <Text style={styles.typeChipEmoji}>{item.emoji}</Text>
                <Text style={[styles.typeChipLabel, selected && styles.typeChipLabelSelected]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>
          Pick the type that best matches what your post is about. The type is
          shown as a badge on your advertisement.
        </Text>

        <Text style={styles.formLabel}>Title</Text>
        <TextField
          value={title}
          onChangeText={setTitle}
          placeholder={editMode ? 'Edit your title' : 'e.g. Fresh Tuna at Mama Karisa Seafood'}
          icon="megaphone-outline"
        />

        <Text style={styles.formLabel}>Description</Text>
        <TextInput
          style={styles.multiline}
          value={description}
          onChangeText={setDescription}
          placeholder="What should people know? Who is it for, when is it available…"
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <Text style={styles.formLabel}>Location</Text>
        <TextField
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Malindi Town, Lamu Road"
          icon="location-outline"
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
          placeholder="+254 7xx xxx xxx (optional)"
          keyboardType="phone-pad"
          icon="logo-whatsapp"
        />

        <PhotoField
          label="Advertisement Image"
          value={false}
          icon="image-outline"
          onPress={() =>
            Alert.alert('Image upload', 'Image uploads will be available in a later phase.')
          }
        />

        <PrimaryButton
          title={saving ? 'Saving…' : editMode ? 'Save Changes' : 'Publish Advertisement'}
          onPress={handleSave}
          disabled={saving}
          icon={saving ? undefined : editMode ? 'checkmark-outline' : 'send-outline'}
          style={styles.saveButton}
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
  centerButton: {
    marginTop: spacing.lg,
    minWidth: 220,
  },
  sectionLabel: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: spacing.xs,
  },
  typeChipSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  typeChipEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  typeChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeChipLabelSelected: {
    color: colors.white,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  formLabel: {
    ...typography.caption,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
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
    minHeight: 110,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});