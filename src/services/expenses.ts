// services/expenses.ts - Expense management service - Mobile adapted
import { supabase } from "./supabase";
import type {
  CreateExpenseGroupRequest,
  CreateExpenseGroupResponse,
  SubmitSettlementRequest,
  SubmitSettlementResponse,
  ApproveSettlementRequest,
  ApproveSettlementResponse,
  ExpenseSummary,
  ExpenseDashboardData,
  PendingSettlement,
  ExpenseGroup,
  ExpenseParticipant,
  Settlement,
  UserPendingSettlement,
  UserExpenseSummary,
  SettlementChangePayload,
} from "../types/expenses";

// Helper function to ensure user is authenticated
async function ensureAuthenticated() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Get expense summary for a user
 */
export async function getExpenseSummary(userId?: string): Promise<ExpenseSummary[]> {
  try {
    console.log("📄 Fetching expense summary for user:", userId || "current user");

    // Ensure user is authenticated
    const user = await ensureAuthenticated();
    const targetUserId = userId || user.id;

    // Try to use the SQL function first, fallback to manual query if it doesn't exist
    try {
      const { data, error } = await supabase.rpc('get_expense_summary', {
        p_user_id: targetUserId
      });

      if (!error && data) {
        console.log("✅ Expense summary retrieved via RPC:", data?.length || 0, "groups");
        return data || [];
      }
    } catch (rpcError) {
      console.log("RPC function not available, using fallback query");
    }

    // Fallback to manual query
    return await getExpenseSummaryFallback(targetUserId);

  } catch (error) {
    console.error("❌ Exception fetching expense summary:", error);
    return [];
  }
}

/**
 * Fallback method to get expense summary manually
 */
