import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import ScreenContainer from '@/components/container/ScreenContainer';
import { useAuth } from '@/context/UserAuthContext';
import { FontContext } from '@/context/FontThemeContext';
import { ScreenDimension } from '@/constants/Dimensions';
import { COLOR_THEME } from '@/style/ColorTheme';
import { Feather } from '@expo/vector-icons';
import { auth } from '@/util/firebaseConfig';
import { format } from 'date-fns';
import CommonTextInput from '@/components/field/CommonTextInput';
import { ButtonTheme } from '@/style/ButtonTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const AccountInfo = () => {
  const { textTheme } = useContext(FontContext);
  const { user, updateUserInfo, changePassword, verifyCurrentPassword, deleteAccount, signOut, isRegistered, syncToCloud } = useAuth();
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState<boolean | null>(null);
  const [currentPasswordError, setCurrentPasswordError] = useState<string>('');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    setFirebaseUser(auth.currentUser);
    setEditedName(user?.name || '');
  }, [user]);

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert('Lỗi', 'Tên không được để trống');
      return;
    }

    setIsSavingName(true);
    try {
      await updateUserInfo(editedName, 'name');
      setIsEditingName(false);
      Alert.alert('Thành công', 'Đã cập nhật tên thành công');
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật tên. Vui lòng thử lại.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword || currentPassword.length === 0) {
      setIsCurrentPasswordValid(null);
      setCurrentPasswordError('');
      return;
    }

    setIsVerifyingPassword(true);
    setCurrentPasswordError('');
    try {
      const isValid = await verifyCurrentPassword(currentPassword);
      setIsCurrentPasswordValid(isValid);
      if (!isValid) {
        setCurrentPasswordError('Mật khẩu hiện tại không đúng');
      }
    } catch (error: any) {
      console.error('Error verifying password:', error);
      setIsCurrentPasswordValid(false);
      // Check if it's a network error
      if (error.message && error.message.includes('network')) {
        setCurrentPasswordError('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
      } else {
        setCurrentPasswordError('Không thể xác minh mật khẩu. Vui lòng thử lại.');
      }
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (isCurrentPasswordValid === false) {
      Alert.alert('Lỗi', 'Mật khẩu hiện tại không đúng. Vui lòng kiểm tra lại.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Thành công', 'Đã đổi mật khẩu thành công', [
        {
          text: 'OK',
          onPress: () => {
            setShowPasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            setIsCurrentPasswordValid(null);
            setCurrentPasswordError('');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getJoinDate = () => {
    if (firebaseUser?.metadata?.creationTime) {
      return format(new Date(firebaseUser.metadata.creationTime), 'dd/MM/yyyy');
    }
    return 'Chưa đăng ký';
  };


  const handleSync = async () => {
    if (!isRegistered) {
      Alert.alert('Thông báo', 'Vui lòng đăng ký tài khoản trước để đồng bộ dữ liệu');
      return;
    }

    setIsSyncing(true);
    try {
      await syncToCloud();
      Alert.alert('Thành công', 'Đã đồng bộ dữ liệu thành công');
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể đồng bộ dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setIsSyncing(false);
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const InfoItem = ({
    icon,
    label,
    value,
    onPress,
    showArrow = false,
  }: {
    icon: string;
    label: string;
    value: string;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.infoItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}>
      <View style={styles.infoItemLeft}>
        <View style={styles.iconWrapper}>
          <Feather name={icon as any} size={20} color={COLOR_THEME.base.primary} />
        </View>
        <View style={styles.infoItemContent}>
          <Text style={[textTheme.subText, styles.infoItemLabel]}>{label}</Text>
          <Text style={[textTheme.heading3, styles.infoItemValue]}>{value}</Text>
        </View>
      </View>
      {showArrow && (
        <Feather name="chevron-right" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer headerTitle="Thông tin tài khoản" showBackButton={true}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Header với Avatar và Tên */}
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? getInitials(user.name) : 'U'}
              </Text>
            </View>
          </View>

          {isEditingName ? (
            <View style={styles.nameEditContainer}>
              <CommonTextInput
                value={editedName}
                handleChangeText={setEditedName}
                placeholder="Nhập tên của bạn"
                placeholderTextColor="#ccc"
                additionalStyling={styles.nameInput}
              />
              <View style={styles.nameEditActions}>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingName(false);
                    setEditedName(user?.name || '');
                  }}
                  style={styles.nameCancelButton}>
                  <Text style={[textTheme.subText, styles.nameCancelText]}>
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveName}
                  style={styles.nameSaveButton}
                  disabled={isSavingName}>
                  {isSavingName ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={[textTheme.subText, styles.nameSaveText]}>
                      Lưu
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={[textTheme.heading1, styles.userName]}>
                {user?.name || 'Người Dùng'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditingName(true)}
                style={styles.editNameButton}
                activeOpacity={0.7}>
                <Feather name="edit-2" size={16} color={COLOR_THEME.base.primary} />
                <Text style={[textTheme.subText, styles.editNameText]}>
                  Chỉnh sửa tên
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Trạng thái đồng bộ */}
        {!isRegistered && (
          <View style={styles.card}>
            <View style={styles.syncStatusContainer}>
              <View style={styles.syncStatusHeader}>
                <Feather name="cloud-off" size={24} color="#FF9800" />
                <View style={styles.syncStatusContent}>
                  <Text style={[textTheme.heading3, styles.syncStatusTitle]}>
                    Chế độ Offline
                  </Text>
                  <Text style={[textTheme.subText, styles.syncStatusSubtitle]}>
                    Dữ liệu đang được lưu trữ cục bộ. Đăng nhập để đồng bộ lên đám mây.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.loginButtonFull}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.7}>
                <Feather name="log-in" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={[textTheme.subText, styles.loginButtonText]}>
                  Đăng Nhập
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isRegistered && (
          <View style={styles.card}>
            <View style={styles.syncStatusContainer}>
              <View style={styles.syncStatusHeader}>
                <Feather name="cloud" size={24} color="#4CAF50" />
                <View style={styles.syncStatusContent}>
                  <Text style={[textTheme.heading3, styles.syncStatusTitle]}>
                    Đã đồng bộ
                  </Text>
                  <Text style={[textTheme.subText, styles.syncStatusSubtitle]}>
                    Dữ liệu của bạn đang được đồng bộ với đám mây.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.syncButton}
                onPress={handleSync}
                disabled={isSyncing}
                activeOpacity={0.7}>
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="refresh-cw" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={[textTheme.subText, styles.syncButtonText]}>
                      Đồng bộ ngay
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Thông tin tài khoản */}
        <View style={styles.card}>
          <Text style={[textTheme.heading2, styles.cardTitle]}>
            Thông tin tài khoản
          </Text>

          <View style={styles.cardContent}>
            <InfoItem
              icon="mail"
              label="Email"
              value={firebaseUser?.email || (isRegistered ? 'N/A' : 'Chưa đăng ký')}
            />
            <View style={styles.divider} />
            <InfoItem
              icon="hash"
              label="ID người dùng"
              value={user?.userId || firebaseUser?.uid || 'N/A'}
            />
            <View style={styles.divider} />
            <InfoItem
              icon="calendar"
              label="Ngày tham gia"
              value={getJoinDate()}
            />
          </View>
        </View>

        {/* Bảo mật */}
        {isRegistered && (
          <View style={styles.card}>
            <Text style={[textTheme.heading2, styles.cardTitle]}>
              Bảo mật
            </Text>

            <View style={styles.cardContent}>
              <TouchableOpacity
                style={styles.securityButton}
                onPress={() => setShowPasswordModal(true)}
                activeOpacity={0.7}>
                <View style={styles.securityButtonLeft}>
                  <View style={styles.iconWrapper}>
                    <Feather name="lock" size={20} color={COLOR_THEME.base.primary} />
                  </View>
                  <View style={styles.infoItemContent}>
                    <Text style={[textTheme.heading3, styles.securityButtonText]}>
                      Đổi mật khẩu
                    </Text>
                    <Text style={[textTheme.subText, styles.securityButtonSubtext]}>
                      Cập nhật mật khẩu để bảo vệ tài khoản
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quản lý tài khoản */}
        {isRegistered && (
          <View style={styles.card}>
            <Text style={[textTheme.heading2, styles.cardTitle]}>
              Quản lý tài khoản
            </Text>

            <View style={styles.cardContent}>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={() => setShowDeleteAccountModal(true)}
                activeOpacity={0.7}>
                <View style={styles.securityButtonLeft}>
                  <View style={[styles.iconWrapper, styles.dangerIconWrapper]}>
                    <Feather name="trash-2" size={20} color="#EA6230" />
                  </View>
                  <View style={styles.infoItemContent}>
                    <Text style={[textTheme.heading3, styles.dangerButtonText]}>
                      Xóa tài khoản
                    </Text>
                    <Text style={[textTheme.subText, styles.dangerButtonSubtext]}>
                      Xóa vĩnh viễn tài khoản và tất cả dữ liệu
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal đổi mật khẩu */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}>
            <SafeAreaView edges={['bottom']} style={styles.modalContentWrapper}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={styles.modalIconContainer}>
                      <Feather name="shield" size={28} color={COLOR_THEME.base.primary} />
                    </View>
                    <View>
                      <Text style={[textTheme.heading2, styles.modalTitle]}>
                        Đổi mật khẩu
                      </Text>
                      <Text style={[textTheme.subText, styles.modalSubtitle]}>
                        Bảo vệ tài khoản của bạn
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowPasswordModal(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    style={styles.modalCloseButton}>
                    <Feather name="x" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalBody}
                  contentContainerStyle={styles.modalBodyContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}>
                  {/* Mật khẩu hiện tại */}
                  <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                      <Feather name="lock" size={16} color="#666" />
                      <Text style={[textTheme.subText, styles.inputLabel]}>
                        Mật khẩu hiện tại
                      </Text>
                    </View>
                    <View style={styles.passwordInputContainer}>
                      <CommonTextInput
                        value={currentPassword}
                        handleChangeText={(text) => {
                          setCurrentPassword(text);
                          // Reset validation khi người dùng thay đổi mật khẩu
                          if (isCurrentPasswordValid !== null) {
                            setIsCurrentPasswordValid(null);
                            setCurrentPasswordError('');
                          }
                        }}
                        onBlur={handleVerifyCurrentPassword}
                        placeholder="Nhập mật khẩu hiện tại"
                        placeholderTextColor="#999"
                        secureTextEntry={!showCurrentPassword}
                        additionalStyling={styles.passwordInput}
                      />
                      <TouchableOpacity
                        style={styles.eyeIconButton}
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                        <Feather
                          name={showCurrentPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                    {currentPasswordError ? (
                      <View style={styles.errorContainer}>
                        <Feather name="alert-circle" size={14} color="#EA6230" />
                        <Text style={styles.errorText}>{currentPasswordError}</Text>
                      </View>
                    ) : isCurrentPasswordValid === true ? (
                      <View style={styles.successContainer}>
                        <Feather name="check-circle" size={14} color="#4CAF50" />
                        <Text style={styles.successText}>Mật khẩu hiện tại đúng</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Mật khẩu mới */}
                  <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                      <Feather name="key" size={16} color="#666" />
                      <Text style={[textTheme.subText, styles.inputLabel]}>
                        Mật khẩu mới
                      </Text>
                    </View>
                    <View style={styles.passwordInputContainer}>
                      <CommonTextInput
                        value={newPassword}
                        handleChangeText={setNewPassword}
                        placeholder="Nhập mật khẩu mới"
                        placeholderTextColor="#999"
                        secureTextEntry={!showNewPassword}
                        additionalStyling={styles.passwordInput}
                      />
                      <TouchableOpacity
                        style={styles.eyeIconButton}
                        onPress={() => setShowNewPassword(!showNewPassword)}>
                        <Feather
                          name={showNewPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.passwordRequirements}>
                      <View style={styles.requirementRow}>
                        <Feather
                          name={newPassword.length >= 6 ? 'check-circle' : 'circle'}
                          size={14}
                          color={newPassword.length >= 6 ? '#4CAF50' : '#ccc'}
                        />
                        <Text
                          style={[
                            styles.requirementText,
                            newPassword.length >= 6 && styles.requirementTextMet,
                          ]}>
                          Ít nhất 6 ký tự
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Xác nhận mật khẩu mới */}
                  <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                      <Feather name="check-circle" size={16} color="#666" />
                      <Text style={[textTheme.subText, styles.inputLabel]}>
                        Xác nhận mật khẩu mới
                      </Text>
                    </View>
                    <View style={styles.passwordInputContainer}>
                      <CommonTextInput
                        value={confirmPassword}
                        handleChangeText={setConfirmPassword}
                        placeholder="Nhập lại mật khẩu mới"
                        placeholderTextColor="#999"
                        secureTextEntry={!showConfirmPassword}
                        additionalStyling={styles.passwordInput}
                      />
                      <TouchableOpacity
                        style={styles.eyeIconButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Feather
                          name={showConfirmPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                    {confirmPassword.length > 0 && (
                      <View style={styles.passwordMatchContainer}>
                        <Feather
                          name={newPassword === confirmPassword ? 'check' : 'x'}
                          size={14}
                          color={newPassword === confirmPassword ? '#4CAF50' : '#EA6230'}
                        />
                        <Text
                          style={[
                            styles.passwordMatchText,
                            newPassword === confirmPassword
                              ? styles.passwordMatchTextSuccess
                              : styles.passwordMatchTextError,
                          ]}>
                          {newPassword === confirmPassword
                            ? 'Mật khẩu khớp'
                            : 'Mật khẩu không khớp'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Info Box */}
                  <View style={styles.infoBox}>
                    <Feather name="info" size={16} color={COLOR_THEME.base.primary} />
                    <Text style={[textTheme.subText, styles.infoBoxText]}>
                      Mật khẩu mới sẽ được áp dụng ngay sau khi bạn xác nhận. Vui lòng đảm bảo bạn
                      nhớ mật khẩu mới.
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowPasswordModal(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                      setIsCurrentPasswordValid(null);
                      setCurrentPasswordError('');
                    }}
                    style={[styles.modalButton, styles.cancelModalButton]}>
                    <Text style={[textTheme.subText, styles.cancelModalButtonText]}>
                      Hủy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleChangePassword}
                    style={[
                      styles.modalButton,
                      styles.confirmModalButton,
                      (isChangingPassword ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword ||
                        newPassword.length < 6 ||
                        isCurrentPasswordValid === false) &&
                      styles.disabledButton,
                    ]}
                    disabled={
                      isChangingPassword ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword !== confirmPassword ||
                      newPassword.length < 6 ||
                      isCurrentPasswordValid === false
                    }>
                    {isChangingPassword ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Feather name="check" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={[textTheme.subText, styles.confirmModalButtonText]}>
                          Xác nhận đổi mật khẩu
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal xóa tài khoản */}
      <Modal
        visible={showDeleteAccountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeleteAccountModal(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}>
            <SafeAreaView edges={['bottom']} style={styles.modalContentWrapper}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={[styles.modalIconContainer, styles.dangerModalIconContainer]}>
                      <Feather name="alert-triangle" size={28} color="#EA6230" />
                    </View>
                    <View>
                      <Text style={[textTheme.heading2, styles.modalTitle]}>
                        Xóa tài khoản
                      </Text>
                      <Text style={[textTheme.subText, styles.modalSubtitle]}>
                        Hành động này không thể hoàn tác
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowDeleteAccountModal(false);
                      setDeletePassword('');
                      setShowDeletePassword(false);
                    }}
                    style={styles.modalCloseButton}>
                    <Feather name="x" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalBody}
                  contentContainerStyle={styles.modalBodyContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}>
                  {/* Cảnh báo */}
                  <View style={styles.warningBox}>
                    <Feather name="alert-circle" size={20} color="#EA6230" />
                    <View style={styles.warningContent}>
                      <Text style={[textTheme.heading3, styles.warningTitle]}>
                        Cảnh báo quan trọng
                      </Text>
                      <Text style={[textTheme.subText, styles.warningText]}>
                        Khi xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn:
                      </Text>
                      <View style={styles.warningList}>
                        <Text style={[textTheme.subText, styles.warningListItem]}>
                          • Thông tin cá nhân
                        </Text>
                        <Text style={[textTheme.subText, styles.warningListItem]}>
                          • Lịch sử uống nước
                        </Text>
                        <Text style={[textTheme.subText, styles.warningListItem]}>
                          • Thống kê và thành tích
                        </Text>
                        <Text style={[textTheme.subText, styles.warningListItem]}>
                          • Tất cả dữ liệu khác
                        </Text>
                      </View>
                      <Text style={[textTheme.subText, styles.warningText, { marginTop: 10 }]}>
                        Hành động này không thể hoàn tác. Vui lòng xác nhận bằng cách nhập mật khẩu của bạn.
                      </Text>
                    </View>
                  </View>

                  {/* Nhập mật khẩu */}
                  <View style={styles.inputGroup}>
                    <View style={styles.inputLabelContainer}>
                      <Feather name="lock" size={16} color="#666" />
                      <Text style={[textTheme.subText, styles.inputLabel]}>
                        Nhập mật khẩu để xác nhận
                      </Text>
                    </View>
                    <View style={styles.passwordInputContainer}>
                      <CommonTextInput
                        value={deletePassword}
                        handleChangeText={setDeletePassword}
                        placeholder="Nhập mật khẩu của bạn"
                        placeholderTextColor="#999"
                        secureTextEntry={!showDeletePassword}
                        additionalStyling={styles.passwordInput}
                      />
                      <TouchableOpacity
                        style={styles.eyeIconButton}
                        onPress={() => setShowDeletePassword(!showDeletePassword)}>
                        <Feather
                          name={showDeletePassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowDeleteAccountModal(false);
                      setDeletePassword('');
                      setShowDeletePassword(false);
                    }}
                    style={[styles.modalButton, styles.cancelModalButton]}>
                    <Text style={[textTheme.subText, styles.cancelModalButtonText]}>
                      Hủy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      if (!deletePassword) {
                        Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu để xác nhận');
                        return;
                      }

                      Alert.alert(
                        'Xác nhận xóa tài khoản',
                        'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.',
                        [
                          {
                            text: 'Hủy',
                            style: 'cancel',
                          },
                          {
                            text: 'Xóa tài khoản',
                            style: 'destructive',
                            onPress: async () => {
                              setIsDeletingAccount(true);
                              try {
                                await deleteAccount(deletePassword);
                                Alert.alert(
                                  'Thành công',
                                  'Tài khoản của bạn đã được xóa thành công',
                                  [
                                    {
                                      text: 'OK',
                                      onPress: async () => {
                                        await signOut();
                                        router.replace('/(routes)/userInfo');
                                      },
                                    },
                                  ]
                                );
                              } catch (error: any) {
                                Alert.alert('Lỗi', error.message || 'Không thể xóa tài khoản. Vui lòng thử lại.');
                              } finally {
                                setIsDeletingAccount(false);
                              }
                            },
                          },
                        ]
                      );
                    }}
                    style={[
                      styles.modalButton,
                      styles.deleteModalButton,
                      (!deletePassword || isDeletingAccount) && styles.disabledButton,
                    ]}
                    disabled={!deletePassword || isDeletingAccount}>
                    {isDeletingAccount ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Feather name="trash-2" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={[textTheme.subText, styles.deleteModalButtonText]}>
                          Xóa tài khoản
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default AccountInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    paddingBottom: ScreenDimension.scale(30),
  },
  // Header Section
  headerSection: {
    backgroundColor: '#fff',
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingVertical: ScreenDimension.scale(30),
    alignItems: 'center',
    marginBottom: ScreenDimension.scale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    marginBottom: ScreenDimension.scale(15),
  },
  avatar: {
    width: ScreenDimension.scale(100),
    height: ScreenDimension.scale(100),
    borderRadius: ScreenDimension.scale(50),
    backgroundColor: COLOR_THEME.base.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#fff',
    fontSize: ScreenDimension.fontScale(36),
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  nameContainer: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: ScreenDimension.fontScale(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: ScreenDimension.scale(8),
    textAlign: 'center',
  },
  editNameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ScreenDimension.scale(5),
    paddingHorizontal: ScreenDimension.scale(12),
    paddingVertical: ScreenDimension.scale(6),
    borderRadius: 20,
    backgroundColor: '#EEF7FF',
  },
  editNameText: {
    fontSize: ScreenDimension.fontScale(14),
    color: COLOR_THEME.base.primary,
    fontWeight: '500',
  },
  nameEditContainer: {
    width: '100%',
  },
  nameInput: {
    marginBottom: ScreenDimension.scale(12),
  },
  nameEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: ScreenDimension.scale(10),
  },
  nameCancelButton: {
    paddingHorizontal: ScreenDimension.scale(20),
    paddingVertical: ScreenDimension.scale(10),
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  nameCancelText: {
    color: '#666',
    fontSize: ScreenDimension.fontScale(14),
    fontWeight: '500',
  },
  nameSaveButton: {
    paddingHorizontal: ScreenDimension.scale(20),
    paddingVertical: ScreenDimension.scale(10),
    borderRadius: 20,
    backgroundColor: COLOR_THEME.base.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  nameSaveText: {
    color: '#fff',
    fontSize: ScreenDimension.fontScale(14),
    fontWeight: '600',
  },
  // Card Styles
  card: {
    backgroundColor: '#fff',
    width: '100%',
    marginBottom: ScreenDimension.scale(20),
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: ScreenDimension.fontScale(18),
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingTop: ScreenDimension.scale(20),
    paddingBottom: ScreenDimension.scale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardContent: {
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingVertical: ScreenDimension.scale(10),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ScreenDimension.scale(15),
  },
  infoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: ScreenDimension.scale(40),
    height: ScreenDimension.scale(40),
    borderRadius: ScreenDimension.scale(20),
    backgroundColor: '#EEF7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ScreenDimension.scale(12),
  },
  infoItemContent: {
    flex: 1,
  },
  infoItemLabel: {
    fontSize: ScreenDimension.fontScale(13),
    color: '#999',
    marginBottom: ScreenDimension.scale(4),
  },
  infoItemValue: {
    fontSize: ScreenDimension.fontScale(16),
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: ScreenDimension.scale(52),
  },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ScreenDimension.scale(15),
  },
  securityButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityButtonText: {
    fontSize: ScreenDimension.fontScale(16),
    color: '#333',
    fontWeight: '500',
    marginBottom: ScreenDimension.scale(4),
  },
  securityButtonSubtext: {
    fontSize: ScreenDimension.fontScale(12),
    color: '#999',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ScreenDimension.scale(15),
  },
  dangerIconWrapper: {
    backgroundColor: '#FFEBEE',
  },
  dangerButtonText: {
    fontSize: ScreenDimension.fontScale(16),
    color: '#EA6230',
    fontWeight: '500',
    marginBottom: ScreenDimension.scale(4),
  },
  dangerButtonSubtext: {
    fontSize: ScreenDimension.fontScale(12),
    color: '#999',
  },
  dangerModalIconContainer: {
    backgroundColor: '#FFEBEE',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: ScreenDimension.scale(16),
    marginBottom: ScreenDimension.scale(24),
    gap: ScreenDimension.scale(12),
    borderLeftWidth: 4,
    borderLeftColor: '#EA6230',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: ScreenDimension.fontScale(16),
    color: '#EA6230',
    fontWeight: 'bold',
    marginBottom: ScreenDimension.scale(8),
  },
  warningText: {
    fontSize: ScreenDimension.fontScale(13),
    color: '#666',
    lineHeight: ScreenDimension.fontScale(20),
  },
  warningList: {
    marginTop: ScreenDimension.scale(8),
    marginLeft: ScreenDimension.scale(8),
  },
  warningListItem: {
    fontSize: ScreenDimension.fontScale(13),
    color: '#666',
    lineHeight: ScreenDimension.fontScale(20),
    marginBottom: ScreenDimension.scale(4),
  },
  deleteModalButton: {
    backgroundColor: '#EA6230',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalButtonText: {
    color: '#fff',
    fontSize: ScreenDimension.fontScale(16),
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingVertical: ScreenDimension.scale(24),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  modalIconContainer: {
    width: ScreenDimension.scale(48),
    height: ScreenDimension.scale(48),
    borderRadius: ScreenDimension.scale(24),
    backgroundColor: '#EEF7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ScreenDimension.scale(12),
  },
  modalTitle: {
    fontSize: ScreenDimension.fontScale(22),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: ScreenDimension.scale(4),
  },
  modalSubtitle: {
    fontSize: ScreenDimension.fontScale(13),
    color: '#999',
  },
  modalCloseButton: {
    padding: ScreenDimension.scale(5),
    marginTop: ScreenDimension.scale(5),
  },
  modalBody: {
    maxHeight: ScreenDimension.windowHeight * 0.6,
  },
  modalBodyContent: {
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingVertical: ScreenDimension.scale(24),
    paddingBottom: ScreenDimension.scale(100),
  },
  inputGroup: {
    marginBottom: ScreenDimension.scale(24),
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ScreenDimension.scale(10),
    gap: ScreenDimension.scale(6),
  },
  inputLabel: {
    fontSize: ScreenDimension.fontScale(14),
    color: '#333',
    fontWeight: '600',
  },
  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    paddingRight: ScreenDimension.scale(50),
  },
  eyeIconButton: {
    position: 'absolute',
    right: ScreenDimension.scale(15),
    padding: ScreenDimension.scale(5),
    zIndex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ScreenDimension.scale(8),
    paddingLeft: ScreenDimension.scale(4),
    gap: ScreenDimension.scale(6),
  },
  errorText: {
    fontSize: ScreenDimension.fontScale(12),
    color: '#EA6230',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ScreenDimension.scale(8),
    paddingLeft: ScreenDimension.scale(4),
    gap: ScreenDimension.scale(6),
  },
  successText: {
    fontSize: ScreenDimension.fontScale(12),
    color: '#4CAF50',
  },
  passwordRequirements: {
    marginTop: ScreenDimension.scale(10),
    paddingLeft: ScreenDimension.scale(22),
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ScreenDimension.scale(6),
  },
  requirementText: {
    fontSize: ScreenDimension.fontScale(12),
    color: '#999',
  },
  requirementTextMet: {
    color: '#4CAF50',
  },
  passwordMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ScreenDimension.scale(8),
    paddingLeft: ScreenDimension.scale(4),
    gap: ScreenDimension.scale(6),
  },
  passwordMatchText: {
    fontSize: ScreenDimension.fontScale(12),
    fontWeight: '500',
  },
  passwordMatchTextSuccess: {
    color: '#4CAF50',
  },
  passwordMatchTextError: {
    color: '#EA6230',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF7FF',
    borderRadius: 12,
    padding: ScreenDimension.scale(14),
    marginTop: ScreenDimension.scale(8),
    gap: ScreenDimension.scale(10),
  },
  infoBoxText: {
    flex: 1,
    fontSize: ScreenDimension.fontScale(12),
    color: '#666',
    lineHeight: ScreenDimension.fontScale(18),
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingTop: ScreenDimension.scale(10),
    gap: ScreenDimension.scale(12),
  },
  modalButton: {
    flex: 1,
    paddingVertical: ScreenDimension.scale(14),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelModalButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelModalButtonText: {
    color: '#666',
    fontSize: ScreenDimension.fontScale(16),
    fontWeight: '600',
  },
  confirmModalButton: {
    backgroundColor: COLOR_THEME.base.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalButtonText: {
    color: '#fff',
    fontSize: ScreenDimension.fontScale(16),
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  syncStatusContainer: {
    paddingHorizontal: ScreenDimension.horizontalPadding,
    paddingVertical: ScreenDimension.scale(20),
  },
  syncStatusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: ScreenDimension.scale(16),
  },
  syncStatusContent: {
    flex: 1,
    marginLeft: ScreenDimension.scale(12),
  },
  syncStatusTitle: {
    fontSize: ScreenDimension.fontScale(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: ScreenDimension.scale(4),
  },
  syncStatusSubtitle: {
    fontSize: ScreenDimension.fontScale(13),
    color: '#666',
    lineHeight: ScreenDimension.fontScale(18),
  },
  loginButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR_THEME.base.primary,
    paddingVertical: ScreenDimension.scale(14),
    borderRadius: 12,
    marginTop: ScreenDimension.scale(8),
  },
  loginButtonText: {
    color: '#fff',
    fontSize: ScreenDimension.fontScale(16),
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: ScreenDimension.scale(14),
    borderRadius: 12,
    marginTop: ScreenDimension.scale(8),
  },
  syncButtonText: {
    color: '#fff',
    fontSize: ScreenDimension.fontScale(16),
    fontWeight: '600',
  },
});
