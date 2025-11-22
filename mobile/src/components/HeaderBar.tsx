
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadow } from '../theme/theme';
import { GridLayout } from '../types/domain';

interface HeaderBarProps {
  layout: GridLayout;
  onChangeLayout: (layout: GridLayout) => void;
  onToggleDeviceList: () => void;
  onToggleSettings: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ layout, onChangeLayout, onToggleDeviceList, onToggleSettings }) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity onPress={onToggleDeviceList} style={styles.iconBtn}>
          <Ionicons name="menu" size={24} color={colors.neonCyan} />
        </TouchableOpacity>
        <Text style={styles.title}>CYBERSEC COMMAND</Text>
      </View>

      <View style={styles.right}>
        {/* Layout Toggles */}
        <View style={styles.layoutGroup}>
          <TouchableOpacity onPress={() => onChangeLayout('1x1')} style={[styles.layoutBtn, layout === '1x1' && styles.activeBtn]}>
            <Ionicons name="square-outline" size={16} color={layout === '1x1' ? 'black' : colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onChangeLayout('2x2')} style={[styles.layoutBtn, layout === '2x2' && styles.activeBtn]}>
            <Ionicons name="grid-outline" size={16} color={layout === '2x2' ? 'black' : colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onToggleSettings} style={styles.iconBtn}>
          <Ionicons name="settings-outline" size={24} color={colors.neonPurple} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderBottomWidth: 2,
    borderBottomColor: colors.neonPurple,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10, // Status bar clearance shim
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: colors.neonPink,
    fontFamily: typography.orbitron,
    fontSize: 16,
    marginLeft: 10,
    textShadowColor: colors.neonPink,
    textShadowRadius: 5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
  },
  layoutGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginRight: 8,
  },
  layoutBtn: {
    padding: 6,
    borderRadius: 6,
  },
  activeBtn: {
    backgroundColor: colors.neonCyan,
    ...shadow.neonCyan,
  },
});
