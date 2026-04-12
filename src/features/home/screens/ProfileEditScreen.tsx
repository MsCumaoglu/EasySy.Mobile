import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useRTL} from '../../../core/hooks/useRTL';

const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const {colors, spacing, radius, typography} = useTheme();
  const {isRTL, flipIcon} = useRTL();

  const [name, setName] = useState('Google User');
  const [phone, setPhone] = useState('+1 234 567 8900');

  const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: colors.background},
    saveBtn: {
      marginLeft: 'auto',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      marginRight: isRTL ? 'auto' : 0,
    },
    saveBtnText: {
      color: colors.white,
      fontWeight: '700',
    },
    scrollContent: {paddingBottom: spacing.xxl, paddingTop: spacing.md},
    googleBanner: {
      marginHorizontal: spacing.xl,
      backgroundColor: '#E8F4FD',
      padding: spacing.lg,
      borderRadius: radius.xl,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    googleIconWrap: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: '#FFFFFF',
      alignItems: 'center', justifyContent: 'center',
      marginRight: isRTL ? 0 : spacing.md,
      marginLeft: isRTL ? spacing.md : 0,
    },
    googleBannerTextWrap: {
      flex: 1,
    },
    googleBannerTitle: {
      ...typography.body,
      fontWeight: '700',
      color: '#1976D2',
    },
    googleBannerSubtitle: {
      ...typography.caption,
      color: '#42A5F5',
      marginTop: 2,
    },
    formGroup: {
      marginHorizontal: spacing.xl,
      marginBottom: spacing.lg,
    },
    label: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      fontWeight: '600',
      textAlign: isRTL ? 'right' : 'left',
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      minHeight: 56,
    },
    inputWrapDisabled: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    inputIcon: {
      fontSize: 20,
      color: colors.textSecondary,
      marginRight: isRTL ? 0 : spacing.md,
      marginLeft: isRTL ? spacing.md : 0,
    },
    input: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      textAlign: isRTL ? 'right' : 'left',
      paddingVertical: spacing.md,
    },
    inputDisabled: {
      color: colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={colors.background === '#F5F5F5' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
      />
      
      <KeyboardAvoidingView 
        style={{flex: 1}} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <ScreenHeader 
          title={t('settings.editProfile', {defaultValue: 'Edit Profile'})}
          containerStyle={{paddingBottom: spacing.md}}
          rightNode={
            <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.saveBtnText}>{t('common.save', {defaultValue: 'Save'})}</Text>
            </TouchableOpacity>
          }
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Google Linked Account Banner */}
          <View style={styles.googleBanner}>
            <View style={styles.googleIconWrap}>
              <Icon name="logo-google" style={{fontSize: 24, color: '#DB4437'}} />
            </View>
            <View style={styles.googleBannerTextWrap}>
              <Text style={styles.googleBannerTitle}>Signed in with Google</Text>
              <Text style={styles.googleBannerSubtitle}>Your email and profile photo are managed by Google.</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('profile.fullName', {defaultValue: 'Full Name'})}</Text>
            <View style={styles.inputWrap}>
              <Icon name="person-outline" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('profile.email', {defaultValue: 'Email Address'})}</Text>
            <View style={[styles.inputWrap, styles.inputWrapDisabled]}>
              <Icon name="mail-outline" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value="google.user@gmail.com"
                editable={false}
                pointerEvents="none"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('profile.phone', {defaultValue: 'Phone Number'})}</Text>
            <View style={styles.inputWrap}>
              <Icon name="call-outline" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileEditScreen;
