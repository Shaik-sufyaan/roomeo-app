// services/matches.ts - Match management service - Mobile adapted
import { supabase } from './supabase'
import type { User } from '../types/user'
import type { MatchType } from '../types/roommate'

export interface Match {
  id: string
  user_id: string
  target_user_id: string
  match_type: MatchType
  created_at: string
}

export interface MatchWithUser extends Match {
  matched_user: {
    id: string
    name: string
    profilePicture?: string
    age?: number
    bio?: string
    location?: string
    userType?: 'seeker' | 'provider'
  }
}

/**
 * Save a match/swipe action to the database
 * Uses user_matches table for consistency with roommate-matching service
 */
export const saveMatch = async (
  userId: string,
  targetUserId: string,
  action: MatchType
): Promise<{ success: boolean; isMutualMatch?: boolean; error?: string }> => {
  try {
    console.log(`💕 Saving ${action} from ${userId} to ${targetUserId}`)

    // Save the match action
    const { data: match, error } = await supabase
      .from('user_matches')
      .upsert({
        user_id: userId,
        target_user_id: targetUserId,
        match_type: action,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving match:', error)
      return { success: false, error: error.message }
    }

    let isMutualMatch = false

    // Check for mutual match if action is 'like' or 'super_like'
    if (action === 'like' || action === 'super_like') {
      const mutualResult = await checkMutualMatch(userId, targetUserId)
      if (mutualResult.success) {
        isMutualMatch = mutualResult.isMutual || false
        if (isMutualMatch) {
          console.log(`🎉 Mutual match detected between ${userId} and ${targetUserId}`)
        }
      }
    }

    return { success: true, isMutualMatch }
  } catch (error) {
    console.error('Unexpected error saving match:', error)
    return { success: false, error: 'Failed to save match' }
  }
}

/**
 * Get all matches for a user (people they liked)
 */
export const getUserMatches = async (userId: string): Promise<{ success: boolean; matches?: MatchWithUser[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('user_matches')
      .select(`
        *,
        matched_user:users!user_matches_target_user_id_fkey (
          id,
          name,
          profilepicture,
          age,
          bio,
          location,
          usertype
        )
      `)
      .eq('user_id', userId)
      .in('match_type', ['like', 'super_like'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching matches:', error)
      return { success: false, error: error.message }
    }

    // Transform data to match expected format
    const transformedMatches: MatchWithUser[] = (data || []).map(match => ({
      id: match.id,
      user_id: match.user_id,
      target_user_id: match.target_user_id,
      match_type: match.match_type,
      created_at: match.created_at,
      matched_user: {
        id: match.matched_user.id,
        name: match.matched_user.name,
        profilePicture: match.matched_user.profilepicture || '',
        age: match.matched_user.age,
        bio: match.matched_user.bio || '',
        location: match.matched_user.location || '',
        userType: match.matched_user.usertype
      }
    }))

    return { success: true, matches: transformedMatches }
  } catch (error) {
    console.error('Unexpected error fetching matches:', error)
    return { success: false, error: 'Failed to fetch matches' }
  }
}

/**
 * Check if there's a mutual match (both users liked each other)
 */
export const checkMutualMatch = async (userId: string, otherUserId: string): Promise<{ success: boolean; isMutual?: boolean; error?: string }> => {
  try {
    // Check if user A liked user B
    const { data: userALikesB, error: errorA } = await supabase
      .from('user_matches')
      .select('id')
      .eq('user_id', userId)
      .eq('target_user_id', otherUserId)
      .in('match_type', ['like', 'super_like'])
      .single()

    if (errorA && errorA.code !== 'PGRST116') {
      console.error('Error checking user A likes B:', errorA)
      return { success: false, error: errorA.message }
    }

    // Check if user B liked user A
    const { data: userBLikesA, error: errorB } = await supabase
      .from('user_matches')
      .select('id')
      .eq('user_id', otherUserId)
      .eq('target_user_id', userId)
      .in('match_type', ['like', 'super_like'])
      .single()

    if (errorB && errorB.code !== 'PGRST116') {
      console.error('Error checking user B likes A:', errorB)
      return { success: false, error: errorB.message }
    }

    // It's mutual if both likes exist
    const isMutual = !!(userALikesB && userBLikesA)

    return { success: true, isMutual }
  } catch (error) {
    console.error('Unexpected error checking mutual match:', error)
    return { success: false, error: 'Failed to check mutual match' }
  }
}

/**
 * Get mutual matches for a user
 */
export const getMutualMatches = async (userId: string): Promise<{ success: boolean; matches?: MatchWithUser[]; error?: string }> => {
  try {
    // Get all users that the current user liked
    const { data: userLikes, error: likesError } = await supabase
      .from('user_matches')
      .select('target_user_id')
      .eq('user_id', userId)
      .in('match_type', ['like', 'super_like'])

    if (likesError) {
      console.error('Error fetching user likes:', likesError)
      return { success: false, error: likesError.message }
    }

    if (!userLikes || userLikes.length === 0) {
      return { success: true, matches: [] }
    }

    const likedUserIds = userLikes.map(like => like.target_user_id)

    // Get all users that liked the current user back (mutual matches)
    const { data: mutualMatches, error: mutualError } = await supabase
      .from('user_matches')
      .select(`
        *,
        matched_user:users!user_matches_user_id_fkey (
          id,
          name,
          profilepicture,
          age,
          bio,
          location,
          usertype
        )
      `)
      .eq('target_user_id', userId)
      .in('match_type', ['like', 'super_like'])
      .in('user_id', likedUserIds)

    if (mutualError) {
      console.error('Error fetching mutual matches:', mutualError)
      return { success: false, error: mutualError.message }
    }

    // Transform data to match expected format
    const transformedMatches: MatchWithUser[] = (mutualMatches || []).map(match => ({
      id: match.id,
      user_id: match.user_id,
      target_user_id: match.target_user_id,
      match_type: match.match_type,
      created_at: match.created_at,
      matched_user: {
        id: match.matched_user.id,
        name: match.matched_user.name,
        profilePicture: match.matched_user.profilepicture || '',
        age: match.matched_user.age,
        bio: match.matched_user.bio || '',
        location: match.matched_user.location || '',
        userType: match.matched_user.usertype
      }
    }))

    return { success: true, matches: transformedMatches }
  } catch (error) {
    console.error('Unexpected error fetching mutual matches:', error)
    return { success: false, error: 'Failed to fetch mutual matches' }
  }
}

/**
 * Remove a match (delete only the current user's like record)
 */
export const removeMatch = async (userId: string, targetUserId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`🗑️ Removing match from ${userId} to ${targetUserId}`)

    const { error } = await supabase
      .from('user_matches')
      .delete()
      .eq('user_id', userId)
      .eq('target_user_id', targetUserId)
      .in('match_type', ['like', 'super_like'])

    if (error) {
      console.error('Error removing match:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Match removed successfully')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error removing match:', error)
    return { success: false, error: 'Failed to remove match' }
  }
}

/**
 * Get users that current user has already swiped on (to exclude from discovery)
 */
export const getSwipedUserIds = async (userId: string): Promise<{ success: boolean; userIds?: string[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('user_matches')
      .select('target_user_id')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching swiped users:', error)
      return { success: false, error: error.message }
    }

    const userIds = (data || []).map(match => match.target_user_id)
    return { success: true, userIds }
  } catch (error) {
    console.error('Unexpected error fetching swiped users:', error)
    return { success: false, error: 'Failed to fetch swiped users' }
  }
}

