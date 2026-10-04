import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Lock,
  Camera,
  MapPin,
  Tag,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Info,
  ShieldCheck,
  Check,
} from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/styles/theme';
import { ItemCategory, ItemType } from '../../src/types/retrivo';

const BUILDINGS = [
  'Main Library',
  'Student Union',
  'Student Recreation Center',
  'Science Complex B',
  'Engineering Hall',
  'Dining Commons',
  'Mathematics Hall',
  'Business School',
  'Campus Quad Green',
];

const CATEGORIES: { label: string; value: ItemCategory }[] = [
  { label: 'Electronics', value: 'electronics' },
  { label: 'Student ID / Cards', value: 'identification' },
  { label: 'Keys', value: 'keys' },
  { label: 'Wallets & Bags', value: 'wallets_bags' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Books & Stationery', value: 'stationery_books' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Other', value: 'other' },
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80', // AirPods
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', // Book / Planner
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', // Backpack
  'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80', // Wallet
  'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80', // Bottle
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', // Headphones
];

export default function ReportScreen() {
  const router = useRouter();
  const { reportItem } = useApp();

  const [type, setType] = useState<ItemType>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('electronics');
  const [building, setBuilding] = useState(BUILDINGS[0]);
  const [room, setRoom] = useState('');
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGES[0]);
  const [hiddenClue, setHiddenClue] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      const msg = 'Please enter an item title.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Missing Field', msg);
      return;
    }

    if (!hiddenClue.trim()) {
      const msg = 'Please provide a Hidden Ownership Detail. This ensures only the true owner can claim this item.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Crucial Security Field', msg);
      return;
    }

    reportItem({
      type,
      title: title.trim(),
      description: description.trim() || 'No additional description provided.',
      category,
      campus_location: {
        building,
        floor_or_room: room.trim() || undefined,
      },
      timestamp: new Date().toISOString(),
      image_url: imageUrl,
      hidden_clue: hiddenClue.trim(),
    });

    const msg = `${type === 'lost' ? 'Lost' : 'Found'} item reported! RETRIVO multimodal AI is now analyzing potential matches.`;
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert('Report Registered', msg);

    setTitle('');
    setDescription('');
    setHiddenClue('');
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="REPORT ASSET" subtitle="Zero-Trust Verification Protocol" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Lost vs Found */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.typeTab,
              type === 'lost' && styles.typeTabLostActive,
            ]}
            onPress={() => setType('lost')}
          >
            <Text
              style={[
                styles.typeTabText,
                type === 'lost' && styles.typeTabTextActive,
              ]}
            >
              I LOST AN ITEM
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.typeTab,
              type === 'found' && styles.typeTabFoundActive,
            ]}
            onPress={() => setType('found')}
          >
            <Text
              style={[
                styles.typeTabText,
                type === 'found' && styles.typeTabTextActive,
              ]}
            >
              I FOUND AN ITEM
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Item Details */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <Text style={styles.cardHeading}>Basic Item Details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Space Gray MacBook Air, Blue Hydro Flask..."
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Public Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe general visual appearance (do NOT mention hidden clue here)..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  activeOpacity={0.8}
                  style={[
                    styles.catChip,
                    category === cat.value && styles.catChipActive,
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      category === cat.value && styles.catChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Section 2: Campus Location */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <Text style={styles.cardHeading}>Campus Venue & Area</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Building</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {BUILDINGS.map((b) => (
                <TouchableOpacity
                  key={b}
                  activeOpacity={0.8}
                  style={[
                    styles.catChip,
                    building === b && styles.catChipActive,
                  ]}
                  onPress={() => setBuilding(b)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      building === b && styles.catChipTextActive,
                    ]}
                  >
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Specific Room / Floor / Spot</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2nd Floor Silent Stacks, Desk 42"
              placeholderTextColor={COLORS.textMuted}
              value={room}
              onChangeText={setRoom}
            />
          </View>
        </View>

        {/* Section 3: Visual Photo */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>3</Text>
            </View>
            <Text style={styles.cardHeading}>Visual Photo (CLIP Multimodal Match)</Text>
          </View>
          <Text style={styles.subtext}>
            Our AI uses visual feature vectors to match photos of found items to reported lost items.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageSelector}>
            {SAMPLE_IMAGES.map((url, i) => {
              const isSelected = imageUrl === url;
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.85}
                  onPress={() => setImageUrl(url)}
                  style={[
                    styles.imageOption,
                    isSelected && styles.imageOptionSelected,
                  ]}
                >
                  <Image source={{ uri: url }} style={styles.sampleImg} />
                  {isSelected && (
                    <View style={styles.selectedOverlay}>
                      <Check size={18} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section 4: Confidential Hidden Ownership Detail */}
        <View style={[styles.card, styles.securityCard]}>
          <View style={styles.securityHeader}>
            <View style={styles.securityIconCircle}>
              <Lock size={16} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>4. Hidden Ownership Detail *</Text>
              <Text style={styles.securityBadge}>CONFIDENTIAL RECOVERY VAULT</Text>
            </View>
          </View>

          <View style={styles.securityExplainer}>
            <Info size={15} color={COLORS.primary} />
            <Text style={styles.securityExplainerText}>
              <Text style={{ fontWeight: '800' }}>Strictly Private:</Text> This secret detail is NEVER shown in public feeds. When another student claims this item, they must state this exact clue before physical handover is unlocked.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.clueLabel}>Private Verification Clue *</Text>
            <TextInput
              style={[styles.input, styles.clueInput]}
              placeholder="e.g. Holographic NASA sticker inside left earcup, small scratch near charging port, dog wallpaper on lock screen..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              value={hiddenClue}
              onChangeText={setHiddenClue}
            />
          </View>
        </View>

        {/* Submit Action Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.88}
          onPress={handleSubmit}
        >
          <Sparkles size={18} color="#FFF" />
          <Text style={styles.submitBtnText}>
            Publish & Compute Multimodal Match
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  typeTabLostActive: {
    backgroundColor: COLORS.lost,
  },
  typeTabFoundActive: {
    backgroundColor: COLORS.found,
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  typeTabTextActive: {
    color: '#FFF',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 4,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primaryBorder,
  },
  catChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  imageSelector: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  imageOption: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
  },
  imageOptionSelected: {
    borderColor: COLORS.primary,
  },
  sampleImg: {
    width: 76,
    height: 76,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(79, 70, 229, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityCard: {
    borderColor: COLORS.primaryBorder,
    backgroundColor: '#FAF5FF',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  securityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
  },
  securityBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  securityExplainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.card,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  securityExplainerText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  clueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 5,
  },
  clueInput: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.primaryBorder,
    height: 82,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.xs,
    ...SHADOWS.lg,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});

