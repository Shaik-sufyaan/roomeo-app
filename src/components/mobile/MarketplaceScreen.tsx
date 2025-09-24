// components/mobile/MarketplaceScreen.tsx - Mobile-native marketplace screen
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import type { User } from '../../types/user';
import type { Listing, ListingFilters, ListingSortOptions } from '../../types/listing';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { getListings, createListing } from '../../services/marketplace';

const { width } = Dimensions.get('window');

interface MarketplaceScreenProps {
  user: User;
  onRefresh: () => void;
  refreshing: boolean;
  onStartChat?: (sellerId: string, listingId: string) => void;
}

// Remove local interfaces since we're importing from types

// Mock data
const mockListings: Listing[] = [
  {
    id: '1',
    title: 'IKEA Study Desk',
    price: 75,
    description: 'Great condition study desk, perfect for students. Includes drawer and cable management.',
    imageUrl: 'https://via.placeholder.com/300x200/44C76F/004D40?text=IKEA+Desk',
    location: 'Downtown',
    category: 'furniture',
    condition: 'good',
    sellerId: 'seller1',
    sellerName: 'Emma Wilson',
    sellerImage: 'https://via.placeholder.com/50x50/44C76F/004D40?text=EW',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: '2',
    title: 'Mini Fridge - Almost New',
    price: 120,
    description: 'Barely used mini fridge, perfect for dorm rooms. Energy efficient and quiet.',
    imageUrl: 'https://via.placeholder.com/300x200/44C76F/004D40?text=Mini+Fridge',
    location: 'Campus Area',
    category: 'appliances',
    condition: 'excellent',
    sellerId: 'seller2',
    sellerName: 'Jake Martinez',
    sellerImage: 'https://via.placeholder.com/50x50/44C76F/004D40?text=JM',
    status: 'active',
    createdAt: new Date('2025-01-14'),
    updatedAt: new Date('2025-01-14'),
  },
  {
    id: '3',
    title: 'Textbook Bundle - Economics',
    price: 45,
    description: 'Set of 3 economics textbooks for intro courses. No highlighting, great condition.',
    imageUrl: 'https://via.placeholder.com/300x200/44C76F/004D40?text=Books',
    location: 'University District',
    category: 'books',
    condition: 'good',
    sellerId: 'seller3',
    sellerName: 'Sarah Chen',
    sellerImage: 'https://via.placeholder.com/50x50/44C76F/004D40?text=SC',
    status: 'active',
    createdAt: new Date('2025-01-13'),
    updatedAt: new Date('2025-01-13'),
  },
  {
    id: '4',
    title: 'Gaming Chair',
    price: 200,
    description: 'Comfortable gaming chair with lumbar support. Perfect for long study sessions.',
    imageUrl: 'https://via.placeholder.com/300x200/44C76F/004D40?text=Gaming+Chair',
    location: 'Midtown',
    category: 'furniture',
    condition: 'excellent',
    sellerId: 'seller4',
    sellerName: 'Alex Kim',
    sellerImage: 'https://via.placeholder.com/50x50/44C76F/004D40?text=AK',
    status: 'active',
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-12'),
  },
];

const categories = [
  { id: 'all', name: 'All', emoji: '🛍️' },
  { id: 'furniture', name: 'Furniture', emoji: '🪑' },
  { id: 'appliances', name: 'Appliances', emoji: '📱' },
  { id: 'books', name: 'Books', emoji: '📚' },
  { id: 'electronics', name: 'Electronics', emoji: '💻' },
  { id: 'clothing', name: 'Clothing', emoji: '👕' },
  { id: 'other', name: 'Other', emoji: '📦' },
];

const conditions = [
  { id: 'excellent', name: 'Excellent', emoji: '✨' },
  { id: 'good', name: 'Good', emoji: '👍' },
  { id: 'fair', name: 'Fair', emoji: '👌' },
  { id: 'poor', name: 'Poor', emoji: '👎' },
];

