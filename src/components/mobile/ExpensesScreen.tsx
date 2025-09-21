// components/mobile/ExpensesScreen.tsx - Mobile-native expenses management screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import type { User } from '../../types/user';
import type { ExpenseDashboardData, ExpenseSummary, CreateExpenseGroupRequest } from '../../types/expenses';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../../lib/utils';
import { getExpenseDashboardData, createExpenseGroup } from '../../services/expenses';

const { width } = Dimensions.get('window');

interface ExpensesScreenProps {
  user: User;
  onRefresh: () => void;
  refreshing: boolean;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'rent' | 'utilities' | 'groceries' | 'cleaning' | 'maintenance' | 'other';
  date: Date;
  paidBy: string;
  paidByName: string;
  participants: string[];
  participantNames: string[];
  splitType: 'equal' | 'custom';
  isSettled: boolean;
  yourShare: number;
  youOwe: number;
  owedToYou: number;
  description?: string;
}

interface Settlement {
  id: string;
  fromUser: string;
  fromUserName: string;
  toUser: string;
  toUserName: string;
  amount: number;
  date: Date;
  status: 'pending' | 'completed';
}

// Mock expenses data
const mockExpenses: Expense[] = [
  {
    id: '1',
    title: 'Monthly Rent',
    amount: 1200,
    category: 'rent',
    date: new Date('2024-01-01'),
    paidBy: 'user1',
    paidByName: 'Sarah Chen',
    participants: ['user1', 'user2', 'user3'],
    participantNames: ['Sarah Chen', 'You', 'Mike Johnson'],
    splitType: 'equal',
    isSettled: false,
    yourShare: 400,
    youOwe: 400,
    owedToYou: 0,
    description: 'January rent payment',
  },
  {
    id: '2',
    title: 'Electricity Bill',
    amount: 85,
    category: 'utilities',
    date: new Date('2024-01-15'),
    paidBy: 'user2',
    paidByName: 'You',
    participants: ['user1', 'user2', 'user3'],
    participantNames: ['Sarah Chen', 'You', 'Mike Johnson'],
    splitType: 'equal',
    isSettled: false,
    yourShare: 28.33,
    youOwe: 0,
    owedToYou: 56.67,
  },
  {
    id: '3',
    title: 'Groceries - Shared Items',
    amount: 120,
    category: 'groceries',
    date: new Date('2024-01-20'),
    paidBy: 'user3',
    paidByName: 'Mike Johnson',
    participants: ['user1', 'user2', 'user3'],
    participantNames: ['Sarah Chen', 'You', 'Mike Johnson'],
    splitType: 'equal',
    isSettled: true,
    yourShare: 40,
    youOwe: 40,
    owedToYou: 0,
  },
];

