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
} from 'lucide-react-native';
import { Header } from '../../src/components/common/Header';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, RADIUS } from '../../src/styles/theme';
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

    const newItem = reportItem({
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

    // Reset and route to Feed
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
          <Text style={styles.cardHeading}>1. Basic Details</Text>

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
          <Text style={styles.cardHeading}>2. Campus Location & Venue</Text>

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
            <Text style={styles.label}>Specific Room / Floor / Area</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2nd Floor Silent Stacks, Desk 42"
              placeholderTextColor={COLORS.textMuted}
              value={room}
              onChangeText={setRoom}
            />
          </View>
        </View>

        {/* Section 3: Visual Image (for Multimodal CLIP Match) */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>3. Visual Photo (Multimodal Embedding)</Text>
          <Text style={styles.subtext}>
            Our AI uses visual CLIP embeddings to match photos of found items to reported lost items.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageSelector}>
            {SAMPLE_IMAGES.map((url, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setImageUrl(url)}
                style={[
                  styles.imageOption,
                  imageUrl === url && styles.imageOptionSelected,
                ]}
              >
                <Image source={{ uri: url }} style={styles.sampleImg} />
                {imageUrl === url && (
                  <View style={styles.selectedOverlay}>
                    <CheckCircle size={18} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Section 4: Crucial Private "Hidden Ownership Detail" */}
        <View style={[styles.card, styles.securityCard]}>
          <View style={styles.securityHeader}>
            <Lock size={18} color={COLORS.primary} />
            <Text style={styles.securityTitle}>4. Hidden Ownership Detail *</Text>
          </View>

          <View style={styles.securityExplainer}>
            <Info size={14} color={COLORS.primary} />
            <Text style={styles.securityExplainerText}>
              <Text style={{ fontWeight: '700' }}>Strictly Confidential:</Text> This field is NEVER visible in public feeds. When a claimant steps forward, they must accurately state this clue before a handover PIN is authorized.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Secret Verification Clue *</Text>
            <TextInput
              style={[styles.input, styles.clueInput]}
              placeholder="e.g. Holographic NASA sticker inside left earcup, cracked volume rocker, initials 'SP' inscribed inside cover..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              value={hiddenClue}
              onChangeText={setHiddenClue}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          <Sparkles size={18} color="#FFF" />
          <Text style={styles.submitBtnText}>
            Publish & Run AI Multimodal Match
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
    paddingBottom: 80,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 12,
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
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
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
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 4,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primaryLight,
  },
  catChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  imageSelector: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  imageOption: {
    marginRight: 10,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  imageOptionSelected: {
    borderColor: COLORS.primary,
  },
  sampleImg: {
    width: 72,
    height: 72,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(79, 70, 229, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityCard: {
    borderColor: COLORS.primaryLight,
    backgroundColor: '#FAF5FF', // soft purple/indigo hue
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  securityExplainer: {
    flexDirection: 'row',
    gap: 6,
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
  clueInput: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.primaryLight,
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

