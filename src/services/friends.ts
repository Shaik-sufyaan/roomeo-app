// services/friends.ts - Friends/connections management service - Mobile adapted
import { supabase } from "./supabase";

export interface Friend {
  id: string;
  name: string;
  profilePicture?: string;
  email?: string;
  userType?: 'seeker' | 'provider';
  connectionDate?: string;
}

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  from_user?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  to_user?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

// Helper function to ensure user is authenticated
async function ensureAuthenticated() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Get user's friends/connections
 */
export async function getFriends(userId?: string): Promise<Friend[]> {
  try {
    const user = await ensureAuthenticated();
    const targetUserId = userId || user.id;

    console.log("🔍 Fetching friends for user:", targetUserId);

    // This would require a friends/connections table in your database
    // For now, return empty array as placeholder
    console.log("⚠️ Friends system not yet implemented in database");
    return [];

  } catch (error) {
    console.error("❌ Exception fetching friends:", error);
    return [];
  }
}

/**
 * Send friend request
 */
export async function sendFriendRequest(toUserId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await ensureAuthenticated();

    console.log("📨 Sending friend request to:", toUserId);

    // Placeholder implementation
    console.log("⚠️ Friend request system not yet implemented in database");
    return { success: false, message: "Friend request system not yet implemented" };

  } catch (error) {
    console.error("❌ Exception sending friend request:", error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to send friend request' };
  }
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(requestId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await ensureAuthenticated();

    console.log("✅ Accepting friend request:", requestId);

    // Placeholder implementation
    console.log("⚠️ Friend request system not yet implemented in database");
    return { success: false, message: "Friend request system not yet implemented" };

  } catch (error) {
    console.error("❌ Exception accepting friend request:", error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to accept friend request' };
  }
}

/**
 * Reject friend request
 */
export async function rejectFriendRequest(requestId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await ensureAuthenticated();

    console.log("❌ Rejecting friend request:", requestId);

    // Placeholder implementation
    console.log("⚠️ Friend request system not yet implemented in database");
    return { success: false, message: "Friend request system not yet implemented" };

  } catch (error) {
    console.error("❌ Exception rejecting friend request:", error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to reject friend request' };
  }
}

/**
 * Get pending friend requests
 */
export async function getPendingFriendRequests(): Promise<FriendRequest[]> {
  try {
    const user = await ensureAuthenticated();

    console.log("📩 Fetching pending friend requests");

    // Placeholder implementation
    console.log("⚠️ Friend request system not yet implemented in database");
    return [];

  } catch (error) {
    console.error("❌ Exception fetching pending requests:", error);
    return [];
  }
}

/**
 * Remove friend/connection
 */
export async function removeFriend(friendId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await ensureAuthenticated();

    console.log("🗑️ Removing friend:", friendId);

    // Placeholder implementation
    console.log("⚠️ Friends system not yet implemented in database");
    return { success: false, message: "Friends system not yet implemented" };

  } catch (error) {
    console.error("❌ Exception removing friend:", error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to remove friend' };
  }
}