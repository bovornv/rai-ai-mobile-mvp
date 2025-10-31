import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from './Card';
import { theme } from '../theme/theme';

interface PriceCardProps {
  crop: 'rice' | 'durian';
  price: number;
  unit: string;
  lastUpdated: string;
}

export const PriceCard: React.FC<PriceCardProps> = ({ 
  crop, 
  price, 
  unit, 
  lastUpdated 
}) => {
  const { t } = useTranslation();

  const getCropName = () => {
    return crop === 'rice' ? t('home.ricePrice') : t('home.durianPrice');
  };

  const formatPrice = (price: number) => {
    try {
      if (typeof price === 'number' && price.toLocaleString) {
        return price.toLocaleString('th-TH');
      }
      return String(price || 0);
    } catch (error) {
      console.error('Error formatting price:', error);
      return String(price || 0);
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{t('home.todayPrice')}</Text>
      <Text style={styles.cropName}>{getCropName()}</Text>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{formatPrice(price)}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      
      <Text style={styles.source}>{t('home.dataSource')}</Text>
      <Text style={styles.lastUpdated}>
        {t('home.lastUpdated')} {lastUpdated}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: theme.type.title,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing(1),
  },
  cropName: {
    fontSize: theme.type.body,
    color: theme.colors.muted,
    marginBottom: theme.spacing(2),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing(2),
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginRight: theme.spacing(1),
  },
  unit: {
    fontSize: theme.type.body,
    color: theme.colors.muted,
  },
  source: {
    fontSize: theme.type.caption,
    color: theme.colors.muted,
    marginBottom: theme.spacing(0.5),
  },
  lastUpdated: {
    fontSize: theme.type.caption,
    color: theme.colors.muted,
  },
});
