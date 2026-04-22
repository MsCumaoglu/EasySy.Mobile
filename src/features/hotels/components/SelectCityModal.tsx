import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useTranslation} from 'react-i18next';
import {useQuery} from '@tanstack/react-query';
import {hotelRepository} from '../services/hotelRepository';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface City {
  id: string;
  name: string;
  count: number;
  country: string;
}

interface SelectCityModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (cityName: string) => void;
  initialValue?: string;
}

const SelectCityModal: React.FC<SelectCityModalProps> = ({
  isVisible,
  onClose,
  onSelect,
  initialValue = '',
}) => {
  const {t, i18n} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  const [query, setQuery] = useState(initialValue);

  const {data: locations = [], isLoading} = useQuery({
    queryKey: ['hotelLocations'],
    queryFn: () => hotelRepository.fetchLocations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const CITIES: City[] = locations.map(loc => {
    const lang = i18n.language;
    const isAr = lang === 'ar';
    const isTr = lang === 'tr';
    const name = isAr ? (loc.nameAr || loc.name) : isTr ? (loc.nameTr || loc.name) : (loc.nameEn || loc.name);
    return {
      id: loc.id,
      name: name,
      count: loc.hotelCount || 0,
      country: loc.country,
    };
  });

  const filteredCities = useMemo(() => {
    if (!query) return CITIES;
    return CITIES.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, CITIES]);

  const renderHighlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <Text style={styles.cityName}>{text}</Text>;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <Text style={styles.cityName}>
        {parts.map((part, i) => (
          <Text
            key={i}
            style={
              part.toLowerCase() === highlight.toLowerCase()
                ? {color: colors.primary, fontWeight: '700'}
                : {}
            }>
            {part}
          </Text>
        ))}
      </Text>
    );
  };

  const renderCityItem = ({item}: {item: City}) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => onSelect(item.name)}
      activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <View style={styles.pinIconWrapper}>
            <Icon name="location" style={styles.cityIcon} />
        </View>
      </View>
      <View style={styles.cityInfo}>
        {renderHighlightText(item.name, query)}
        <Text style={styles.hotelCount}>{item.count} {t('hotels.hotelCountSuffix') || 'Hotels'}</Text>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      height: SCREEN_HEIGHT * 0.85,
      paddingTop: spacing.sm,
    },
    handle: {
      width: 40,
      height: 5,
      backgroundColor: colors.border,
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.md,
    },
    title: {
      ...typography.title,
      fontSize: 20,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    searchContainer: {
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.md,
    },
    searchInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      height: 50,
    },
    searchIcon: {
      fontSize: 22,
      color: colors.textSecondary,
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      fontSize: 16,
    },
    currentLocationContainer: {
      paddingHorizontal: spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    targetIconWrapper: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    targetIcon: {
      fontSize: 20,
      color: colors.primary,
    },
    currentLocationText: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 14,
    },
    sectionTitle: {
      ...typography.subtitle,
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.md,
    },
    cityList: {
      paddingHorizontal: spacing.xl,
    },
    cityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconContainer: {
      marginRight: spacing.md,
    },
    pinIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    cityIcon: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    cityInfo: {
      flex: 1,
    },
    cityName: {
      ...typography.body,
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    hotelCount: {
      ...typography.caption,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.handle} />
              
              <View style={styles.header}>
                <Text style={styles.title}>{t('hotels.selectCity')}</Text>
                <TouchableOpacity onPress={() => onSelect('')}>
                    <Text style={{color: colors.primary, fontWeight: '600', fontSize: 16}}>{t('common.clear') || 'Clear'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                  <Icon name="search-outline" style={styles.searchIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('common.search')}
                    placeholderTextColor={colors.textSecondary}
                    value={query}
                    onChangeText={setQuery}
                    autoFocus={false}
                  />
                </View>
              </View>

              {!query && (
                <TouchableOpacity style={styles.currentLocationContainer} activeOpacity={0.7}>
                  <View style={styles.targetIconWrapper}>
                    <Icon name="locate" style={styles.targetIcon} />
                  </View>
                  <Text style={styles.currentLocationText}>{t('hotels.useCurrentLocation')}</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.sectionTitle}>
                {query ? t('hotels.searchResults') : t('hotels.popularCities')}
              </Text>

              {isLoading ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={filteredCities}
                  keyExtractor={item => item.id}
                  renderItem={renderCityItem}
                  contentContainerStyle={styles.cityList}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SelectCityModal;
