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

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface City {
  id: string;
  name: string;
  count: number;
}

const CITIES: City[] = [
  {id: '1', name: 'Damascus', count: 18},
  {id: '2', name: 'Damascus', count: 15},
  {id: '3', name: 'Hama', count: 9},
  {id: '4', name: 'Hasakaha', count: 5},
  {id: '5', name: 'Ariha', count: 8},
];

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
  const {colors, spacing, radius, typography} = useTheme();
  const [query, setQuery] = useState(initialValue);

  const filteredCities = useMemo(() => {
    if (!query) return CITIES;
    return CITIES.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

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
        <Text style={styles.hotelCount}>{item.count} Hotels</Text>
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
      backgroundColor: '#E0E0E0',
      borderRadius: 10,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    header: {
      alignItems: 'center',
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
      backgroundColor: '#F5F5F7',
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
      borderBottomColor: '#F0F0F0',
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
        borderColor: '#EEE',
    },
    cityIcon: {
      fontSize: 18,
      color: '#BDBDBD',
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
                <Text style={styles.title}>Select City</Text>
              </View>

              <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                  <Icon name="search-outline" style={styles.searchIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Search"
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
                  <Text style={styles.currentLocationText}>Use current location</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.sectionTitle}>
                {query ? 'Search Results' : 'Popular Cities'}
              </Text>

              <FlatList
                data={filteredCities}
                keyExtractor={item => item.id}
                renderItem={renderCityItem}
                contentContainerStyle={styles.cityList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SelectCityModal;