async function getExpenseSummaryFallback(userId: string): Promise<ExpenseSummary[]> {
  try {
    // Get expense groups where user is a participant
    const { data: participantGroups, error: participantError } = await supabase
      .from('expense_participants')
      .select('group_id')
      .eq('user_id', userId);

    if (participantError) {
      throw participantError;
    }

    const groupIds = participantGroups?.map(p => p.group_id) || [];

    if (groupIds.length === 0) {
      return [];
    }

    // Get expense groups with creator info
    const { data: expenseGroups, error: groupsError } = await supabase
      .from('expense_groups')
      .select(`
        id,
        name,
        description,
        total_amount,
        created_by,
        created_at,
        status,
        event_id,
        users!expense_groups_created_by_fkey(name)
      `)
      .in('id', groupIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (groupsError) {
      throw groupsError;
    }

    // Get participant data for these groups
    const { data: participants, error: participantsError } = await supabase
      .from('expense_participants')
      .select(`
        *,
        users!expense_participants_user_id_fkey(name, profilepicture)
      `)
      .in('group_id', groupIds);

    if (participantsError) {
      throw participantsError;
    }

    // Transform data to ExpenseSummary format
    const summaries: ExpenseSummary[] = (expenseGroups || []).map(group => {
      const groupParticipants = participants?.filter(p => p.group_id === group.id) || [];
      const userParticipant = groupParticipants.find(p => p.user_id === userId);

      return {
        group_id: group.id,
        group_name: group.name,
        group_description: group.description,
        total_amount: group.total_amount,
        amount_owed: userParticipant?.amount_owed || 0,
        amount_paid: userParticipant?.amount_paid || 0,
        is_settled: userParticipant?.is_settled || false,
        created_by_name: group.users?.name || 'Unknown',
        created_by_id: group.created_by,
        created_at: group.created_at,
        group_status: group.status,
        event_id: group.event_id,
        participants: groupParticipants.map(p => ({
          user_id: p.user_id,
          name: p.users?.name || 'Unknown',
          profile_picture: p.users?.profilepicture,
          amount_owed: p.amount_owed,
          amount_paid: p.amount_paid,
          is_settled: p.is_settled,
          is_creator: p.user_id === group.created_by
        }))
      };
    });

    console.log("✅ Expense summary retrieved via fallback:", summaries.length, "groups");
    return summaries;

  } catch (error) {
    console.error("❌ Error in fallback expense summary:", error);
    return [];
  }
}

/**
 * Create a new expense group
 */
export async function createExpenseGroup(request: CreateExpenseGroupRequest): Promise<CreateExpenseGroupResponse> {
  try {
    console.log("🔄 Creating expense group:", request.name);

    const user = await ensureAuthenticated();

    // Create the expense group
    const { data: group, error: groupError } = await supabase
      .from('expense_groups')
      .insert({
        name: request.name,
        description: request.description,
        total_amount: request.total_amount,
        split_type: request.split_type,
        created_by: user.id,
        status: 'active'
      })
      .select()
      .single();

    if (groupError) {
      console.error("❌ Error creating expense group:", groupError);
      return { success: false, message: groupError.message };
    }

    // Calculate amounts for participants
    const participantCount = request.participants.length;
    let participantAmounts: number[] = [];

    if (request.split_type === 'equal') {
      const amountPerPerson = request.total_amount / participantCount;
      participantAmounts = new Array(participantCount).fill(amountPerPerson);
    } else {
      participantAmounts = request.custom_amounts || [];
    }

    // Create participant records
    const participantInserts = request.participants.map((userId, index) => ({
      group_id: group.id,
      user_id: userId,
      amount_owed: participantAmounts[index] || 0,
      amount_paid: 0,
      is_settled: false
    }));

    const { error: participantError } = await supabase
      .from('expense_participants')
      .insert(participantInserts);

    if (participantError) {
      console.error("❌ Error creating participants:", participantError);
      // Clean up the group if participant creation fails
      await supabase.from('expense_groups').delete().eq('id', group.id);
      return { success: false, message: participantError.message };
    }

    console.log("✅ Expense group created successfully:", group.id);
    return { success: true, group_id: group.id };

  } catch (error) {
    console.error("❌ Exception creating expense group:", error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to create expense group' };
  }
}

/**
 * Submit a settlement for approval
 */
export async function submitSettlement(request: SubmitSettlementRequest): Promise<SubmitSettlementResponse> {
  try {
    console.log("🔄 Submitting settlement for group:", request.group_id);

    const user = await ensureAuthenticated();

    // Get the expense group to find the creator (receiver)
    const { data: group, error: groupError } = await supabase
      .from('expense_groups')
      .select('created_by')
      .eq('id', request.group_id)
      .single();

    if (groupError || !group) {
      return { success: false, message: 'Expense group not found' };
    }

    // Create settlement record
    const { data: settlement, error: settlementError } = await supabase
      .from('settlements')
      .insert({
        group_id: request.group_id,
        payer_id: user.id,
        receiver_id: group.created_by,
        amount: request.amount,
        payment_method: request.payment_method,
        proof_image: request.proof_image,
        notes: request.notes,
        status: 'pending'
      })
      .select()
      .single();

    if (settlementError) {
      console.error("❌ Error creating settlement:", settlementError);
      return { success: false, message: settlementError.message };
    }

    console.log("✅ Settlement submitted successfully:", settlement.id);
    return { success: true, settlement_id: settlement.id };

  } catch (error) {
    console.error("❌ Exception submitting settlement:", error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to submit settlement' };
  }
}

/**
 * Approve or reject a settlement
 */
export async function approveSettlement(request: ApproveSettlementRequest): Promise<ApproveSettlementResponse> {
  try {
    console.log("🔄 Approving settlement:", request.settlement_id, request.approved);

    const user = await ensureAuthenticated();

    // Get settlement details
    const { data: settlement, error: settlementError } = await supabase
      .from('settlements')
      .select('*')
      .eq('id', request.settlement_id)
      .single();

    if (settlementError || !settlement) {
      return { success: false, approved: false, message: 'Settlement not found' };
    }

    // Verify user is the receiver (group creator)
    if (settlement.receiver_id !== user.id) {
      return { success: false, approved: false, message: 'You are not authorized to approve this settlement' };
    }

    // Update settlement status
    const updateData: any = {
      status: request.approved ? 'approved' : 'rejected'
    };

    if (request.approved) {
      updateData.approved_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('settlements')
      .update(updateData)
      .eq('id', request.settlement_id);

    if (updateError) {
      console.error("❌ Error updating settlement:", updateError);
      return { success: false, approved: false, message: updateError.message };
    }

    // If approved, update participant's amount_paid
    if (request.approved) {
      const { error: participantError } = await supabase
        .from('expense_participants')
        .update({
          amount_paid: settlement.amount,
          is_settled: true
        })
        .eq('group_id', settlement.group_id)
        .eq('user_id', settlement.payer_id);

      if (participantError) {
        console.error("❌ Error updating participant:", participantError);
        return { success: false, approved: false, message: participantError.message };
      }
    }

    console.log("✅ Settlement", request.approved ? 'approved' : 'rejected', "successfully");
    return { success: true, approved: request.approved };

  } catch (error) {
    console.error("❌ Exception approving settlement:", error);
    return { success: false, approved: false, message: error instanceof Error ? error.message : 'Failed to approve settlement' };
  }
}

/**
 * Get expense dashboard data for a user
 */
export async function getExpenseDashboardData(userId?: string): Promise<ExpenseDashboardData> {
  try {
    console.log("📊 Fetching expense dashboard data");

    const user = await ensureAuthenticated();
    const targetUserId = userId || user.id;

    // Get active expenses
    const activeExpenses = await getExpenseSummary(targetUserId);

    // Get pending settlements where user is receiver
    const { data: pendingSettlements, error: settlementsError } = await supabase
      .from('settlements')
      .select(`
        *,
        users!settlements_payer_id_fkey(name),
        expense_groups!settlements_group_id_fkey(name)
      `)
      .eq('receiver_id', targetUserId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (settlementsError) {
      console.error("❌ Error fetching pending settlements:", settlementsError);
    }

    // Calculate totals
    let totalOwed = 0;
    let totalToReceive = 0;

    activeExpenses.forEach(expense => {
      if (expense.created_by_id === targetUserId) {
        // User created this expense, they receive money
        totalToReceive += (expense.total_amount - expense.amount_paid);
      } else {
        // User owes money
        totalOwed += (expense.amount_owed - expense.amount_paid);
      }
    });

    const formattedPendingSettlements: PendingSettlement[] = (pendingSettlements || []).map(settlement => ({
      settlement_id: settlement.id,
      group_name: settlement.expense_groups?.name || 'Unknown Group',
      payer_name: settlement.users?.name || 'Unknown User',
      receiver_id: settlement.receiver_id,
      amount: settlement.amount,
      payment_method: settlement.payment_method,
      status: settlement.status,
      created_at: settlement.created_at,
      proof_image: settlement.proof_image,
      notes: settlement.notes
    }));

    console.log("✅ Dashboard data retrieved");
    return {
      active_expenses: activeExpenses,
      pending_settlements: formattedPendingSettlements,
      total_owed: totalOwed,
      total_to_receive: totalToReceive
    };

  } catch (error) {
    console.error("❌ Exception fetching dashboard data:", error);
    return {
      active_expenses: [],
      pending_settlements: [],
      total_owed: 0,
      total_to_receive: 0
    };
  }
}

/**
 * Delete an expense group (only by creator)
 */
export async function deleteExpenseGroup(groupId: string): Promise<{ success: boolean; message?: string }> {
  try {
    console.log("🗑️ Deleting expense group:", groupId);

    const user = await ensureAuthenticated();

    // Verify user is the creator
    const { data: group, error: groupError } = await supabase
      .from('expense_groups')
      .select('created_by')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return { success: false, message: 'Expense group not found' };
    }

    if (group.created_by !== user.id) {
      return { success: false, message: 'You are not authorized to delete this expense group' };
    }

    // Delete settlements first (due to foreign key constraints)
    await supabase.from('settlements').delete().eq('group_id', groupId);

    // Delete participants
    await supabase.from('expense_participants').delete().eq('group_id', groupId);

    // Delete the group
    const { error: deleteError } = await supabase
      .from('expense_groups')
      .delete()
      .eq('id', groupId);

    if (deleteError) {
      console.error("❌ Error deleting expense group:", deleteError);
      return { success: false, message: deleteError.message };
    }

    console.log("✅ Expense group deleted successfully");
    return { success: true };

  } catch (error) {
    console.error("❌ Exception deleting expense group:", error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to delete expense group' };
  }
}

/**
 * Mark participant as settled (manual settlement)
 */
export async function markParticipantSettled(groupId: string, participantId: string): Promise<{ success: boolean; message?: string }> {
  try {
    console.log("✅ Marking participant as settled:", { groupId, participantId });

    const user = await ensureAuthenticated();

    // Verify user is the group creator
    const { data: group, error: groupError } = await supabase
      .from('expense_groups')
      .select('created_by')
      .eq('id', groupId)
      .single();

    if (groupError || !group || group.created_by !== user.id) {
      return { success: false, message: 'You are not authorized to modify this expense group' };
    }

    // Update participant
    const { error: updateError } = await supabase
      .from('expense_participants')
      .update({
        amount_paid: supabase.raw('amount_owed'),
        is_settled: true
      })
      .eq('group_id', groupId)
      .eq('user_id', participantId);

    if (updateError) {
      console.error("❌ Error marking participant as settled:", updateError);
      return { success: false, message: updateError.message };
    }

    console.log("✅ Participant marked as settled successfully");
    return { success: true };

  } catch (error) {
    console.error("❌ Exception marking participant as settled:", error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to mark as settled' };
  }
}