/**
 * Get match statistics for a user
 */
export const getMatchStats = async (userId: string): Promise<{
  success: boolean;
  stats?: {
    totalLikes: number;
    totalMatches: number;
    todayLikes: number;
    todayMatches: number;
  };
  error?: string
}> => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // Get total likes given
    const { data: totalLikes, error: likesError } = await supabase
      .from('user_matches')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .in('match_type', ['like', 'super_like'])

    if (likesError) {
      return { success: false, error: likesError.message }
    }

    // Get today's likes
    const { data: todayLikes, error: todayLikesError } = await supabase
      .from('user_matches')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .in('match_type', ['like', 'super_like'])
      .gte('created_at', todayISO)

    if (todayLikesError) {
      return { success: false, error: todayLikesError.message }
    }

    // Get mutual matches count
    const mutualMatchesResult = await getMutualMatches(userId)
    if (!mutualMatchesResult.success) {
      return { success: false, error: mutualMatchesResult.error }
    }

    const totalMatches = mutualMatchesResult.matches?.length || 0

    // Count today's mutual matches
    const todayMatches = mutualMatchesResult.matches?.filter(match =>
      new Date(match.created_at) >= today
    ).length || 0

    return {
      success: true,
      stats: {
        totalLikes: totalLikes?.length || 0,
        totalMatches,
        todayLikes: todayLikes?.length || 0,
        todayMatches
      }
    }
  } catch (error) {
    console.error('Unexpected error fetching match stats:', error)
    return { success: false, error: 'Failed to fetch match stats' }
  }
}