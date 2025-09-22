# Component Conversion Checklist (Web → React Native)

## Phase 1: UI Foundation Components (Type C - Mobile Native) ✅ COMPLETED
- [x] `/ui/badge.tsx` → ✅ Mobile badge component with variants and sizes
- [x] `/ui/button.tsx` → ✅ TouchableOpacity-based button with variants, loading states
- [x] `/ui/card.tsx` → ✅ Mobile card with shadows and touch support
- [x] `/ui/input.tsx` → ✅ TextInput component with validation, password toggle
- [x] `/ui/select.tsx` → ✅ Mobile picker/dropdown with modal interface
- [x] `/ui/textarea.tsx` → ✅ Multiline TextInput with validation
- [x] `/ui/tabs.tsx` → ✅ Mobile tab navigation with compound pattern
- [x] `/ui/dialog.tsx` → ✅ Modal component with keyboard avoidance
- [x] `/ui/separator.tsx` → ✅ View-based separator with variants
- [x] `/ui/label.tsx` → ✅ Text component with typography system
- [x] `/ui/checkbox.tsx` → ✅ Mobile checkbox with animations
- [x] `/ui/ImageUpload.tsx` → ✅ Mobile image picker with Supabase upload
- [x] `LoadingSpinner.tsx` → ✅ Already converted
- [x] `ErrorBoundary.tsx` → ✅ React Native error boundary with reporting

## Phase 2: Authentication & Onboarding (Type C) ✅ FULLY COMPLETED
- [x] `AuthPage.tsx` → ✅ AuthScreen.tsx - Complete mobile authentication
- [x] `UserTypeSelection.tsx` → ✅ Mobile user type selector with Roomio branding & native UX
- [x] `ProfileSetup.tsx` → ✅ Multi-step mobile profile creation with avatar selection & preferences
- [x] `UpgradeFlow.tsx` → ✅ Mobile upgrade flow for quick_access → full account conversion
- [ ] `/onboarding/RoommateOnboarding.tsx` → Mobile onboarding flow (optional advanced feature)
- [ ] `/onboarding/RoleSelection.tsx` → Mobile role picker (covered by UserTypeSelection)
- [ ] `/onboarding/ProfileSetupForm.tsx` → Mobile profile setup (covered by ProfileSetup)
- [ ] `UpgradeProfileSetup.tsx` → Mobile upgrade profile (covered by UpgradeFlow)
- [ ] `UpgradeUserTypeSelection.tsx` → Mobile upgrade selection (covered by UpgradeFlow)

## Phase 3: Main Page Components (Type C) ✅ COMPLETED
- [x] Main app navigation → ✅ AppNavigator updated with 6-tab navigation (swipe, matches, chat, expenses, marketplace, profile)
- [x] Home screen → ✅ HomeScreen updated with AppNavigator
- [x] Swipe interface → ✅ SwipeScreen created with real Supabase data
- [x] Matches display → ✅ MatchesScreen created
- [x] Chat interface → ✅ ChatScreen created
- [x] Expenses screen → ✅ ExpensesScreen created with comprehensive expense tracking
- [x] Marketplace screen → ✅ MarketplaceScreen created with listings and filters
- [x] Profile management → ✅ ProfileScreen created
- [x] Landing page → ✅ LandingScreen created
- [x] Main app entry → ✅ MainApp.tsx with complete navigation flow
- [ ] `SwipePage.tsx` → Merge with SwipeScreen
- [ ] `MatchesPage.tsx` → Merge with MatchesScreen
- [ ] `LockedSwipePage.tsx` → Mobile locked screen
- [ ] `SettingsPage.tsx` → Mobile settings

