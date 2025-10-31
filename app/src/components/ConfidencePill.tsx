import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import { ConfidenceBand } from '../types/ScanEntry';

interface ConfidencePillProps {
  band: ConfidenceBand;
}

const confidenceMap = {
  high: {
    text: 'สูง',
    backgroundColor: '#E7F8EE',
    textColor: '#1B5E20',
  },
  medium: {
    text: 'ปานกลาง',
    backgroundColor: '#FFF6DB',
    textColor: '#B7791F',
  },
  low: {
    text: 'ต่ำ',
    backgroundColor: '#FDECEC',
    textColor: '#C62828',
  },
};

export const ConfidencePill: React.FC<ConfidencePillProps> = ({ band }) => {
  const config = confidenceMap[band];
  
  return (
    <Text style={[styles.pill, { backgroundColor: config.backgroundColor, color: config.textColor }]}>
      ความมั่นใจ: {config.text}
    </Text>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: 16,
    fontSize: theme.type.caption,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
});
