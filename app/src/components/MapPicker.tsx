import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme/theme';
import { Card } from './Card';
import { Button } from './Button';
import { MapIntegrationService, MapLocation } from '../services/MapIntegrationService';

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (location: MapLocation) => void;
  initialLocation?: MapLocation;
  showMapDirectly?: boolean; // If true, show map immediately instead of search interface
}

export function MapPicker({ visible, onClose, onLocationSelected, initialLocation, showMapDirectly = false }: MapPickerProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);
  const [showSimplePicker, setShowSimplePicker] = useState(false);
  const [tempLat, setTempLat] = useState('13.7563');
  const [tempLng, setTempLng] = useState('100.5018');
  const mapIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log('MapPicker useEffect:', { visible, showMapDirectly, currentLocation });
    if (visible && !currentLocation) {
      getCurrentLocation();
    }
    if (visible && showMapDirectly) {
      console.log('Setting showMap to true');
      setShowMap(true);
    }
  }, [visible, showMapDirectly]);

  const getCurrentLocation = async () => {
    console.log('MapPicker: getCurrentLocation called');
    setLoading(true);
    try {
      console.log('MapPicker: Calling MapIntegrationService.getCurrentLocation()');
      const location = await MapIntegrationService.getCurrentLocation();
      console.log('MapPicker: Got location:', location);
      setCurrentLocation(location);
      setSelectedLocation(location);
      console.log('MapPicker: Location set successfully');
    } catch (error) {
      console.error('MapPicker: Error getting current location:', error);
      Alert.alert(
        t('common.error'),
        t('fields.messages.locationError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
      console.log('MapPicker: getCurrentLocation completed');
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const result = await MapIntegrationService.geocodeAddress(searchQuery);
      if (result) {
        setSearchResults([result]);
        setSelectedLocation(result);
      } else {
        setSearchResults([]);
        Alert.alert(
          t('common.error'),
          t('fields.messages.locationNotFound'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert(
        t('common.error'),
        t('fields.messages.searchError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setSearching(false);
    }
  };

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelected(selectedLocation);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleMapPress = () => {
    setShowMap(true);
  };

  const handleMapLocationSelect = (location: MapLocation) => {
    setMapLocation(location);
    setSelectedLocation(location);
    setShowMap(false);
  };

  const handleMapClose = () => {
    setShowMap(false);
  };

  const handleMapConfirm = () => {
    if (mapLocation) {
      onLocationSelected(mapLocation);
      onClose();
    } else {
      // If no location selected from map, show coordinate picker
      setShowSimplePicker(true);
    }
  };

  // Generate HTML for Google Maps with Thailand focus - DISABLED FOR WEB
  const generateMapHTML = () => {
    const initialLat = initialLocation?.lat || 13.7563;
    const initialLng = initialLocation?.lng || 100.5018;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          #map { height: 100vh; width: 100%; }
          .map-controls {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            z-index: 1000;
            display: flex;
            gap: 10px;
          }
          .control-btn {
            background: white;
            border: 1px solid #ccc;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .control-btn:hover {
            background: #f5f5f5;
          }
          .selected-info {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            z-index: 1000;
          }
          .selected-info h3 {
            margin: 0 0 5px 0;
            color: #333;
          }
          .selected-info p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div id="map">
          <div id="loadingIndicator" style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; color: #666;">
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
            <h3>กำลังโหลดแผนที่...</h3>
            <p>กรุณารอสักครู่</p>
          </div>
        </div>
        <div class="map-controls">
          <button class="control-btn" onclick="useCurrentLocation()">📍 ตำแหน่งปัจจุบัน</button>
          <button class="control-btn" onclick="centerOnThailand()">🇹🇭 ประเทศไทย</button>
        </div>
        <div id="selectedInfo" class="selected-info" style="display: none;">
          <h3>ตำแหน่งที่เลือก</h3>
          <p id="selectedAddress"></p>
          <p id="selectedCoords"></p>
        </div>

        <script>
          let map;
          let marker;
          let selectedLocation = null;

          function initMap() {
            // Hide loading indicator
            const loadingIndicator = document.getElementById('loadingIndicator');
            if (loadingIndicator) {
              loadingIndicator.style.display = 'none';
            }
            
            map = new google.maps.Map(document.getElementById('map'), {
              center: { lat: ${initialLat}, lng: ${initialLng} },
              zoom: 6,
              mapTypeId: 'roadmap',
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: true,
              zoomControl: true,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            });

            // Add click listener to map
            map.addListener('click', function(event) {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();
              
              // Remove existing marker
              if (marker) {
                marker.setMap(null);
              }
              
              // Add new marker
              marker = new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map: map,
                title: 'ตำแหน่งที่เลือก'
              });
              
              // Reverse geocode to get address
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode({ location: { lat: lat, lng: lng } }, function(results, status) {
                if (status === 'OK' && results[0]) {
                  const address = results[0].formatted_address;
                  selectedLocation = {
                    lat: lat,
                    lng: lng,
                    address: address,
                    subdistrict: extractSubdistrict(address),
                    province: extractProvince(address)
                  };
                  
                  // Show selected info
                  document.getElementById('selectedAddress').textContent = address;
                  document.getElementById('selectedCoords').textContent = lat.toFixed(6) + ', ' + lng.toFixed(6);
                  document.getElementById('selectedInfo').style.display = 'block';
                  
                  // Send location to React Native
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'locationSelected',
                    location: selectedLocation
                  }));
                }
              });
            });

            // Add initial marker if location provided
            if (${initialLat} && ${initialLng}) {
              marker = new google.maps.Marker({
                position: { lat: ${initialLat}, lng: ${initialLng} },
                map: map,
                title: 'ตำแหน่งเริ่มต้น'
              });
            }
          }

          function useCurrentLocation() {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setCenter({ lat: lat, lng: lng });
                map.setZoom(15);
                
                // Simulate click at current location
                const clickEvent = {
                  latLng: {
                    lat: function() { return lat; },
                    lng: function() { return lng; }
                  }
                };
                map.getClickableIcons = function() { return true; };
                google.maps.event.trigger(map, 'click', clickEvent);
              });
            } else {
              alert('Geolocation is not supported by this browser.');
            }
          }

          function centerOnThailand() {
            map.setCenter({ lat: 13.7563, lng: 100.5018 });
            map.setZoom(6);
          }

          function extractSubdistrict(address) {
            // Simple extraction - look for ตำบล
            const match = address.match(/ตำบล([^,]+)/);
            return match ? match[1].trim() : 'ตำบลไม่ระบุ';
          }

          function extractProvince(address) {
            // Simple extraction - look for จังหวัด
            const match = address.match(/จังหวัด([^,]+)/);
            return match ? match[1].trim() : 'จังหวัดไม่ระบุ';
          }

          // Load Google Maps API with better error handling
          function loadGoogleMaps() {
            // Check if Google Maps is already loaded
            if (window.google && window.google.maps) {
              initMap();
              return;
            }

            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA0c40zoJGzs-Eaq5Pn5a80KRDMsyU5d9k&callback=initMap&libraries=places';
            script.async = true;
            script.defer = true;
            
            script.onerror = function() {
              console.error('Failed to load Google Maps API');
              showFallbackMap();
            };
            
            // Add timeout to detect if script doesn't load
            setTimeout(function() {
              if (!window.google || !window.google.maps) {
                console.error('Google Maps API timeout');
                showFallbackMap();
              }
            }, 10000); // 10 second timeout
            
            document.head.appendChild(script);
          }

          // Fallback map using OpenStreetMap
          function showFallbackMap() {
            const mapDiv = document.getElementById('map');
            mapDiv.innerHTML = \`
              <div style="height: 100%; display: flex; flex-direction: column;">
                <div style="flex: 1; position: relative;">
                  <iframe 
                    src="https://www.openstreetmap.org/export/embed.html?bbox=97.3438%2C5.6120%2C105.6390%2C20.4648&layer=mapnik&marker=13.7563,100.5018"
                    style="width: 100%; height: 100%; border: none;"
                    title="Thailand Map"
                  ></iframe>
                </div>
                <div style="padding: 15px; background: white; border-top: 1px solid #ddd;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">แผนที่ประเทศไทย</h3>
                  <p style="margin: 0 0 10px 0; color: #666;">คลิกที่ตำแหน่งบนแผนที่เพื่อเลือก</p>
                  <div style="display: flex; gap: 10px;">
                    <button onclick="selectLocationFromFallback()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">เลือกตำแหน่งนี้</button>
                    <button onclick="loadGoogleMaps()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">ลองใช้ Google Maps</button>
                  </div>
                </div>
              </div>
            \`;
          }

          function selectLocationFromFallback() {
            // Use Bangkok coordinates as default
            const location = {
              lat: 13.7563,
              lng: 100.5018,
              address: 'กรุงเทพมหานคร, ประเทศไทย',
              subdistrict: 'บางรัก',
              province: 'กรุงเทพมหานคร'
            };
            
            selectedLocation = location;
            document.getElementById('selectedAddress').textContent = location.address;
            document.getElementById('selectedCoords').textContent = location.lat.toFixed(6) + ', ' + location.lng.toFixed(6);
            document.getElementById('selectedInfo').style.display = 'block';
            
            // Send location to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'locationSelected',
              location: location
            }));
          }

          // Start loading when page loads
          window.onload = loadGoogleMaps;
        </script>
      </body>
      </html>
    `;
  };

  const renderLocationItem = (location: MapLocation, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.locationItem,
        selectedLocation?.lat === location.lat && selectedLocation?.lng === location.lng && styles.selectedLocationItem
      ]}
      onPress={() => handleLocationSelect(location)}
    >
      <Text style={styles.locationAddress}>{location.address}</Text>
      <Text style={styles.locationDetails}>
        {MapIntegrationService.formatLocation(location)}
      </Text>
      <Text style={styles.locationCoords}>
        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
      </Text>
    </TouchableOpacity>
  );

  const renderMainModal = () => (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('fields.management.selectLocation')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Search Section */}
          <Card style={styles.searchCard}>
            <Text style={styles.sectionTitle}>{t('fields.management.searchLocation')}</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={t('fields.management.searchPlaceholder')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={searchLocation}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={[styles.searchButton, searching && styles.searchButtonDisabled]}
                onPress={searchLocation}
                disabled={searching}
              >
                {searching ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Text style={styles.searchButtonText}>{t('common.search')}</Text>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Map Selection Buttons */}
            <View style={styles.mapButtonContainer}>
              <Button
                title="🗺️ เลือกจากแผนที่ (Google Maps)"
                onPress={handleMapPress}
                variant="outline"
                style={styles.mapButton}
              />
              <Button
                title="📍 เลือกจากพิกัด"
                onPress={() => setShowSimplePicker(true)}
                variant="outline"
                style={styles.mapButton}
              />
            </View>
          </Card>

          {/* Current Location Section */}
          <Card style={styles.currentLocationCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('fields.management.currentLocation')}</Text>
              <TouchableOpacity
                style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
                onPress={getCurrentLocation}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Text style={styles.refreshButtonText}>🔄</Text>
                )}
              </TouchableOpacity>
            </View>
            
            {currentLocation ? (
              renderLocationItem(currentLocation, -1)
            ) : (
              <Text style={styles.noLocationText}>
                {t('fields.messages.noCurrentLocation')}
              </Text>
            )}
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card style={styles.resultsCard}>
              <Text style={styles.sectionTitle}>{t('fields.management.searchResults')}</Text>
              {searchResults.map((location, index) => renderLocationItem(location, index))}
            </Card>
          )}

          {/* Selected Location Preview */}
          {selectedLocation && (
            <Card style={styles.previewCard}>
              <Text style={styles.sectionTitle}>{t('fields.management.selectedLocation')}</Text>
              <View style={styles.previewContent}>
                <Text style={styles.previewAddress}>{selectedLocation.address}</Text>
                <Text style={styles.previewDetails}>
                  {MapIntegrationService.formatLocation(selectedLocation)}
                </Text>
                <Text style={styles.previewCoords}>
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </Text>
                {selectedLocation.accuracy && (
                  <Text style={styles.previewAccuracy}>
                    {t('fields.management.accuracy')}: ±{Math.round(selectedLocation.accuracy)}m
                  </Text>
                )}
              </View>
            </Card>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title={t('common.cancel')}
            onPress={handleCancel}
            variant="secondary"
            style={styles.cancelButton}
          />
          <Button
            title={t('common.confirm')}
            onPress={handleConfirm}
            disabled={!selectedLocation}
            style={styles.confirmButton}
          />
        </View>
      </View>
    </Modal>
  );

  // Simple Coordinate Picker Modal
  const renderSimplePickerModal = () => (
    <Modal
      visible={showSimplePicker}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSimplePicker(false)}
    >
      <View style={styles.simplePickerContainer}>
        <View style={styles.simplePickerHeader}>
          <TouchableOpacity onPress={() => setShowSimplePicker(false)} style={styles.simplePickerCloseButton}>
            <Text style={styles.simplePickerCloseButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.simplePickerTitle}>เลือกตำแหน่งจากพิกัด</Text>
          <TouchableOpacity 
            onPress={() => {
              const lat = parseFloat(tempLat);
              const lng = parseFloat(tempLng);
              if (!isNaN(lat) && !isNaN(lng)) {
                const location: MapLocation = {
                  lat,
                  lng,
                  subdistrict: 'ตำบลไม่ระบุ',
                  province: 'จังหวัดไม่ระบุ',
                  address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                };
                handleMapLocationSelect(location);
                setShowSimplePicker(false);
              }
            }} 
            style={styles.simplePickerConfirmButton}
          >
            <Text style={styles.simplePickerConfirmButtonText}>ยืนยัน</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.simplePickerContent}>
          <Text style={styles.simplePickerDescription}>
            กรอกพิกัดละติจูดและลองจิจูดของตำแหน่งที่ต้องการ
          </Text>
          
          <View style={styles.coordinateInputs}>
            <View style={styles.coordinateInput}>
              <Text style={styles.coordinateLabel}>ละติจูด (Latitude)</Text>
              <TextInput
                style={styles.coordinateTextInput}
                value={tempLat}
                onChangeText={setTempLat}
                placeholder="13.7563"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.coordinateInput}>
              <Text style={styles.coordinateLabel}>ลองจิจูด (Longitude)</Text>
              <TextInput
                style={styles.coordinateTextInput}
                value={tempLng}
                onChangeText={setTempLng}
                placeholder="100.5018"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.presetButtons}>
            <Text style={styles.presetTitle}>ตำแหน่งตัวอย่าง:</Text>
            <TouchableOpacity 
              style={styles.presetButton}
              onPress={() => {
                setTempLat('13.7563');
                setTempLng('100.5018');
              }}
            >
              <Text style={styles.presetButtonText}>กรุงเทพมหานคร</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.presetButton}
              onPress={() => {
                setTempLat('18.7883');
                setTempLng('98.9853');
              }}
            >
              <Text style={styles.presetButtonText}>เชียงใหม่</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.presetButton}
              onPress={() => {
                setTempLat('7.8804');
                setTempLng('98.3923');
              }}
            >
              <Text style={styles.presetButtonText}>ภูเก็ต</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Map Modal
  const renderMapModal = () => {
    console.log('Rendering map modal:', { showMap, visible, showMapDirectly });
    return (
      <Modal
        visible={showMap}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleMapClose}
      >
      <View style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <TouchableOpacity onPress={handleMapClose} style={styles.mapCloseButton}>
            <Text style={styles.mapCloseButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.mapTitle}>เลือกตำแหน่งจากแผนที่</Text>
          <TouchableOpacity onPress={handleMapConfirm} style={styles.mapConfirmButton}>
            <Text style={styles.mapConfirmButtonText}>ยืนยัน</Text>
          </TouchableOpacity>
        </View>
        
        {Platform.OS === 'web' ? (
          <View style={styles.webMapContainer}>
            <View style={styles.mapInstructions}>
              <Text style={styles.mapInstructionsText}>
                📍 ดูแผนที่เพื่อหาตำแหน่งที่ต้องการ แล้วใช้ปุ่ม "เลือกจากพิกัด" ด้านล่าง
              </Text>
            </View>
            <iframe
              ref={mapIframeRef}
              src="https://www.google.com/maps/embed/v1/view?key=AIzaSyA0c40zoJGzs-Eaq5Pn5a80KRDMsyU5d9k&center=13.7563,100.5018&zoom=6&maptype=roadmap"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Map Picker"
            />
            <View style={styles.mapFooter}>
              <Button
                title="📍 เลือกจากพิกัด"
                onPress={() => setShowSimplePicker(true)}
                variant="outline"
                style={styles.coordinateButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.webMapContainer}>
            <Text style={styles.mapNotSupportedText}>
              Map not supported on this platform. Please use coordinate picker instead.
            </Text>
          </View>
        )}
      </View>
    </Modal>
    );
  };

  return (
    <>
      {!showMapDirectly && renderMainModal()}
      {renderMapModal()}
      {renderSimplePickerModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing(2),
  },
  searchCard: {
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing(1),
  },
  searchContainer: {
    flexDirection: 'row',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    paddingHorizontal: theme.spacing(1),
    paddingVertical: theme.spacing(0.5),
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing(1),
  },
  searchButton: {
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(0.5),
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  searchButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '500',
  },
  currentLocationCard: {
    marginBottom: theme.spacing(2),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  refreshButtonText: {
    fontSize: 16,
  },
  noLocationText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  resultsCard: {
    marginBottom: theme.spacing(2),
  },
  locationItem: {
    padding: theme.spacing(1),
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    marginBottom: theme.spacing(0.5),
    backgroundColor: theme.colors.surface,
  },
  selectedLocationItem: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  locationAddress: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  locationDetails: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  previewCard: {
    marginBottom: theme.spacing(2),
  },
  previewContent: {
    padding: theme.spacing(1),
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius,
  },
  previewAddress: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  previewDetails: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  previewCoords: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 4,
  },
  previewAccuracy: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.success,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    padding: theme.spacing(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing(1),
  },
  confirmButton: {
    flex: 1,
  },
  // Map styles
  mapButtonContainer: {
    marginTop: theme.spacing(1),
  },
  mapButton: {
    width: '100%',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  mapCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCloseButtonText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  mapTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  mapConfirmButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius,
  },
  mapConfirmButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
  webMapContainer: {
    flex: 1,
    height: '100%',
  },
  mapNotSupportedText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: theme.colors.textSecondary,
    padding: theme.spacing(4),
  },
  mapInstructions: {
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  mapInstructionsText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  mapFooter: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  coordinateButton: {
    minWidth: 200,
  },
  // Simple picker styles
  simplePickerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  simplePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  simplePickerCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simplePickerCloseButtonText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  simplePickerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  simplePickerConfirmButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius,
  },
  simplePickerConfirmButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
  },
  simplePickerContent: {
    flex: 1,
    padding: theme.spacing(2),
  },
  simplePickerDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },
  coordinateInputs: {
    marginBottom: theme.spacing(3),
  },
  coordinateInput: {
    marginBottom: theme.spacing(2),
  },
  coordinateLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing(0.5),
  },
  coordinateTextInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    paddingHorizontal: theme.spacing(1),
    paddingVertical: theme.spacing(0.5),
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  presetButtons: {
    marginTop: theme.spacing(2),
  },
  presetTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing(1),
  },
  presetButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  presetButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