## Phase 4: Chat & Messaging (Type C) ✅ CORE COMPONENTS COMPLETED
- [x] Chat detail screen → ✅ ChatDetailScreen created
- [x] `/chat/ChatInput.tsx` → ✅ Mobile chat input with typing detection & image upload
- [x] `/chat/EnhancedMessageInput.tsx` → ✅ Enhanced input with mentions, file upload & quick actions
- [x] `/chat/MessageBubble.tsx` → ✅ Mobile message bubble with status indicators & image support
- [x] `/chat/TypingIndicator.tsx` → ✅ Mobile typing indicator with smooth animations
- [ ] `ChatPage.tsx` → Merge with ChatScreen
- [ ] `EnhancedChatPage.tsx` → Enhanced mobile chat
- [ ] `RoommateChatPage.tsx` → Roommate specific chat
- [ ] `/chat/MessageReactions.tsx` → Mobile reactions
- [ ] `/chat/ReactionPicker.tsx` → Mobile reaction picker
- [ ] `/chat/PinnedMessages.tsx` → Mobile pinned messages
- [ ] `/chat/FileUpload.tsx` → Mobile file picker
- [ ] `/chat/PollCreator.tsx` → Mobile poll creator
- [ ] `/chat/PollDisplay.tsx` → Mobile poll display
- [ ] `/chat/ChoreAssignment.tsx` → Mobile chore assignment
- [ ] `/chat/ChoreDisplay.tsx` → Mobile chore display
- [ ] `/chat/ExpenseDisplay.tsx` → Mobile expense display
- [ ] `/chat/ExpenseSplit.tsx` → Mobile expense split

## Phase 5: Profile & User Components (Type C) 🔄 CORE COMPONENTS COMPLETED
- [x] Profile edit screen → ✅ ProfileEditScreen created
- [x] `ProfileCard.tsx` → ✅ Mobile profile card with responsive layout & native UX
- [x] `ProfilePreview.tsx` → ✅ Mobile profile preview with brand styling & gradients
- [ ] `ProfileViewEdit.tsx` → Merge with ProfileEditScreen
- [ ] `EnhancedProfileEdit.tsx` → Enhanced mobile edit
- [ ] `/profile/ProfileCard.tsx` → Mobile profile card v2
- [ ] `/profile/ProfileModal.tsx` → Mobile profile modal
- [ ] `GroupMembersWithInvites.tsx` → Mobile group members
- [ ] `InviteModal.tsx` → Mobile invite modal

## Phase 6: Events & Expenses (Type C) 🔄 IN PROGRESS
- [x] `ExpensesPage.tsx` → ✅ ExpensesScreen.tsx - Mobile expenses screen with comprehensive expense tracking
- [ ] `ExpenseSplitter.tsx` → Mobile expense splitter
- [ ] `/expenses/CreateExpenseModal.tsx` → Mobile expense modal
- [ ] `/expenses/ExpenseCard.tsx` → Mobile expense card
- [ ] `/expenses/ExpenseDetailsModal.tsx` → Mobile expense details
- [ ] `/expenses/SettlementCard.tsx` → Mobile settlement card
- [ ] `/expenses/SettlementHistory.tsx` → Mobile settlement history
- [ ] `/expenses/SettlementModal.tsx` → Mobile settlement modal
- [ ] `/events/EventPage.tsx` → Mobile event page
- [ ] `/events/EventsListPage.tsx` → Mobile events list
- [ ] `/events/EventCard.tsx` → Mobile event card
- [ ] `/events/CreateEventModal.tsx` → Mobile event modal
- [ ] `/events/EventModal.tsx` → Mobile event detail
- [ ] `/events/EventRoomView.tsx` → Mobile event room
- [ ] `/events/EventRoomList.tsx` → Mobile room list
- [ ] `/events/EventSidebar.tsx` → Mobile event nav
- [ ] `/events/SlidingRoomPanel.tsx` → Mobile sliding panel
- [ ] `/events/InviteEventMembersModal.tsx` → Mobile invite modal
- [ ] `/events/SimplifiedDebtsModal.tsx` → Mobile debts modal
- [ ] `/events/EventAnalyticsModal.tsx` → Mobile analytics

## Phase 7: Friends & Matching (Type C) 🔄 IN PROGRESS
- [ ] `/friends/FriendsPanel.tsx` → Mobile friends panel
- [ ] `/friends/FriendsList.tsx` → Mobile friends list
- [ ] `/friends/FriendsPanelToggle.tsx` → Mobile friends toggle
- [ ] `/friends/PendingRequests.tsx` → Mobile pending requests
- [ ] `/friends/UserCard.tsx` → Mobile user card
- [ ] `/friends/UserSearch.tsx` → Mobile user search
- [ ] `/matching/DiscoverFeed.tsx` → Mobile discover feed
- [x] `ListingCard.tsx` → ✅ Integrated into MarketplaceScreen.tsx
- [x] `AddListingPage.tsx` → ✅ Integrated into MarketplaceScreen.tsx
- [x] `MarketplacePage.tsx` → ✅ MarketplaceScreen.tsx - Mobile marketplace with listings, filters, and chat integration

