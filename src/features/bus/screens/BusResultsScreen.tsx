import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {useAtom, useAtomValue} from 'jotai';
import {BusStackParamList} from '../../../app/navigation/types';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {busSearchParamsAtom, busResultsAtom} from '../state/busAtoms';
import {busMockService} from '../services/busMockService';
import BusTripCard from '../components/BusTripCard';
import Loader from '../../../shared/components/Loader';
import Icon from 'react-native-vector-icons/Ionicons';

type BusResultsNavProp = NativeStackNavigationProp<BusStackParamList, 'BusResults'>;

const BusResultsScreen: React.FC = () => {
  const navigation = useNavigation<BusResultsNavProp>();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
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

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    header: {
      backgroundColor: colors.card,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 4,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    backIcon: {fontSize: 22, color: colors.textPrimary},
    headerTitle: {...typography.title, color: colors.textPrimary},
    routeSubtitle: {
      ...typography.body,
      color: colors.textSecondary,
      marginLeft: 38 + spacing.md,
    },
    routeHighlight: {
      color: colors.primary,
      fontWeight: '700',
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
    },
    filterChip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipText: {...typography.caption, color: colors.textSecondary, fontWeight: '600'},
    routeArrow: {fontSize: 12, color: colors.textSecondary},
    list: {padding: spacing.xl},
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
    },
    emptyEmoji: {fontSize: 50, marginBottom: spacing.lg, color: colors.textSecondary},
    emptyText: {...typography.subtitle, color: colors.textSecondary},
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('bus.results')}</Text>
          </View>
        </View>
        <Loader message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.card}
      />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('bus.results')}</Text>
        </View>
        {(params.from || params.to) && (
          <Text style={styles.routeSubtitle}>
            {params.from && (
              <Text style={styles.routeHighlight}>{params.from}</Text>
            )}
            {params.from && params.to && <Icon name="arrow-forward" style={styles.routeArrow} />}
            {params.to && (
              <Text style={styles.routeHighlight}>{params.to}</Text>
            )}
            {' · '}
            {results.length} trips found
          </Text>
        )}
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {['All', 'VIP', 'Express', 'Standard'].map(f => (
          <TouchableOpacity key={f} style={styles.filterChip}>
            <Text style={styles.filterChipText}>{f}</Text>
          </TouchableOpacity>
        ))}
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
