import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Card } from '../components/Card';
import { theme } from '../theme/theme';

interface SettingsScreenProps {
  navigation?: any;
}

// ——— Local i18n (short, friendly) ———
const thText = {
  languageHeader: 'ภาษา',
  thai: 'ไทย',
  english: 'English',
  fontHeader: 'ขนาดตัวอักษร',
  preview: 'ทดสอบข้อความ',
  networkHeader: 'สถานะอินเทอร์เน็ต',
  online: 'ออนไลน์',
  offline: 'ออฟไลน์',
  storageHeader: 'พื้นที่จัดเก็บ',
  clearCache: 'ล้างข้อมูลแคช',
  confirmClearTitle: 'ล้างข้อมูลทั้งหมด',
  confirmClearMsg: 'คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมด?',
  confirm: 'ยืนยัน',
  cancel: 'ยกเลิก',
  appInfoHeader: 'ข้อมูลแอป',
  version: 'เวอร์ชัน',
  appName: 'ชื่อแอป',
  rateApp: 'ให้คะแนนแอป',
  languageHelper: 'เปลี่ยนภาษาได้ทันที',
  fontHelper: 'ปรับขนาดตัวอักษรทั่วแอป',
  networkHelper: 'อัปเดตอัตโนมัติตามสถานะเครือข่าย',
  storageHelper: 'ล้างข้อมูลชั่วคราวเพื่อเพิ่มพื้นที่',
};

const enText = {
  languageHeader: 'Language',
  thai: 'Thai',
  english: 'English',
  fontHeader: 'Font Size',
  preview: 'Sample text',
  networkHeader: 'Network',
  online: 'Online',
  offline: 'Offline',
  storageHeader: 'Storage',
  clearCache: 'Clear Cache',
  confirmClearTitle: 'Clear All Data',
  confirmClearMsg: 'Are you sure you want to clear all data?',
  confirm: 'Confirm',
  cancel: 'Cancel',
  appInfoHeader: 'App Info',
  version: 'Version',
  appName: 'App Name',
  rateApp: 'Rate App',
  languageHelper: 'Switch language instantly',
  fontHelper: 'Adjust text size across the app',
  networkHelper: 'Updates automatically with connectivity',
  storageHelper: 'Clear temporary data to free space',
};

function useLanguage() {
  const [lang, setLang] = useState<'th' | 'en'>('th');
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('app.language');
      if (saved === 'th' || saved === 'en') setLang(saved);
    })();
  }, []);
  const setLanguage = async (l: 'th' | 'en') => {
    setLang(l);
    await AsyncStorage.setItem('app.language', l);
    try { DeviceEventEmitter.emit('app.languageChanged', l); } catch {}
  };
  const t = lang === 'th' ? thText : enText;
  return { lang, setLanguage, t };
}