## Phase 8: Settings & Utility (Type C)
- [ ] `SettingsMenu.tsx` → Mobile settings menu
- [ ] `NotificationsDropdown.tsx` → Mobile notifications
- [ ] `SessionRecovery.tsx` → Mobile session recovery
- [ ] `DeleteConfirmationModal.tsx` → Mobile confirmation
- [ ] `ProofReviewDropdown.tsx` → Mobile proof review
- [ ] `DebugInfo.tsx` → Mobile debug info
- [ ] `FriendsDebugButton.tsx` → Mobile debug button
- [ ] `SearchParamsHandler.tsx` → Mobile navigation handler

## Phase 9: Room & Photo Management (Type C)
- [ ] `/roomPhotos/RoomPhotoUpload.tsx` → Mobile photo upload
- [ ] `/roomPhotos/RoomPhotoManager.tsx` → Mobile photo manager
- [ ] `/roomPhotos/PhotoGalleryModal.tsx` → Mobile photo gallery

## Phase 10: Real Data Integration ✅ COMPLETED
- [x] **Supabase Service Functions** → ✅ Added to mobile supabase.ts
  - [x] `getDiscoverUsers()` → Fetch users for swiping with proper userType filtering
  - [x] `getMatches()` → Fetch user matches
  - [x] `getChatConversations()` → Fetch chat conversations
- [x] **SwipeScreen Real Data** → ✅ Updated to use live Supabase data
  - [x] Loading states while fetching users
  - [x] Error handling with fallback to mock data
  - [x] Real-time refresh functionality
- [x] **MatchesScreen Real Data** → ✅ Updated to use getMatches() with loading/error states
- [x] **ChatScreen Real Data** → ✅ Updated to use getChatConversations() with real-time formatting

## Phase 11: Lib Files Conversion ✅ COMPLETED
- [x] **utils.ts** → ✅ Mobile-native utility functions (no Tailwind dependencies)
  - [x] Converted `cn()` from CSS classes to React Native style object merging
  - [x] Added mobile-specific utility functions (formatDate, formatCurrency, etc.)
  - [x] Platform detection functions (isMobile, getPlatform)
- [x] **avatarUtils.ts** → ✅ Mobile-native avatar handling
  - [x] Converted web asset paths to external URLs/placeholders
  - [x] Added mobile-specific avatar generation functions
  - [x] Profile picture URL formatting for React Native Image components
- [x] **imageUtils.ts** → ✅ React Native image processing
  - [x] Expo ImagePicker integration for camera/gallery access
  - [x] Expo ImageManipulator for compression and resizing
  - [x] Mobile-specific image validation and permissions
- [x] **storage.ts** → ✅ Mobile-compatible Supabase Storage
  - [x] Mobile URI to Blob conversion for uploads
  - [x] Expo FileSystem integration for local caching
  - [x] Mobile-specific file handling and permissions
- [x] **api.ts** → ✅ Mobile-native authenticated API helper
  - [x] React Native fetch with proper headers and error handling
  - [x] Mobile platform detection and user agent
  - [x] File upload support for mobile URIs
- [x] **debug.ts** → ✅ Mobile-native debugging utilities
  - [x] Mobile platform info and context logging
  - [x] Performance timing for mobile operations
  - [x] Comprehensive mobile debug reporting
- [x] **Enhanced supabase.ts** → ✅ Merged advanced session management
  - [x] Mobile-adapted session validation and recovery
  - [x] Connection monitoring for mobile networks
  - [x] Auto-recovery system for mobile environments
- [x] **Test Suite** → ✅ Comprehensive lib function testing
  - [x] Created testLibFunctions.ts with full test coverage
  - [x] Smoke tests for all converted functions
  - [x] Mobile-specific validation and error handling

## Conversion Priority:
1. **High Priority**: ✅ UI foundations, ✅ auth, ✅ main pages, chat
2. **Medium Priority**: Profile, friends, matching
3. **Low Priority**: Events, expenses, room photos, utilities

## Notes:
- ✅ = Completed
- 🔄 = In Progress
- All components should follow Type C (mobile-native) conversion
- Focus on mobile UX patterns: touch gestures, native navigation, proper spacing
- Use React Native components exclusively (no HTML/CSS)
- Implement proper mobile accessibility
- **Real Data**: Mobile app now fetches actual users from Supabase instead of mock data
- Test on both iOS and Android patterns