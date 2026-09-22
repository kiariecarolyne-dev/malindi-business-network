import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../utils/theme';
import { resolveWhatsapp, telLink } from '../utils/contactUtils';

// Renders the Call / WhatsApp action buttons used everywhere a business can be
// contacted (Business Stage feed, ad detail, Discover, business profile).
// Never exposes a raw dialled link that could leak to the UI - only opens
// standard tel: / https://wa.me deep links. Returns null when no contact is
// available so screens do not need their own guards.
export default function ContactActions({ phone, whatsapp, compact = false }) {
  const tel = telLink(phone);
  const wa = resolveWhatsapp(whatsapp, phone);

  if (!tel && !wa) return null;

  const open = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn('[contact] Could not open link', { url, message: error?.message });
    }
  };

  // Keep the more useful WhatsApp number when only one contact exists, so
  // duplicate buttons are never shown.
  const waShown = wa && (!tel || wa.url !== tel.url);
  const waOnly = wa && !tel;

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {waShown || waOnly ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button, styles.whatsapp]}
          onPress={() => open(wa.url)}
        >
          <Ionicons name="logo-whatsapp" size={16} color={colors.white} />
          <Text style={styles.buttonText}>WhatsApp</Text>
        </TouchableOpacity>
      ) : null}
      {tel ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button, styles.call]}
          onPress={() => open(tel.url)}
        >
          <Ionicons name="call-outline" size={16} color={colors.white} />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  rowCompact: {
    marginTop: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    flex: 1,
  },
  whatsapp: {
    backgroundColor: '#25D366',
  },
  call: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
});