const mockSettlements: Settlement[] = [
  {
    id: '1',
    fromUser: 'user2',
    fromUserName: 'You',
    toUser: 'user1',
    toUserName: 'Sarah Chen',
    amount: 400,
    date: new Date('2024-01-25'),
    status: 'pending',
  },
];

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({
  user,
  onRefresh,
  refreshing,
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'settlements'>('expenses');

  // Calculate summary statistics
  const totalOwed = expenses.reduce((sum, expense) => sum + expense.youOwe, 0);
  const totalOwedToYou = expenses.reduce((sum, expense) => sum + expense.owedToYou, 0);
  const netBalance = totalOwedToYou - totalOwed;

  // Load expenses and settlements from Supabase
  const loadExpenses = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading expense dashboard for:', user.id);

      // Get real expense data from Supabase
      const dashboardData = await getExpenseDashboardData(user.id);

      // Transform ExpenseSummary[] to Expense[] format
      const transformedExpenses: Expense[] = dashboardData.active_expenses.map(summary => ({
        id: summary.group_id,
        title: summary.group_name,
        amount: summary.total_amount,
        category: 'other' as const, // Map to categories as needed
        date: new Date(summary.created_at),
        paidBy: summary.created_by_id,
        paidByName: summary.created_by_name,
        participants: summary.participants?.map(p => p.user_id) || [],
        participantNames: summary.participants?.map(p => p.name) || [],
        splitType: 'equal' as const, // Default to equal split
        isSettled: summary.is_settled,
        yourShare: summary.amount_owed,
        youOwe: Math.max(0, summary.amount_owed - summary.amount_paid),
        owedToYou: summary.created_by_id === user.id ? summary.total_amount - summary.amount_paid : 0,
        description: summary.group_description,
      }));

      // Transform PendingSettlement[] to Settlement[] format
      const transformedSettlements: Settlement[] = dashboardData.pending_settlements.map(pending => ({
        id: pending.settlement_id,
        fromUser: 'unknown', // We don't have this in the current structure
        fromUserName: pending.payer_name,
        toUser: pending.receiver_id,
        toUserName: 'You', // Assuming current user is receiver
        amount: pending.amount,
        method: pending.payment_method,
        status: pending.status as 'pending',
        date: new Date(pending.created_at),
        description: `Payment for ${pending.group_name}`,
      }));

      setExpenses(transformedExpenses);
      setSettlements(transformedSettlements);
      console.log('✅ Loaded expenses from Supabase:', transformedExpenses.length);
    } catch (error) {
      console.error('❌ Error loading expenses:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setError('Failed to load expenses. Please try again.');
      // Show empty arrays instead of mock data
      setExpenses([]);
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [user?.id]);

  const handleRefresh = async () => {
    await loadExpenses();
    onRefresh();
  };

  const handleAddExpense = () => {
    Alert.alert(
      'Add Expense',
      'Create a new shared expense',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: () => console.log('Navigate to add expense') },
      ]
    );
  };

  const handleSettleUp = () => {
    Alert.alert(
      'Settle Up',
      'Settle your outstanding balances',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settle', onPress: () => console.log('Navigate to settle up') },
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      rent: '🏠',
      utilities: '⚡',
      groceries: '🛒',
      cleaning: '🧽',
      maintenance: '🔧',
      other: '📝',
    };
    return icons[category as keyof typeof icons] || '📝';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      rent: '#3B82F6',
      utilities: '#F59E0B',
      groceries: '#10B981',
      cleaning: '#8B5CF6',
      maintenance: '#EF4444',
      other: '#6B7280',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity style={styles.expenseCard} activeOpacity={0.7}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseTitle}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseItemTitle}>{item.title}</Text>
            <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.expenseAmount}>
          <Text style={styles.totalAmount}>{formatCurrency(item.amount)}</Text>
          {item.isSettled && (
            <Text style={styles.settledBadge}>✓ Settled</Text>
          )}
        </View>
      </View>

      <View style={styles.expenseDetails}>
        <Text style={styles.paidBy}>Paid by {item.paidByName}</Text>
        <View style={styles.balanceInfo}>
          {item.youOwe > 0 && (
            <Text style={styles.youOwe}>You owe: {formatCurrency(item.youOwe)}</Text>
          )}
          {item.owedToYou > 0 && (
            <Text style={styles.owedToYou}>Owes you: {formatCurrency(item.owedToYou)}</Text>
          )}
        </View>
      </View>

      <View style={styles.participants}>
        <Text style={styles.participantsLabel}>Split between:</Text>
        <Text style={styles.participantsList}>
          {item.participantNames.join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSettlementItem = ({ item }: { item: Settlement }) => (
    <TouchableOpacity style={styles.settlementCard} activeOpacity={0.7}>
      <View style={styles.settlementHeader}>
        <Text style={styles.settlementIcon}>💸</Text>
        <View style={styles.settlementInfo}>
          <Text style={styles.settlementText}>
            {item.fromUserName} → {item.toUserName}
          </Text>
          <Text style={styles.settlementDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.settlementAmount}>
          <Text style={styles.settlementAmountText}>{formatCurrency(item.amount)}</Text>
          <Text style={[
            styles.settlementStatus,
            item.status === 'completed' ? styles.completed : styles.pending
          ]}>
            {item.status === 'completed' ? '✓ Paid' : '⏳ Pending'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Loading your expenses...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.errorContainer}
      >
        <Text style={styles.errorTitle}>⚠️ Oops!</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>TRY AGAIN</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Balance Summary */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        <View style={styles.balanceSummary}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>You owe</Text>
            <Text style={[styles.balanceAmount, styles.negative]}>
              {formatCurrency(totalOwed)}
            </Text>
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Owed to you</Text>
            <Text style={[styles.balanceAmount, styles.positive]}>
              {formatCurrency(totalOwedToYou)}
            </Text>
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Net balance</Text>
            <Text style={[
              styles.balanceAmount,
              netBalance >= 0 ? styles.positive : styles.negative
            ]}>
              {formatCurrency(Math.abs(netBalance))}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
          <Text style={styles.addButtonText}>➕ ADD EXPENSE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settleButton} onPress={handleSettleUp}>
          <Text style={styles.settleButtonText}>💰 SETTLE UP</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expenses' && styles.activeTab]}
          onPress={() => setActiveTab('expenses')}
        >
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>
            Expenses ({expenses.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settlements' && styles.activeTab]}
          onPress={() => setActiveTab('settlements')}
        >
          <Text style={[styles.tabText, activeTab === 'settlements' && styles.activeTabText]}>
            Settlements ({settlements.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'expenses' ? expenses : settlements}
        renderItem={activeTab === 'expenses' ? renderExpenseItem : renderSettlementItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {activeTab === 'expenses' ? '💰 No Expenses Yet' : '💸 No Settlements'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'expenses'
                ? 'Add your first shared expense to get started'
                : 'No pending or completed settlements'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },

  // Header styles
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 16,
  },
  balanceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  balanceCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#44C76F',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#004D40',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#004D40',
  },
  settleButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#92400E',
    alignItems: 'center',
  },
  settleButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#92400E',
  },

  // Tab navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#004D40',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#004D40',
  },

  // List styles
  listContainer: {
    paddingVertical: 8,
  },

  // Expense card styles
  expenseCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004D40',
  },
  expenseDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004D40',
  },
  settledBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 2,
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paidBy: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  balanceInfo: {
    alignItems: 'flex-end',
  },
  youOwe: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  owedToYou: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  participants: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  participantsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  participantsList: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },

  // Settlement card styles
  settlementCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settlementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settlementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settlementInfo: {
    flex: 1,
  },
  settlementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004D40',
  },
  settlementDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  settlementAmount: {
    alignItems: 'flex-end',
  },
  settlementAmountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004D40',
  },
  settlementStatus: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  pending: {
    color: '#F59E0B',
  },
  completed: {
    color: '#10B981',
  },

  // Loading and error states
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

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
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
  },
});

export default ExpensesScreen;