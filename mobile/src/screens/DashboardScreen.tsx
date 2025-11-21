
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity, Switch, ScrollView, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { HeaderBar } from '../components/HeaderBar';
import { CameraCard } from '../components/CameraCard';
import { Camera, GridLayout, CameraStatus } from '../types/domain';
import { colors, typography } from '../theme/theme';

export const DashboardScreen: React.FC = () => {
  const { cameras, notifications, updateCamera, toggleRecording, addCamera } = useData();
  
  const [layout, setLayout] = useState<GridLayout>('2x2');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  
  // UI States
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Modal State
  const [newCamName, setNewCamName] = useState('');
  const [newCamUrl, setNewCamUrl] = useState('');

  useEffect(() => {
    if (!selectedCamera && cameras.length > 0) {
      setSelectedCamera(cameras[0]);
    }
  }, [cameras]);

  const handleSelectCamera = (cam: Camera) => {
    setSelectedCamera(cam);
  };

  const handleAddCamera = async () => {
    try {
      await addCamera(newCamName, newCamUrl);
      setShowAddModal(false);
      setNewCamName('');
      setNewCamUrl('');
    } catch(e) {
      // Error handled in context
    }
  };

  // Grid Logic
  const getGridData = () => {
    if (layout === '1x1' && selectedCamera) return [selectedCamera];
    if (layout === '2x2') return cameras.slice(0, 4);
    return cameras; // 3x3 or list
  };

  const gridData = getGridData();
  const numColumns = layout === '1x1' ? 1 : layout === '2x2' ? 2 : 3;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <HeaderBar 
        layout={layout} 
        onChangeLayout={setLayout} 
        onToggleDeviceList={() => setShowDeviceList(true)}
        onToggleSettings={() => setShowSettings(true)}
      />

      {/* Notifications Toast */}
      <View style={styles.notificationContainer}>
        {notifications.map(n => (
          <View key={n.id} style={[styles.toast, n.level === 'error' ? {borderColor: colors.neonPink} : {borderColor: colors.neonCyan}]}>
            <Text style={styles.toastText}>{n.message}</Text>
          </View>
        ))}
      </View>

      {/* Main Grid */}
      <View style={styles.mainContent}>
        <FlatList
          data={gridData}
          key={layout} // Force re-render on layout change
          keyExtractor={item => item.id}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <View style={{ flex: 1/numColumns, aspectRatio: 16/9 }}>
              <CameraCard 
                camera={item} 
                isSelected={selectedCamera?.id === item.id}
                onSelect={handleSelectCamera}
                onToggleRecording={toggleRecording}
              />
            </View>
          )}
          contentContainerStyle={styles.gridContent}
        />
      </View>

      {/* Device List Modal (Left Drawer Simulation) */}
      <Modal visible={showDeviceList} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.sidePanel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>DEVICES</Text>
              <TouchableOpacity onPress={() => setShowDeviceList(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
               <Text style={styles.addBtnText}>+ ADD CAMERA</Text>
            </TouchableOpacity>
            <FlatList 
              data={cameras}
              keyExtractor={c => c.id}
              renderItem={({item}) => (
                <TouchableOpacity 
                  style={[styles.deviceRow, selectedCamera?.id === item.id && styles.deviceRowSelected]}
                  onPress={() => { handleSelectCamera(item); setShowDeviceList(false); }}
                >
                  <Text style={[styles.deviceText, selectedCamera?.id === item.id && {color: 'black'}]}>{item.name}</Text>
                  <View style={[styles.statusDot, item.status === CameraStatus.ONLINE ? {backgroundColor: colors.neonMint} : {backgroundColor: 'gray'}]} />
                </TouchableOpacity>
              )}
            />
          </View>
          <TouchableOpacity style={{flex:1}} onPress={() => setShowDeviceList(false)} />
        </View>
      </Modal>

      {/* Settings Modal (Right Drawer Simulation) */}
      <Modal visible={showSettings} animationType="slide" transparent>
        <View style={styles.modalOverlayRight}>
           <TouchableOpacity style={{flex:1}} onPress={() => setShowSettings(false)} />
           <View style={styles.sidePanelRight}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>SETTINGS</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              {selectedCamera ? (
                <ScrollView style={styles.settingsContent}>
                   <Text style={styles.cameraTitle}>{selectedCamera.name}</Text>
                   
                   <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Night Vision</Text>
                      <Switch 
                        value={selectedCamera.settings.isNightVision}
                        onValueChange={(v) => updateCamera({...selectedCamera, settings: {...selectedCamera.settings, isNightVision: v}})}
                        trackColor={{false: '#333', true: colors.neonCyan}}
                      />
                   </View>

                   <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Motion Detection</Text>
                      <Switch 
                        value={selectedCamera.settings.motionDetection.enabled}
                        onValueChange={(v) => updateCamera({...selectedCamera, settings: {...selectedCamera.settings, motionDetection: {...selectedCamera.settings.motionDetection, enabled: v}}})}
                        trackColor={{false: '#333', true: colors.neonCyan}}
                      />
                   </View>

                   <View style={styles.infoBox}>
                      <Text style={styles.infoText}>Status: {selectedCamera.status}</Text>
                      <Text style={styles.infoText}>Resolution: {selectedCamera.settings.resolution}</Text>
                      <Text style={styles.infoText}>Last Seen: {new Date(selectedCamera.lastSeen).toLocaleTimeString()}</Text>
                   </View>
                </ScrollView>
              ) : (
                <Text style={{color: 'gray', padding: 20}}>No camera selected.</Text>
              )}
           </View>
        </View>
      </Modal>

      {/* Add Camera Modal */}
      <Modal visible={showAddModal} animationType="fade" transparent>
        <View style={styles.centerModalOverlay}>
          <View style={styles.centerModal}>
            <Text style={styles.panelTitle}>ADD CAMERA</Text>
            <TextInput 
              placeholder="Camera Name" 
              placeholderTextColor="#666"
              style={styles.input}
              value={newCamName}
              onChangeText={setNewCamName}
            />
            <TextInput 
              placeholder="Stream URL (HLS)" 
              placeholderTextColor="#666"
              style={styles.input}
              value={newCamUrl}
              onChangeText={setNewCamUrl}
            />
            <View style={styles.modalActions}>
               <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.cancelBtn}>
                 <Text style={styles.btnText}>CANCEL</Text>
               </TouchableOpacity>
               <TouchableOpacity onPress={handleAddCamera} style={styles.confirmBtn}>
                 <Text style={[styles.btnText, {color: 'black'}]}>ADD</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  mainContent: {
    flex: 1,
    padding: 4,
  },
  gridContent: {
    paddingBottom: 20,
  },
  notificationContainer: {
    position: 'absolute',
    top: 70,
    left: 10,
    right: 10,
    zIndex: 100,
  },
  toast: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 5,
  },
  toastText: {
    color: colors.textPrimary,
    fontFamily: typography.monospace,
    fontSize: 12,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalOverlayRight: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidePanel: {
    width: '80%',
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderRightWidth: 2,
    borderColor: colors.neonPurple,
    padding: 20,
  },
  sidePanelRight: {
    width: '80%',
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderLeftWidth: 2,
    borderColor: colors.neonPurple,
    padding: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: 10,
  },
  panelTitle: {
    color: colors.neonCyan,
    fontFamily: typography.orbitron,
    fontSize: 20,
  },
  deviceRow: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceRowSelected: {
    backgroundColor: colors.neonCyan,
  },
  deviceText: {
    color: colors.textPrimary,
    fontFamily: typography.monospace,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addBtnText: {
    color: colors.neonMint,
    fontWeight: 'bold',
  },
  // Settings
  settingsContent: {
    flex: 1,
  },
  cameraTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    color: colors.neonPink,
    fontSize: 16,
  },
  infoBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#111',
    borderRadius: 5,
  },
  infoText: {
    color: 'gray',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: typography.monospace,
  },
  // Center Modal
  centerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerModal: {
    width: '80%',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: colors.neonPurple,
    padding: 20,
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#111',
    color: 'white',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelBtn: {
    padding: 10,
    marginRight: 10,
  },
  confirmBtn: {
    padding: 10,
    backgroundColor: colors.neonCyan,
    borderRadius: 5,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