export const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({
  user,
  onRefresh,
  refreshing,
  onStartChat,
}) => {
  const [currentView, setCurrentView] = useState<'marketplace' | 'add-listing'>('marketplace');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load listings from Supabase
  const loadListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filters for Supabase
      const supabaseFilters: ListingFilters = {
        ...filters,
        search: searchQuery.trim() || undefined,
      };

      // Prepare sort options
      const sortOptions: ListingSortOptions = {
        field: 'created_at',
        direction: 'desc'
      };

      console.log('🔄 Loading listings from Supabase with filters:', supabaseFilters);
      const data = await getListings(supabaseFilters, sortOptions);

      // Apply category filter locally since it's not in the main filter
      let filteredData = data;
      if (selectedCategory !== 'all') {
        // For now, map categories to listing properties or use description/title search
        filteredData = data.filter(listing => {
          const titleLower = listing.title.toLowerCase();
          const descLower = listing.description.toLowerCase();

          switch (selectedCategory) {
            case 'furniture':
              return titleLower.includes('chair') || titleLower.includes('desk') || titleLower.includes('table') || titleLower.includes('furniture');
            case 'appliances':
              return titleLower.includes('fridge') || titleLower.includes('microwave') || titleLower.includes('washer') || descLower.includes('appliance');
            case 'books':
              return titleLower.includes('book') || titleLower.includes('textbook') || descLower.includes('book');
            case 'electronics':
              return titleLower.includes('phone') || titleLower.includes('laptop') || titleLower.includes('computer') || descLower.includes('electronic');
            case 'clothing':
              return titleLower.includes('shirt') || titleLower.includes('jacket') || titleLower.includes('clothes') || descLower.includes('clothing');
            default:
              return true;
          }
        });
      }

      setListings(filteredData);
      console.log('✅ Loaded listings:', filteredData.length);
    } catch (error) {
      console.error('❌ Error loading listings:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setError('Failed to load listings. Please try again.');
      // Show empty array instead of mock data
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, filters]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleRefresh = async () => {
    await loadListings();
    onRefresh();
  };

  const handleChatWithSeller = async (sellerId: string, listingId: string) => {
    if (user.id === sellerId) {
      Alert.alert('Info', 'You cannot chat with yourself!');
      return;
    }

    if (onStartChat) {
      onStartChat(sellerId, listingId);
    } else {
      Alert.alert(
        'Contact Seller',
        'Would you like to start a conversation with the seller?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start Chat', onPress: () => console.log(`Starting chat for listing ${listingId}`) },
        ]
      );
    }
  };

  const renderListingCard = ({ item }: { item: Listing }) => (
    <TouchableOpacity style={styles.listingCard} activeOpacity={0.7}>
      <Image
        source={{
          uri: item.images && item.images.length > 0
            ? item.images[0]
            : 'https://via.placeholder.com/300x200/44C76F/004D40?text=' + encodeURIComponent(item.title.substring(0, 10))
        }}
        style={styles.listingImage}
      />

      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.listingPrice}>${item.price}</Text>
        </View>

        <Text style={styles.listingDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.listingMeta}>
          <View style={styles.listingLocation}>
            <Text style={styles.locationText}>📍 {item.location}</Text>
          </View>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>
              ✨ {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.sellerInfo}>
          <Image
            source={{
              uri: item.seller?.profilePicture ||
                   `https://via.placeholder.com/50x50/44C76F/004D40?text=${item.seller?.name?.charAt(0) || 'U'}`
            }}
            style={styles.sellerImage}
          />
          <Text style={styles.sellerName}>{item.seller?.name || 'Unknown Seller'}</Text>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => handleChatWithSeller(item.created_by, item.id)}
          >
            <Text style={styles.chatButtonText}>💬 Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item.id && styles.categoryButtonTextActive
      ]}>
        {item.emoji} {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Show Add Listing page
  if (currentView === 'add-listing') {
    return (
      <AddListingForm
        user={user}
        onSuccess={() => {
          setCurrentView('marketplace');
          loadListings();
        }}
        onCancel={() => setCurrentView('marketplace')}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛍️ Marketplace</Text>
          <Text style={styles.headerSubtitle}>
            Buy and sell furniture for your new place
          </Text>
          {listings.length > 0 && (
            <Text style={styles.itemCount}>
              {listings.length} item{listings.length !== 1 ? 's' : ''} available
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setCurrentView('add-listing')}
        >
          <Text style={styles.addButtonText}>+ Sell</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for items..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>🔧 Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryFilter}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.priceInputs}>
                  <View style={styles.priceInput}>
                    <Text style={styles.priceLabel}>Min: $</Text>
                    <TextInput
                      style={styles.priceTextInput}
                      placeholder="0"
                      keyboardType="numeric"
                      value={filters.minPrice?.toString() || ''}
                      onChangeText={(text) => setFilters(prev => ({
                        ...prev,
                        minPrice: text ? Number(text) : undefined
                      }))}
                    />
                  </View>
                  <View style={styles.priceInput}>
                    <Text style={styles.priceLabel}>Max: $</Text>
                    <TextInput
                      style={styles.priceTextInput}
                      placeholder="1000"
                      keyboardType="numeric"
                      value={filters.maxPrice?.toString() || ''}
                      onChangeText={(text) => setFilters(prev => ({
                        ...prev,
                        maxPrice: text ? Number(text) : undefined
                      }))}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Location</Text>
                <TextInput
                  style={styles.locationInput}
                  placeholder="Enter location..."
                  value={filters.location || ''}
                  onChangeText={(text) => setFilters(prev => ({
                    ...prev,
                    location: text || undefined
                  }))}
                />
              </View>
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setFilters({});
                  setSelectedCategory('all');
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyFiltersText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading marketplace...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Oops!</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>TRY AGAIN</Text>
          </TouchableOpacity>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>🛍️ No items found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery || Object.keys(filters).length > 0 || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Be the first to add a listing!'}
          </Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => setCurrentView('add-listing')}
          >
            <Text style={styles.addFirstButtonText}>+ Add First Listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.listRow}
        />
      )}
    </View>
  );
};

