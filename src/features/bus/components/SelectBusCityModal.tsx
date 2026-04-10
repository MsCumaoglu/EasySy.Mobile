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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useTranslation} from 'react-i18next';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface City {
  id: string;
  name: string;
  trips: number;
}

const BUS_CITIES: City[] = [
  {id: '1', name: 'Damascus',    trips: 24},
  {id: '2', name: 'Latakkia',    trips: 18},
  {id: '3', name: 'Aleppo',      trips: 20},
  {id: '4', name: 'Homs',        trips: 14},
  {id: '5', name: 'Tartus',      trips: 10},
  {id: '6', name: 'Hama',        trips: 9},
  {id: '7', name: 'Deir ez-Zor', trips: 7},
  {id: '8', name: 'Suwayda',     trips: 5},
];

interface SelectBusCityModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (cityName: string) => void;
  title?: string;
  initialValue?: string;
}

const SelectBusCityModal: React.FC<SelectBusCityModalProps> = ({
  isVisible,
  onClose,
  onSelect,
  title = 'Select City',
  initialValue = '',
}) => {
  const {colors, spacing, radius, typography} = useTheme();
  const {t} = useTranslation();
  const [query, setQuery] = useState('');

  const filteredCities = useMemo(() => {
    if (!query) return BUS_CITIES;
    return BUS_CITIES.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  const renderHighlight = (text: string) => {
    if (!query.trim()) return <Text style={styles.cityName}>{text}</Text>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <Text style={styles.cityName}>
        {parts.map((part, i) => (
          <Text
            key={i}
            style={
              part.toLowerCase() === query.toLowerCase()
                ? {color: colors.primary, fontWeight: '700'}
                : {}
            }>
            {part}
          </Text>
        ))}
      </Text>
    );
  };

  const styles = StyleSheet.create({
    overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
    content: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      height: SCREEN_HEIGHT * 0.85,
      paddingTop: spacing.sm,
    },
    handle: {
      width: 40, height: 5, backgroundColor: '#E0E0E0',
      borderRadius: 10, alignSelf: 'center', marginBottom: spacing.md,
    },
    header: {alignItems: 'center', paddingBottom: spacing.md},
    titleText: {
      ...typography.title, fontSize: 20,
      color: colors.textPrimary, fontWeight: '700',
    },
    searchBox: {paddingHorizontal: spacing.xl, marginBottom: spacing.md},
    inputRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.surface, borderRadius: radius.lg,
      paddingHorizontal: spacing.md, height: 50,
    },
    searchIcon: {fontSize: 22, color: colors.textSecondary, marginRight: spacing.sm},
    input: {flex: 1, ...typography.body, color: colors.textPrimary, fontSize: 16},
    sectionTitle: {
      ...typography.subtitle, fontSize: 16, fontWeight: '700',
      color: colors.textPrimary, paddingHorizontal: spacing.xl, marginBottom: spacing.md,
    },
    listContent: {paddingHorizontal: spacing.xl},
    cityItem: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    iconWrap: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
      marginRight: spacing.md, borderWidth: 1, borderColor: colors.border,
    },
    cityIcon: {fontSize: 18, color: colors.primary},
    cityInfo: {flex: 1},
    cityName: {...typography.body, fontSize: 16, color: colors.textPrimary, fontWeight: '500'},
    tripsText: {...typography.caption, fontSize: 12, color: colors.textSecondary, marginTop: 2},
  });

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.handle} />

              <View style={styles.header}>
                <Text style={styles.titleText}>{title}</Text>
              </View>

              <View style={styles.searchBox}>
                <View style={styles.inputRow}>
                  <Icon name="search-outline" style={styles.searchIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('common.search')}
                    placeholderTextColor={colors.textSecondary}
                    value={query}
                    onChangeText={setQuery}
                    autoFocus={false}
                  />
                  {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                      <Icon name="close-circle" style={{fontSize: 20, color: colors.textSecondary}} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <Text style={styles.sectionTitle}>
                {query ? t('common.searchResults') : t('common.popularCities')}
              </Text>

              <FlatList
                data={filteredCities}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.cityItem}
                    onPress={() => {
                      onSelect(item.name);
                      setQuery('');
                    }}
                    activeOpacity={0.7}>
                    <View style={styles.iconWrap}>
                      <Icon name="bus-outline" style={styles.cityIcon} />
                    </View>
                    <View style={styles.cityInfo}>
                      {renderHighlight(item.name)}
                      <Text style={styles.tripsText}>{item.trips} {t('bus.tripsPerDay')}</Text>
                    </View>
                    <Icon name="chevron-forward" style={{fontSize: 18, color: colors.textSecondary}} />
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SelectBusCityModal;
