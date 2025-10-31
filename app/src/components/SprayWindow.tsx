import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from './Card';
import { Badge } from './Badge';
import { theme } from '../theme/theme';

type SprayWindowStatus = 'good' | 'caution' | 'dont';

interface SprayWindowProps {
  status: SprayWindowStatus;
  reason?: string;
  nextUpdate?: string;
  location?: string;
}

export const SprayWindow: React.FC<SprayWindowProps> = ({ 
  status, 
  reason = '', 
  nextUpdate = '',
  location 
}) => {
  const { t } = useTranslation();

  const getStatusText = () => {
    switch (status) {
      case 'good':
        return t('home.sprayWindowGood');
      case 'caution':
        return t('home.sprayWindowCaution');
      case 'dont':
        return t('home.sprayWindowDont');
      default:
        return t('home.sprayWindowGood');
    }
  };

  const getBadgeVariant = (): 'good' | 'caution' | 'dont' => {
    switch (status) {
      case 'good':
        return 'good';
      case 'caution':
        return 'caution';
      case 'dont':
        return 'dont';
      default:
        return 'good';
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.sprayWindow')}</Text>
        <Badge text={getStatusText()} variant={getBadgeVariant()} />
      </View>
      
      {location && (
        <Text style={styles.location}>
          📍 {location}
        </Text>
      )}
      
      {reason && (
        <Text style={styles.reason}>{reason}</Text>
      )}
      
      {nextUpdate && (
        <Text style={styles.nextUpdate}>
          {t('home.lastUpdated')} {nextUpdate}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  title: {
    fontSize: theme.type.title,
    fontWeight: '600',
    color: theme.colors.text,
  },
  location: {
    fontSize: theme.type.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing(1),
    fontWeight: '500',
  },
  reason: {
    fontSize: theme.type.body,
    color: theme.colors.muted,
    marginBottom: theme.spacing(1),
  },
  nextUpdate: {
    fontSize: theme.type.caption,
    color: theme.colors.muted,
  },
});