// Add Listing Form Component
const AddListingForm: React.FC<{
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ user, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: 'furniture',
    condition: 'good',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Creating new listing:', formData);

      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        location: formData.location.trim(),
        images: [], // Add image handling later
        created_by: user.id,
      };

      await createListing(listingData);
      console.log('✅ Listing created successfully');

      Alert.alert('Success', 'Your listing has been created!', [
        { text: 'OK', onPress: onSuccess }
      ]);
    } catch (error) {
      console.error('❌ Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.formContainer}>
      <View style={styles.formHeader}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Sell an Item</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Title *</Text>
        <TextInput
          style={styles.formInput}
          placeholder="What are you selling?"
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Description</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          placeholder="Describe your item..."
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Price *</Text>
        <View style={styles.priceInputContainer}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.priceInputField}
            placeholder="0"
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Location</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Where is this item located?"
          value={formData.location}
          onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
        />
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Text style={styles.submitButtonText}>Post Listing</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#004D40',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  itemCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#44C76F',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#004D40',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#004D40',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
    paddingVertical: 12,
  },
  filterButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004D40',
  },
  categoryContainer: {
    paddingVertical: 8,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#44C76F',
    borderColor: '#004D40',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#004D40',
  },
  listContainer: {
    padding: 16,
  },
  listRow: {
    justifyContent: 'space-between',
  },
  listingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#004D40',
    shadowColor: '#004D40',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 16,
    width: (width - 48) / 2,
  },
  listingImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  listingContent: {
    padding: 12,
  },
  listingHeader: {
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#44C76F',
  },
  listingDescription: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  listingMeta: {
    marginBottom: 8,
  },
  listingLocation: {
    marginBottom: 4,
  },
  locationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  conditionBadge: {
    alignSelf: 'flex-start',
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#44C76F',
    backgroundColor: '#44C76F20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sellerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#44C76F',
  },
  sellerName: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 6,
  },
  chatButton: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#004D40',
  },
  chatButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#004D40',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#004D40',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#44C76F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#004D40',
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
  },

  // Filter Modal Styles
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#004D40',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
    padding: 4,
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 12,
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F5F1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  priceTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#004D40',
    paddingVertical: 12,
    marginLeft: 4,
  },
  locationInput: {
    backgroundColor: '#F2F5F1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#004D40',
  },
  filterActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: '#44C76F',
    borderWidth: 2,
    borderColor: '#004D40',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
  },

  // Form Styles
  formContainer: {
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '700',
    color: '#44C76F',
    marginRight: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#004D40',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  dollarSign: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    marginRight: 4,
  },
  priceInputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
    paddingVertical: 12,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#44C76F',
    borderWidth: 2,
    borderColor: '#004D40',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
  },
});