type FontSizeKey = 'small' | 'medium' | 'large';
function useFontSize() {
  const [size, setSize] = useState<FontSizeKey>('medium');
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('app.fontSize');
      if (saved === 'small' || saved === 'medium' || saved === 'large') setSize(saved);
    })();
  }, []);
  const setFontSize = async (s: FontSizeKey) => {
    setSize(s);
    await AsyncStorage.setItem('app.fontSize', s);
    try { DeviceEventEmitter.emit('app.fontSizeChanged', s); } catch {}
  };
  const textStyle = useMemo(() => {
    switch (size) {
      case 'small':
        return { fontSize: 16 };
      case 'large':
        return { fontSize: 22 };
      default:
        return { fontSize: 18 };
    }
  }, [size]);
  return { size, setFontSize, textStyle };
}

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const { lang, setLanguage, t } = useLanguage();
  const { size, setFontSize, textStyle } = useFontSize();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected));
    });
    NetInfo.fetch().then((s) => setOnline(Boolean(s.isConnected))).catch(() => setOnline(true));
    return () => { try { sub && sub(); } catch {} };
  }, []);

  function confirmClear() {
    Alert.alert(t.confirmClearTitle, t.confirmClearMsg, [
      { text: t.cancel, style: 'cancel' },
      { text: t.confirm, style: 'destructive', onPress: async () => {
        try {
          await AsyncStorage.clear();
          Alert.alert(t.confirm, 'OK');
        } catch (e) {
          Alert.alert('Error', String(e));
        }
      }},
    ]);
  }

  function openStore() {
    const pkg = 'com.raiai.mobile';
    const url = `https://play.google.com/store/apps/details?id=${pkg}`;
    Linking.openURL(url).catch(() => {});
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={[styles.sectionHeader]}>{t.languageHeader}</Text>
          <View style={styles.rowBetween}>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                onPress={() => setLanguage('th')}
                style={[styles.pill, lang === 'th' && styles.pillActive]}
              >
                <Text style={[styles.pillText, lang === 'th' && styles.pillTextActive]}>ไทย</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLanguage('en')}
                style={[styles.pill, styles.pillGap, lang === 'en' && styles.pillActive]}
              >
                <Text style={[styles.pillText, lang === 'en' && styles.pillTextActive]}>English</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.helper}>{t.languageHelper}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>{t.fontHeader}</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity onPress={() => setFontSize('small')} style={[styles.pill, size === 'small' && styles.pillActive]}>
              <Text style={[styles.pillText, size === 'small' && styles.pillTextActive]}>A–</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSize('medium')} style={[styles.pill, styles.pillGap, size === 'medium' && styles.pillActive]}>
              <Text style={[styles.pillText, size === 'medium' && styles.pillTextActive]}>A</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFontSize('large')} style={[styles.pill, styles.pillGap, size === 'large' && styles.pillActive]}>
              <Text style={[styles.pillText, size === 'large' && styles.pillTextActive]}>A+</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 10, backgroundColor: '#f8faf9', borderRadius: 12, padding: 12 }}>
            <Text style={[{ color: '#22332a' }, textStyle]}>{t.preview}</Text>
          </View>
          <Text style={styles.helper}>{t.fontHelper}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>{t.networkHeader}</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.valueText, { color: online ? '#0f7a3a' : '#a12b2b' }]}>
              {online ? `🟢 ${t.online}` : `🔴 ${t.offline}`}
            </Text>
          </View>
          <Text style={styles.helper}>{t.networkHelper}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>{t.storageHeader}</Text>
          <TouchableOpacity onPress={confirmClear} style={styles.outlineButton}>
            <Text style={styles.outlineText}>{t.clearCache}</Text>
          </TouchableOpacity>
          <Text style={styles.helper}>{t.storageHelper}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>{t.appInfoHeader}</Text>
          <View style={styles.rowBetween}><Text style={styles.label}> {t.version} </Text><Text style={styles.valueText}>1.0.0</Text></View>
          <View style={styles.rowBetween}><Text style={styles.label}> {t.appName} </Text><Text style={styles.valueText}>Rai AI</Text></View>
          <TouchableOpacity onPress={openStore} style={[styles.primaryButton, { marginTop: 10 }]}>
            <Text style={styles.primaryText}>{t.rateApp}</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: theme.spacing(2),
  },
  card: { marginBottom: theme.spacing(2) },
  sectionHeader: { fontSize: 20, fontWeight: '800', color: '#1A7F3E', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f1f5f2', borderWidth: 1, borderColor: '#e3ebe6' },
  pillGap: { marginLeft: 8 },
  pillActive: { backgroundColor: '#1A7F3E', borderColor: '#1A7F3E' },
  pillText: { fontSize: 16, fontWeight: '700', color: '#0f3c22' },
  pillTextActive: { color: 'white' },
  label: { fontSize: 16, color: '#4b5b51' },
  valueText: { fontSize: 18, fontWeight: '700', color: '#22332a' },
  helper: { marginTop: 6, color: '#7a8f81' },
  outlineButton: { marginTop: 8, borderWidth: 2, borderColor: '#1A7F3E', paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  outlineText: { color: '#1A7F3E', fontWeight: '800', fontSize: 18 },
  primaryButton: { backgroundColor: '#1A7F3E', paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  primaryText: { color: 'white', fontWeight: '800', fontSize: 18 },
});
