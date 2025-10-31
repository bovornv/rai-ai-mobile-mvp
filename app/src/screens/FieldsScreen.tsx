import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';
import { FieldService } from '../services/FieldService';
import { Field, FieldFormData } from '../types/Field';
import { formatThaiDateBE } from '../utils/dateTH';

interface FieldsScreenProps {
  navigation?: any;
}

export const FieldsScreen: React.FC<FieldsScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [field, setField] = useState<Field | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FieldFormData>({
    name: '',
    crop: 'rice',
    areaRai: 1,
    plantedAt: new Date().toISOString().split('T')[0],
    useForWeather: true,
    location: null,
  });

  useEffect(() => {
    loadField();
  }, []);

  const loadField = async () => {
    try {
      setLoading(true);
      // Prefer the single-field storage used by FieldFormScreen
      let fieldData: Field | null = null;
      try {
        const raw = await AsyncStorage.getItem('field');
        if (raw) fieldData = JSON.parse(raw);
      } catch {}
      if (!fieldData) {
        fieldData = await FieldService.getField();
      }
      if (fieldData) {
        setField(fieldData);
        // Safely parse plantedAt date - handle null/undefined/invalid dates
        let plantedAtDate = new Date().toISOString().split('T')[0];
        try {
          if (fieldData.plantedAt && typeof fieldData.plantedAt === 'string') {
            const parsed = fieldData.plantedAt.split('T')[0];
            if (parsed && parsed.length > 0) {
              plantedAtDate = parsed;
            }
          }
        } catch (dateError) {
          console.error('Error parsing plantedAt date:', dateError);
        }
        setFormData({
          name: fieldData.name || '',
          crop: fieldData.crop || 'rice',
          areaRai: fieldData.areaRai || 1,
          plantedAt: plantedAtDate,
          useForWeather: fieldData.useForWeather !== undefined ? fieldData.useForWeather : true,
          location: fieldData.location || null,
        });
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error loading field:', error);
      Alert.alert(t('common.error'), 'Failed to load field data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const validation = FieldService.validateField(formData);
      if (!validation.isValid) {
        Alert.alert(t('common.error'), validation.errors.join('\n'));
        return;
      }

      if (field) {
        await FieldService.updateField(formData, formData.location || undefined);
      } else {
        await FieldService.createField(formData, formData.location || undefined);
      }

      await loadField();
      setIsEditing(false);
      Alert.alert(t('common.ok'), t('fields.messages.saved') || 'Field saved successfully');
    } catch (error) {
      console.error('Error saving field:', error);
      Alert.alert(t('common.error'), 'Failed to save field');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      t('common.delete') || 'Delete',
      t('fields.messages.confirmDelete') || 'Are you sure you want to delete this field?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await FieldService.deleteField();
              setField(null);
              setIsEditing(true);
              setFormData({
                name: '',
                crop: 'rice',
                areaRai: 1,
                plantedAt: new Date().toISOString().split('T')[0],
                useForWeather: true,
                location: null,
              });
              Alert.alert(t('common.ok'), t('fields.messages.deleted') || 'Field deleted');
            } catch (error) {
              console.error('Error deleting field:', error);
              Alert.alert(t('common.error'), 'Failed to delete field');
            }
          },
        },
      ]
    );
  };

  const handleLocationPress = () => {
    // Navigate to location picker if available
    if (navigation) {
      navigation.navigate('FieldLocationPicker', {
        onSelect: (location: any) => {
          setFormData({ ...formData, location });
        },
      });
    } else {
      Alert.alert(t('common.info'), 'Location picker will be available soon');
    }
  };

  const calculateProgress = () => {
    if (!field || !field.plantedAt) return { days: 0, totalDays: 70, percentage: 0 };
    return FieldService.calculateProgress(field.plantedAt);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  const progress = field ? calculateProgress() : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {!field && !isEditing ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>🌾 {t('fields.actions.addField') || 'Add Field'}</Text>
            {/* Removed confusing i18n key text */}
            <Button
              title={t('fields.actions.addField') || 'Add Field'}
              onPress={() => navigation?.navigate?.('FieldForm', { mode: 'add' })}
              style={styles.addButton}
            />
            <Text style={styles.tipText}>• ใช้ชื่อจำง่าย • เลือกพืช • ใส่ขนาดไร่ • วันที่ปลูก</Text>
          </Card>
        ) : (
          <>
                <Card style={styles.card}>
                  <View style={styles.fieldHeader}>
                    <Text style={styles.fieldName}>{field?.name}</Text>
                    <View style={styles.fieldActions}>
                      <TouchableOpacity onPress={() => navigation?.navigate?.('FieldForm', { mode: 'edit' })}>
                        <Text style={styles.editButton}>{t('common.edit')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.fieldInfo}>
                    <Text style={styles.fieldLabel}>พืช</Text>
                    <Text style={styles.fieldValue}>
                      {field?.crop === 'rice' ? t('home.rice') : t('home.durian')}
                    </Text>
                  </View>

                  <View style={styles.fieldInfo}>
                    <Text style={styles.fieldLabel}>ขนาด (ไร่)</Text>
                    <Text style={styles.fieldValue}>
                      {field?.areaRai} ไร่
                    </Text>
                  </View>

                  {field?.plantedAt && (
                    <View style={styles.fieldInfo}>
                      <Text style={styles.fieldLabel}>วันที่ปลูก</Text>
                      <Text style={styles.fieldValue}>
                        {(() => {
                          try {
                            const d = new Date(field.plantedAt);
                            return d.toLocaleDateString('th-TH-u-ca-buddhist', { dateStyle: 'long' });
                          } catch {
                            return field.plantedAt;
                          }
                        })()}
                      </Text>
                    </View>
                  )}

                  {field?.location && (
                    <View style={styles.fieldInfo}>
                      <Text style={styles.fieldLabel}>{t('fields.form.location')}</Text>
                      <Text style={styles.fieldValue}>
                        {field.location.subdistrict}, {field.location.province}
                      </Text>
                    </View>
                  )}

                  {progress && (
                  <View style={styles.progressContainer}>
                      <Text style={styles.progressLabel}>
                        {(() => {
                          const days = Math.max(0, Math.round(progress.days));
                          const total = Math.max(days, Math.round(progress.totalDays));
                          const left = Math.max(0, total - days);
                          const th = i18n.language === 'th';
                          return th
                            ? `อายุพืช: ${days} วัน • เหลืออีก ${left} วัน`
                            : `Crop age: ${days} days • ${left} days left`;
                        })()}
                      </Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progress.percentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.round(progress.percentage)}%
                      </Text>
                    </View>
                  )}

                  <View style={styles.buttonGroup}>
                    <Button
                      title={t('common.edit')}
                      onPress={() => navigation?.navigate?.('FieldForm', { mode: 'edit' })}
                      style={styles.editButtonFull}
                    />
                    <Button
                      title={t('common.delete')}
                      onPress={handleDelete}
                      variant="outline"
                      style={styles.deleteButton}
                    />
                  </View>
                </Card>
              </>
          
        )}
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
  loadingText: {
    fontSize: theme.type.body,
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing(4),
  },
  emptyTitle: {
    fontSize: theme.type.title,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing(1),
  },
  emptyText: {
    fontSize: theme.type.body,
    color: theme.colors.muted,
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: theme.type.body,
    color: theme.colors.muted,
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },
  addButton: {
    marginTop: theme.spacing(2),
  },
  tipText: {
    marginTop: theme.spacing(1),
    color: theme.colors.muted,
    fontSize: theme.type.caption,
    textAlign: 'center',
  },
  card: {
    marginBottom: theme.spacing(2),
  },
  cardTitle: {
    fontSize: theme.type.title,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing(2),
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  fieldName: {
    fontSize: theme.type.title,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  fieldActions: {
    flexDirection: 'row',
  },
  editButton: {
    fontSize: theme.type.body,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  fieldInfo: {
    marginBottom: theme.spacing(2),
  },
  fieldLabel: {
    fontSize: theme.type.caption,
    color: theme.colors.muted,
    marginBottom: theme.spacing(0.5),
  },
  fieldValue: {
    fontSize: theme.type.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  progressLabel: {
    fontSize: theme.type.body,
    color: theme.colors.text,
    marginBottom: theme.spacing(1),
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.bg,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing(0.5),
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: theme.type.caption,
    color: theme.colors.muted,
    textAlign: 'right',
  },
  inputGroup: {
    marginBottom: theme.spacing(2),
  },
  label: {
    fontSize: theme.type.body,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5),
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1.5),
    fontSize: theme.type.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  unitText: {
    fontSize: theme.type.caption,
    color: theme.colors.muted,
    marginTop: theme.spacing(0.5),
  },
  cropSelector: {
    flexDirection: 'row',
  },
  cropButton: {
    flex: 1,
    paddingVertical: theme.spacing(1.5),
    paddingHorizontal: theme.spacing(2),
    borderRadius: theme.radius,
    backgroundColor: theme.colors.bg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cropButtonSecond: {
    marginLeft: theme.spacing(1),
  },
  cropButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  cropButtonText: {
    fontSize: theme.type.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  cropButtonTextActive: {
    color: theme.colors.surface,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: theme.spacing(2),
  },
  saveButton: {
    flex: 1,
    marginRight: theme.spacing(1),
  },
  cancelButton: {
    flex: 1,
  },
  editButtonFull: {
    flex: 1,
    marginRight: theme.spacing(1),
  },
  deleteButton: {
    flex: 1,
  },
});
