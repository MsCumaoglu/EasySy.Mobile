import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery, useQueries, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {RootStackParamList} from '../../../app/navigation/types';
import {adminService, AdminUserProfile} from '../../../core/api/services/adminService';
import ScreenHeader from '../../../shared/components/ScreenHeader';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'AdminUsers'>;

const ALL_ROLES = ['CONSUMER', 'HOTEL_OWNER', 'BUS_OPERATOR', 'TOUR_OPERATOR', 'WORKER', 'SUPER_ADMIN'];

// Deterministic avatar color from seed string
function getAvatarColor(seed: string): string {
  const palette = ['#F2711C', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#EC4899', '#F59E0B', '#06B6D4'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {hash = seed.charCodeAt(i) + ((hash << 5) - hash);}
  return palette[Math.abs(hash) % palette.length];
}

function getInitials(name: string | null): string {
  if (!name) {return '?';}
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {return (parts[0][0] + parts[1][0]).toUpperCase();}
  return parts[0][0].toUpperCase();
}

function getRoleBadgeColor(role: string): {bg: string; text: string} {
  switch (role) {
    case 'SUPER_ADMIN':  return {bg: '#FEE2E2', text: '#DC2626'};
    case 'HOTEL_OWNER':  return {bg: '#FEF3C7', text: '#D97706'};
    case 'BUS_OPERATOR': return {bg: '#DBEAFE', text: '#2563EB'};
    case 'CONSUMER':     return {bg: '#F3F4F6', text: '#6B7280'};
    default:             return {bg: '#EDE9FE', text: '#7C3AED'};
  }
}

const AdminUsersScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showRolePicker, setShowRolePicker] = useState(false);

  const {data: users = [], isLoading, isError, refetch} = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.getUsers(0, 100),
    retry: 1,
  });

  // Fetch actual roles per user (like the web admin page does)
  const roleQueries = useQueries({
    queries: users.map(u => ({
      queryKey: ['admin', 'user-roles', u.firebaseUid],
      queryFn: () => adminService.getUserRoles(u.firebaseUid),
      enabled: !!u.firebaseUid,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: string) => adminService.deleteUser(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin', 'users']});
    },
    onError: () => {
      Alert.alert(t('common.error'), 'Failed to delete user.');
    },
  });

  const handleDelete = (uid: string, name: string) => {
    Alert.alert(
      t('adminUsers.deleteTitle', {defaultValue: 'Delete User'}),
      t('adminUsers.deleteConfirm', {defaultValue: `Are you sure you want to delete "${name}"?`, name}),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () => deleteMutation.mutate(uid),
        },
      ],
    );
  };

  const filtered = useMemo(() => {
    return users.filter((u, idx) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        (u.displayName?.toLowerCase().includes(q) ?? false) ||
        (u.email?.toLowerCase().includes(q) ?? false);
      // Use fetched roles; fall back to profile role field
      const fetchedRoles = roleQueries[idx]?.data ?? [];
      const actualRoles = fetchedRoles.length > 0 ? fetchedRoles : [u.role ?? 'CONSUMER'];
      const matchRole = !roleFilter || actualRoles.includes(roleFilter);
      return matchSearch && matchRole;
    });
  }, [users, roleQueries, search, roleFilter]);

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    toolbar: {
      flexDirection: 'row',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      gap: spacing.md,
      alignItems: 'center',
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 42,
    },
    searchInput: {
      flex: 1,
      ...typography.body,
      fontSize: 14,
      color: colors.textPrimary,
      marginLeft: spacing.sm,
    },
    filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: roleFilter ? colors.primary : colors.border,
      paddingHorizontal: spacing.md,
      height: 42,
      gap: 4,
    },
    filterBtnText: {
      ...typography.body,
      fontSize: 13,
      color: roleFilter ? colors.primary : colors.textSecondary,
      fontWeight: '500',
    },
    statsBar: {
      flexDirection: 'row',
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.sm,
      alignItems: 'center',
    },
    statsText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },
    list: {paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl},
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: spacing.md,
    },
    avatarFallback: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    avatarText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    userInfo: {flex: 1},
    userName: {
      ...typography.body,
      fontWeight: '700',
      fontSize: 15,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    userEmail: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 13,
    },
    deleteBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#FEE2E2',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rolesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: spacing.sm,
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    roleBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },
    emptyBox: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl * 2,
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.md,
    },
    // Role Picker dropdown
    pickerOverlay: {
      position: 'absolute',
      top: 0, bottom: 0, left: 0, right: 0,
      zIndex: 99,
    },
    pickerSheet: {
      position: 'absolute',
      right: spacing.xl,
      top: 120,
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 10,
      zIndex: 100,
      minWidth: 200,
      overflow: 'hidden',
    },
    pickerItem: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    pickerItemText: {
      ...typography.body,
      fontSize: 14,
      color: colors.textPrimary,
    },
    pickerItemActive: {color: colors.primary, fontWeight: '700'},
  });

  const renderUser = ({item: u}: {item: AdminUserProfile}) => {
    const displayName = u.displayName || 'Unnamed User';
    const avatarSeed = u.email || u.firebaseUid;
    // Resolve actual roles from per-user role query
    const originalIdx = users.findIndex(orig => orig.firebaseUid === u.firebaseUid);
    const fetchedRoles = originalIdx >= 0 ? (roleQueries[originalIdx]?.data ?? []) : [];
    const actualRoles = fetchedRoles.length > 0 ? fetchedRoles : [u.role ?? 'CONSUMER'];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AdminUserDetail', {uid: u.firebaseUid, name: displayName})}
        activeOpacity={0.8}>
        <View style={styles.cardTop}>
          {u.avatarUrl ? (
            <Image source={{uri: u.avatarUrl}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, {backgroundColor: getAvatarColor(avatarSeed)}]}>
              <Text style={styles.avatarText}>{getInitials(u.displayName)}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(u.firebaseUid, displayName)}
            disabled={deleteMutation.isPending}>
            <Icon name="trash-outline" size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
        {/* All actual roles as badges */}
        <View style={styles.rolesRow}>
          {actualRoles.map(role => {
            const {bg, text: tc} = getRoleBadgeColor(role);
            return (
              <View key={role} style={[styles.roleBadge, {backgroundColor: bg}]}>
                <Text style={[styles.roleBadgeText, {color: tc}]}>
                  {t(`roles.${role}`, {defaultValue: role})}
                </Text>
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScreenHeader title={t('adminUsers.title', {defaultValue: 'User Management'})} />

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Icon name="search-outline" size={16} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('adminUsers.searchPlaceholder', {defaultValue: 'Search by name or email...'})}
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowRolePicker(p => !p)}>
          <Icon name="funnel-outline" size={14} color={roleFilter ? colors.primary : colors.textSecondary} />
          <Text style={styles.filterBtnText}>
            {roleFilter ? t(`roles.${roleFilter}`, {defaultValue: roleFilter}) : t('adminUsers.allRoles', {defaultValue: 'All'})}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {t('adminUsers.showingCount', {defaultValue: `${filtered.length} of ${users.length} users`, shown: filtered.length, total: users.length})}
        </Text>
      </View>

      {/* Loading */}
      {isLoading && (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <View style={styles.emptyBox}>
          <Icon name="cloud-offline-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>{t('common.error')}</Text>
          <TouchableOpacity onPress={() => refetch()} style={{marginTop: spacing.md}}>
            <Text style={{color: colors.primary, fontWeight: '600'}}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {!isLoading && !isError && (
        <FlatList
          data={filtered}
          keyExtractor={item => item.firebaseUid}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon name="people-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>{t('adminUsers.noUsers', {defaultValue: 'No users found'})}</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Role Picker dropdown */}
      {showRolePicker && (
        <>
          <TouchableOpacity style={styles.pickerOverlay} onPress={() => setShowRolePicker(false)} />
          <View style={styles.pickerSheet}>
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => { setRoleFilter(''); setShowRolePicker(false); }}>
              <Text style={[styles.pickerItemText, !roleFilter && styles.pickerItemActive]}>
                {t('adminUsers.allRoles', {defaultValue: 'All Roles'})}
              </Text>
            </TouchableOpacity>
            {ALL_ROLES.map(role => (
              <TouchableOpacity
                key={role}
                style={styles.pickerItem}
                onPress={() => { setRoleFilter(role); setShowRolePicker(false); }}>
                <Text style={[styles.pickerItemText, roleFilter === role && styles.pickerItemActive]}>
                  {t(`roles.${role}`, {defaultValue: role})}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default AdminUsersScreen;
