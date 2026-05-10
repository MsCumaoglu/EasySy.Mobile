import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, RouteProp} from '@react-navigation/native';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {RootStackParamList} from '../../../app/navigation/types';
import {adminService} from '../../../core/api/services/adminService';
import {hotelService} from '../../../core/api/services/hotelService';
import ScreenHeader from '../../../shared/components/ScreenHeader';

type RouteProps = RouteProp<RootStackParamList, 'AdminUserDetail'>;

// CONSUMER is permanent — it can never be revoked, so it's not toggleable
const TOGGLEABLE_ROLES = ['HOTEL_OWNER', 'BUS_OPERATOR', 'TOUR_OPERATOR', 'WORKER', 'SUPER_ADMIN'];
const ORG_TYPES = ['HOTEL', 'BUS_COMPANY', 'TOUR_AGENCY'];

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

const AdminUserDetailScreen: React.FC = () => {
  const {params} = useRoute<RouteProps>();
  const {uid} = params;
  const {t} = useTranslation();
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const queryClient = useQueryClient();

  const [imgError, setImgError] = useState(false);

  const {data: profile, isLoading} = useQuery({
    queryKey: ['admin', 'users', uid],
    queryFn: () => adminService.getUserByUid(uid),
    retry: 1,
  });

  const {data: userRoles = [], isLoading: rolesLoading} = useQuery({
    queryKey: ['admin', 'users', uid, 'roles'],
    queryFn: () => adminService.getUserRoles(uid),
    retry: 1,
  });

  const {data: userOrgs = [], isLoading: orgsLoading} = useQuery({
    queryKey: ['admin', 'users', uid, 'orgs'],
    queryFn: () => adminService.getUserOrganizations(uid),
    retry: 1,
  });

  const hasHotelRole = userRoles.includes('HOTEL_OWNER');
  const hasBusRole = userRoles.includes('BUS_OPERATOR');
  const hasTourRole = userRoles.includes('TOUR_OPERATOR');
  const hasProviderRole = hasHotelRole || hasBusRole || hasTourRole;

  const defaultOrgType = hasHotelRole ? 'HOTEL' : hasBusRole ? 'BUS_COMPANY' : hasTourRole ? 'TOUR_AGENCY' : ORG_TYPES[0];
  const [orgType, setOrgType] = useState(defaultOrgType);
  const [orgId, setOrgId] = useState('');
  const [showHotelPicker, setShowHotelPicker] = useState(false);
  const [hotelSearch, setHotelSearch] = useState('');

  // Fetch hotels if orgType is HOTEL
  const {data: hotelsData, isLoading: hotelsLoading} = useQuery({
    queryKey: ['admin', 'hotels', 'list'],
    queryFn: () => hotelService.searchHotels({size: 100}),
    enabled: orgType === 'HOTEL' || (userOrgs.length > 0 && userOrgs[0].orgType === 'HOTEL'),
  });

  const mapMutation = useMutation({
    mutationFn: () => adminService.mapOrganization(uid, orgId, orgType),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin', 'users', uid, 'orgs']});
      setOrgId('');
    },
    onError: (err: any) => Alert.alert(t('common.error'), err.message || 'Failed to map organization.'),
  });

  const unmapMutation = useMutation({
    mutationFn: (targetOrgId: string) => adminService.unmapOrganization(uid, targetOrgId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin', 'users', uid, 'orgs']});
    },
    onError: (err: any) => Alert.alert(t('common.error'), err.message || 'Failed to unmap organization.'),
  });

  const assignRoleMutation = useMutation({
    mutationFn: (role: string) => adminService.assignRole(uid, role),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin', 'users', uid, 'roles']});
    },
    onError: () => Alert.alert(t('common.error'), 'Failed to assign role.'),
  });

  const revokeRoleMutation = useMutation({
    mutationFn: (role: string) => adminService.revokeRole(uid, role),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin', 'users', uid, 'roles']});
    },
    onError: () => Alert.alert(t('common.error'), 'Failed to revoke role.'),
  });

  const handleToggleRole = (role: string) => {
    const hasRole = userRoles.includes(role);
    if (hasRole) {
      Alert.alert(
        t('adminUsers.revokeTitle', {defaultValue: 'Revoke Role'}),
        t('adminUsers.revokeConfirm', {defaultValue: `Remove role "${role}" from this user?`, role}),
        [
          {text: t('common.cancel'), style: 'cancel'},
          {text: t('common.confirm'), style: 'destructive', onPress: () => revokeRoleMutation.mutate(role)},
        ],
      );
    } else {
      assignRoleMutation.mutate(role);
    }
  };

  const isPending = assignRoleMutation.isPending || revokeRoleMutation.isPending;

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    content: {paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl},
    // Profile Card
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.xl,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FCE7DF', // Light orange/pink from design
      padding: spacing.xl,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: spacing.md,
    },
    avatarFallback: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    avatarText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 20,
    },
    profileBody: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
      paddingTop: spacing.lg,
    },
    profileName: {
      ...typography.title,
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    profileEmail: {
      ...typography.body,
      fontSize: 13,
      color: colors.textSecondary,
    },
    metaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    metaItem: {
      width: '47%',
      backgroundColor: '#F3F4F6', // Light gray background
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    metaLabel: {
      ...typography.caption,
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    metaValue: {
      ...typography.body,
      fontSize: 13,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    metaMono: {
      fontFamily: 'monospace',
      fontSize: 11,
    },
    // Section card
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.xl,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionHeader: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      ...typography.body,
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    sectionSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    sectionBody: {
      padding: spacing.xl,
    },
    // Role toggle row
    roleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    roleRowLast: {borderBottomWidth: 0},
    roleLabel: {
      ...typography.body,
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    toggle: {
      width: 48,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: 3,
    },
    toggleKnob: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    // Org row
    orgRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      gap: spacing.md,
    },
    orgBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: radius.md,
      backgroundColor: colors.primary + '15',
    },
    orgBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    orgIdText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
      flex: 1,
    },
    emptyOrgs: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 14,
      fontStyle: 'italic',
    },
    // Mapping form
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 44,
      marginTop: spacing.sm,
    },
    inputText: {
      flex: 1,
      ...typography.body,
      fontSize: 14,
      color: colors.textPrimary,
    },
    mapBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.lg,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.md,
    },
    mapBtnText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    mapBtnDisabled: {
      opacity: 0.5,
    },
    unmapBtn: {
      backgroundColor: '#FEE2E2',
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.md,
    },
    unmapBtnText: {
      color: '#DC2626',
      fontSize: 12,
      fontWeight: '600',
    },
    pickerOverlay: {
      position: 'absolute',
      top: 0, bottom: 0, left: 0, right: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 99,
    },
    pickerSheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: -8},
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 20,
      zIndex: 100,
      maxHeight: '80%',
    },
    pickerDragHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#D1D5DB',
      alignSelf: 'center',
      marginBottom: spacing.xl,
    },
    pickerTitle: {
      ...typography.title,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    pickerSearchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      height: 44,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.xl,
    },
    pickerSearchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      fontSize: 15,
      color: colors.textPrimary,
    },
    pickerListTitle: {
      ...typography.body,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.sm,
    },
    pickerItem: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    pickerItemActive: {
      backgroundColor: '#FEF3C7',
    },
    pickerItemTitle: {
      ...typography.body,
      fontSize: 15,
      color: colors.textPrimary,
    },
    pickerItemSubtitle: {
      ...typography.caption,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });

  if (isLoading || rolesLoading || orgsLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title={params.name || t('adminUsers.userDetail', {defaultValue: 'User Detail'})} />
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title={t('adminUsers.userDetail', {defaultValue: 'User Detail'})} />
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Icon name="person-remove-outline" size={48} color={colors.textSecondary} />
          <Text style={{color: colors.textSecondary, marginTop: spacing.md}}>{t('common.error')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const avatarSeed = profile.email || profile.firebaseUid;
  const avatarBg = getAvatarColor(avatarSeed);
  const displayName = profile.displayName || 'Unnamed User';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScreenHeader title={displayName} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ── Profile Header Card ── */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {profile.avatarUrl && !imgError ? (
              <Image
                source={{uri: profile.avatarUrl}}
                style={styles.avatar}
                onError={() => setImgError(true)}
              />
            ) : (
              <View style={[styles.avatarFallback, {backgroundColor: avatarBg}]}>
                <Text style={styles.avatarText}>{getInitials(profile.displayName)}</Text>
              </View>
            )}
            <View style={{flex: 1}}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
            </View>
          </View>
          <View style={styles.profileBody}>
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>{t('adminUsers.phone', {defaultValue: 'Phone'})}</Text>
                <Text style={styles.metaValue}>{profile.phone || '—'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>{t('adminUsers.language', {defaultValue: 'Language'})}</Text>
                <Text style={styles.metaValue}>{profile.preferredLang?.toUpperCase() || '—'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>{t('adminUsers.currency', {defaultValue: 'Currency'})}</Text>
                <Text style={styles.metaValue}>{profile.preferredCurrency || '—'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>{t('adminUsers.joined', {defaultValue: 'Joined'})}</Text>
                <Text style={styles.metaValue}>{new Date(profile.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.metaItem, {width: '100%'}]}>
                <Text style={styles.metaLabel}>Firebase UID</Text>
                <Text style={[styles.metaValue, styles.metaMono]} numberOfLines={1} ellipsizeMode="middle">
                  {profile.firebaseUid}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Role Manager Card ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('adminUsers.rolesTitle', {defaultValue: 'Roles'})}</Text>
            <Text style={styles.sectionSubtitle}>{t('adminUsers.rolesSubtitle', {defaultValue: 'Toggle to assign or revoke roles'})}</Text>
          </View>
          <View style={styles.sectionBody}>
            {/* CONSUMER — permanent, read-only */}
            <View style={[styles.roleRow, {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border}]}>
              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <View style={{paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#F3F4F6'}}>
                  <Text style={{fontSize: 11, fontWeight: '600', color: '#6B7280'}}>
                    {t('roles.CONSUMER', {defaultValue: 'Consumer'})}
                  </Text>
                </View>
                <Text style={{fontSize: 12, color: colors.textSecondary, fontStyle: 'italic'}}>
                  {t('adminUsers.permanentRole', {defaultValue: 'Permanent'})}
                </Text>
              </View>
              {/* Lock icon — not toggleable */}
              <Icon name="lock-closed-outline" size={18} color={colors.textSecondary} />
            </View>

            {/* Toggleable roles */}
            {TOGGLEABLE_ROLES.map((role, idx) => {
              const hasRole = userRoles.includes(role);
              const {bg, text: tc} = getRoleBadgeColor(role);
              return (
                <View key={role} style={[styles.roleRow, idx === TOGGLEABLE_ROLES.length - 1 && styles.roleRowLast]}>
                  <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10}}>
                    <View style={[{paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: bg}]}>
                      <Text style={{fontSize: 11, fontWeight: '600', color: tc}}>
                        {t(`roles.${role}`, {defaultValue: role})}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggle, {backgroundColor: hasRole ? colors.primary : colors.border}]}
                    onPress={() => handleToggleRole(role)}
                    disabled={isPending}
                    activeOpacity={0.8}>
                    <View style={[styles.toggleKnob, {marginLeft: hasRole ? 'auto' : 0, marginRight: hasRole ? 0 : 'auto'}]} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Organizations Card ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('adminUsers.orgsTitle', {defaultValue: 'Organizations'})}</Text>
            <Text style={styles.sectionSubtitle}>{t('adminUsers.orgsSubtitle', {defaultValue: 'Mapped organizations'})}</Text>
          </View>
          <View style={styles.sectionBody}>
            {userOrgs.length === 0 ? (
              <View>
                <Text style={styles.emptyOrgs}>{t('adminUsers.noOrgs', {defaultValue: 'No organizations mapped'})}</Text>
                {/* Mapper Form */}
                {hasProviderRole ? (
                  <View style={{marginTop: spacing.xl}}>
                    <Text style={[styles.metaLabel, {color: colors.textPrimary}]}>{t('adminUsers.mapNew', {defaultValue: 'Map New Organization'})}</Text>
                    
                    <View style={styles.inputBox}>
                      <Text style={[styles.inputText, {color: colors.textSecondary}]}>
                        {t(`orgTypes.${orgType}`, {defaultValue: orgType})}
                      </Text>
                      <Icon name="chevron-down-outline" size={20} color={colors.textPrimary} />
                    </View>

                    {orgType === 'HOTEL' ? (
                      <TouchableOpacity 
                        style={[styles.inputBox, {backgroundColor: '#F3F4F6', borderWidth: 0}]}
                        onPress={() => setShowHotelPicker(true)}
                        disabled={hotelsLoading}>
                        <Icon name="search-outline" size={18} color="#F97316" style={{marginRight: 8}} />
                        <Text style={[styles.inputText, !orgId && {color: colors.textSecondary}]} numberOfLines={1}>
                          {orgId 
                            ? hotelsData?.content?.find(h => h.id === orgId)?.name || orgId
                            : hotelsLoading ? t('common.loading') : t('adminUsers.searchHotel', {defaultValue: 'Search hotel'})}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.inputBox}>
                        <TextInput
                          style={styles.inputText}
                          value={orgId}
                          onChangeText={setOrgId}
                          placeholder={t('adminUsers.orgIdPlaceholder', {defaultValue: 'Enter Organization ID'})}
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                    )}

                    <TouchableOpacity 
                      style={[styles.mapBtn, (!orgId.trim() || mapMutation.isPending) && styles.mapBtnDisabled]}
                      onPress={() => mapMutation.mutate()}
                      disabled={!orgId.trim() || mapMutation.isPending}>
                      <Text style={styles.mapBtnText}>
                        {mapMutation.isPending ? t('common.loading') : t('adminUsers.mapOrg', {defaultValue: 'Map Organization'})}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 8}}>
                    <Icon name="information-circle-outline" size={16} color={colors.textSecondary} />
                    <Text style={{color: colors.textSecondary, fontSize: 13, flex: 1}}>
                      {t('adminUsers.orgDisabled', {defaultValue: 'Assign a provider role (Hotel Owner, etc.) to map organizations.'})}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              userOrgs.map(org => {
                const hotelName = org.orgType === 'HOTEL' && hotelsData?.content?.find(h => h.id === org.orgId)?.name;
                return (
                  <View key={org.id} style={styles.orgRow}>
                    <View style={styles.orgBadge}>
                      <Text style={styles.orgBadgeText}>{org.orgType}</Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.orgIdText} numberOfLines={1} ellipsizeMode="middle">
                        {hotelName || org.orgId}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.unmapBtn}
                      onPress={() => unmapMutation.mutate(org.orgId)}
                      disabled={unmapMutation.isPending}>
                      <Text style={styles.unmapBtnText}>
                        {unmapMutation.isPending ? '...' : t('adminUsers.unmap', {defaultValue: 'Unmap'})}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Hotel Picker Sheet */}
      {showHotelPicker && (
        <>
          <TouchableOpacity style={styles.pickerOverlay} onPress={() => setShowHotelPicker(false)} activeOpacity={1} />
          <View style={styles.pickerSheet}>
            <View style={styles.pickerDragHandle} />
            <Text style={styles.pickerTitle}>{t('adminUsers.selectHotel', {defaultValue: 'Select Hotel'})}</Text>

            <View style={styles.pickerSearchBox}>
              <Icon name="search-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.pickerSearchInput}
                placeholder={t('common.search', {defaultValue: 'Search'})}
                placeholderTextColor={colors.textSecondary}
                value={hotelSearch}
                onChangeText={setHotelSearch}
                autoCorrect={false}
              />
            </View>

            <Text style={styles.pickerListTitle}>{t('adminUsers.hotels', {defaultValue: 'Hotels'})}</Text>

            <ScrollView showsVerticalScrollIndicator={true}>
              {hotelsData?.content?.filter(h => !hotelSearch || h.name.toLowerCase().includes(hotelSearch.toLowerCase())).map(hotel => {
                const isActive = orgId === hotel.id;
                return (
                  <TouchableOpacity
                    key={hotel.id}
                    style={[styles.pickerItem, isActive && styles.pickerItemActive]}
                    onPress={() => { setOrgId(hotel.id); setShowHotelPicker(false); }}>
                    <Text style={styles.pickerItemTitle}>{hotel.name}</Text>
                    <Text style={styles.pickerItemSubtitle}>{hotel.city}</Text>
                  </TouchableOpacity>
                );
              })}
              {(!hotelsData?.content || hotelsData.content.length === 0) && (
                <View style={styles.pickerItem}>
                  <Text style={styles.pickerItemTitle}>{t('adminUsers.noHotels', {defaultValue: 'No hotels found'})}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default AdminUserDetailScreen;
