// Export all migrated types from their respective files
export * from './user'
export * from './chat'
export * from './listing'
export * from './enhanced-chat'
export * from './events'
export * from './expenses'
export * from './roomPhotos'
export * from './roommate'

// Navigation types for React Navigation
export type RootStackParamList = {
  Auth: undefined
  Main: undefined
}

export type AuthStackParamList = {
  Welcome: undefined
  SignIn: undefined
  SignUp: undefined
}

export type MainTabParamList = {
  Swipe: undefined
  Matches: undefined
  Chat: { matchId: string }
  Marketplace: undefined
  Profile: undefined
}