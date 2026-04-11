import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom, useAtomValue} from 'jotai';
import {BusStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useRTL} from '../../../core/hooks/useRTL';
import {busSearchParamsAtom, busResultsAtom} from '../state/busAtoms';
import {busMockService} from '../services/busMockService';
import BusTripCard from '../components/BusTripCard';
import Loader from '../../../shared/components/Loader';
import Icon from 'react-native-vector-icons/Ionicons';

type BusResultsNavProp = NativeStackNavigationProp<BusStackParamList, 'BusResults'>;

const BusResultsScreen: React.FC = () => {
  const navigation = useNavigation<BusResultsNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography, isDark} = useTheme();
  const {isRTL} = useRTL();
  const params = useAtomValue(busSearchParamsAtom);
  const [results, setResults] = useAtom(busResultsAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await busMockService.searchTrips(params);
        setResults(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params, setResults]);

  // Format date for subtitle
  const dateStr = params.date
    ? new Date(params.date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})
    : '---';

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},

    /* ── Header (matches HotelResultsScreen) ── */
    header: {
      backgroundColor: colors.card,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    headerLeft: {flex: 1},
    routeTitle: {
      ...typography.title,
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: spacing.sm,
    },
    subtitleIcon: {fontSize: 13, color: colors.textSecondary},
    subtitleText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 13,
    },
    subtitleSep: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 13,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnIcon: {fontSize: 26, color: colors.primary},

    /* ── Controls row ── */
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    tripCountText: {
      ...typography.subtitle,
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    controlsRight: {flexDirection: 'row', gap: spacing.md},
    controlBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
      paddingVertical: 7,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    controlBtnText: {
      ...typography.caption,
      fontSize: 13,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    controlBtnIcon: {fontSize: 14, color: colors.textPrimary},

    list: {padding: spacing.xl},
    emptyContainer: {
      flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80,
    },
    emptyEmoji: {fontSize: 50, marginBottom: spacing.lg, color: colors.textSecondary},
    emptyText: {...typography.subtitle, color: colors.textSecondary},
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.routeTitle}>
                {params.from && params.to
                  ? `${params.from} → ${params.to}`
                  : t('bus.results')}
              </Text>
              <View style={styles.subtitleRow}>
                <Icon name="calendar-outline" style={styles.subtitleIcon} />
                <Text style={styles.subtitleText}>{dateStr}</Text>
                <Text style={styles.subtitleSep}>|</Text>
                <Icon name="people-outline" style={styles.subtitleIcon} />
                <Text style={styles.subtitleText}>{params.passengers}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
              <Icon name="close" style={styles.closeBtnIcon} />
            </TouchableOpacity>
          </View>
        </View>
        <Loader message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.routeTitle}>
              {params.from && params.to
                ? `${params.from} → ${params.to}`
                : t('bus.results')}
            </Text>
            <View style={styles.subtitleRow}>
              <Icon name="calendar-outline" style={styles.subtitleIcon} />
              <Text style={styles.subtitleText}>{dateStr}</Text>
              <Text style={styles.subtitleSep}>|</Text>
              <Icon name="people-outline" style={styles.subtitleIcon} />
              <Text style={styles.subtitleText}>{params.passengers}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Icon name="close" style={styles.closeBtnIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Trip count + Filter / Sort ── */}
      <View style={styles.controlsRow}>
        <Text style={styles.tripCountText}>
          {t('bus.tripList')} ({results.length})
        </Text>
        <View style={styles.controlsRight}>
          <TouchableOpacity style={styles.controlBtn} activeOpacity={0.75}>
            <Text style={styles.controlBtnText}>{t('common.filter')}</Text>
            <Icon name="funnel-outline" style={styles.controlBtnIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} activeOpacity={0.75}>
            <Text style={styles.controlBtnText}>{t('common.sort')}</Text>
            <Icon name="swap-vertical-outline" style={styles.controlBtnIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <BusTripCard trip={item} onPress={() => {}} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bus-outline" style={styles.emptyEmoji} />
            <Text style={styles.emptyText}>{t('bus.noTrips')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default BusResultsScreen;
