import {
  Image,
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { useContext, useState } from 'react';
import { FontContext } from '@/context/FontThemeContext';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '@/context/UserAuthContext';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HeaderProps = {
  title: string;
  containerStyling?: StyleProp<ViewStyle>;
  useSafeArea?: boolean;
  showBackButton?: boolean;
};
const Header = ({ title, containerStyling, useSafeArea = false, showBackButton = false }: HeaderProps) => {
  const { textTheme } = useContext(FontContext);
  const { signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(routes)/userInfo');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setShowMenu(false);
  };

  return (
    <View
      style={[
        styles.container,
        useSafeArea && { paddingTop: insets.top },
        containerStyling
      ]}>
      {showBackButton ? (
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
      ) : (
        <Image
          source={require('@/assets/images/icon.png')}
          resizeMode="contain"
          style={{
            height: 40,
            width: 40,
            marginTop: -3,
          }}
        />
      )}
      <View style={styles.titleContainer}>
        <Text style={[textTheme.heading3, styles.titleText, styles.titleTextPosition]}>{title}</Text>
      </View>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          style={styles.menuButton}>
          <Feather name="more-vertical" size={24} color="black" />
        </TouchableOpacity>
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[textTheme.heading3, styles.modalTitle]}>
                  Menu
                </Text>
                <TouchableOpacity
                  onPress={() => setShowMenu(false)}
                  style={styles.closeButton}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <View style={styles.menuList}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    router.push('/(tabs)/Profile');
                    setShowMenu(false);
                  }}>
                  <View style={styles.menuItemIcon}>
                    <Feather name="user" size={22} color="#4a90e2" />
                  </View>
                  <Text style={[textTheme.subText, styles.menuItemText]}>
                    Tài khoản
                  </Text>
                  <Feather name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    router.push('/(routes)/drinkReminder');
                    setShowMenu(false);
                  }}>
                  <View style={styles.menuItemIcon}>
                    <Feather name="bell" size={22} color="#4a90e2" />
                  </View>
                  <Text style={[textTheme.subText, styles.menuItemText]}>
                    Nhắc nhở uống nước
                  </Text>
                  <Feather name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={[styles.menuItem, styles.menuItemDanger]}
                  onPress={handleSignOut}>
                  <View style={styles.menuItemIcon}>
                    <Feather name="log-out" size={22} color="#EA6230" />
                  </View>
                  <Text
                    style={[
                      textTheme.subText,
                      styles.menuItemText,
                      styles.menuItemTextDanger,
                    ]}>
                    Đăng xuất
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 0,
    paddingHorizontal: 20,
    position: 'relative',
    backgroundColor: '#fff',
    width: '100%',
    minHeight: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    textAlign: 'center',
  },
  titleTextPosition: {
    marginTop: -3,
  },
  backButton: {
    padding: 5,
    marginTop: -3,
    width: 40,
    alignItems: 'flex-start',
  },
  menuContainer: {
    position: 'relative',
    width: 40,
    alignItems: 'flex-end',
  },
  menuButton: {
    padding: 5,
    marginTop: -3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    padding: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  menuList: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemDanger: {
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  menuItemTextDanger: {
    color: '#EA6230',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#efefef',
    marginVertical: 8,
    marginHorizontal: 20,
  },
});
