import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

type BadgeVariant = 'good' | 'caution' | 'dont' | 'default';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ text, variant = 'default' }) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'good':
        return {
          backgroundColor: theme.colors.badge.goodBg,
          color: theme.colors.badge.goodText,
        };
      case 'caution':
        return {
          backgroundColor: theme.colors.badge.cautionBg,
          color: theme.colors.badge.cautionText,
        };
      case 'dont':
        return {
          backgroundColor: theme.colors.badge.dontBg,
          color: theme.colors.badge.dontText,
        };
      default:
        return {
          backgroundColor: theme.colors.muted,
          color: theme.colors.surface,
        };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
      <Text style={[styles.text, { color: badgeStyle.color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: theme.type.caption,
    fontWeight: '600',
  },
});
