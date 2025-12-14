import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, useMemo, useContext } from 'react';
import ScreenContainer from '@/components/container/ScreenContainer';
import { useAuth } from '@/context/UserAuthContext';
import { UserInfo } from '@/storage/userinfo/type';
import { router } from 'expo-router';
import { FontContext } from '@/context/FontThemeContext';
import { ScreenDimension } from '@/constants/Dimensions';
import { COLOR_THEME } from '@/style/ColorTheme';
import { Feather } from '@expo/vector-icons';
import CommonTextInput from '@/components/field/CommonTextInput';
import { ButtonTheme } from '@/style/ButtonTheme';
import { calculateWaterIntake } from './util';
import TimePicker from './component/TimePicker';

const EditHealthInfoScreen = () => {
    const { textTheme } = useContext(FontContext);
    const { user, updateMultipleUserInfo } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    // State để lưu thông tin chỉnh sửa
    const [formData, setFormData] = useState<Partial<UserInfo>>({
        height: user?.height || 0,
        weight: user?.weight || 0,
        wakeUpTime: user?.wakeUpTime || '07:00',
        bedTime: user?.bedTime || '23:00',
        activity: user?.activity || 'sendatry',
        climate: user?.climate || 'temperate',
        dailyGoal: user?.dailyGoal || 2000,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                height: user.height || 0,
                weight: user.weight || 0,
                wakeUpTime: user.wakeUpTime || '07:00',
                bedTime: user.bedTime || '23:00',
                activity: user.activity || 'sendatry',
                climate: user.climate || 'temperate',
                dailyGoal: user.dailyGoal || 2000,
            });
        }
    }, [user]);

    // Tự động tính toán mục tiêu nước khi các dữ liệu khác thay đổi
    const calculatedDailyGoal = useMemo(() => {
        if (!user || !user.age || !user.gender) {
            return formData.dailyGoal || 2000;
        }

        // Kiểm tra xem có đủ dữ liệu để tính toán không
        if (
            formData.height &&
            formData.height > 0 &&
            formData.weight &&
            formData.weight > 0 &&
            formData.wakeUpTime &&
            formData.bedTime &&
            formData.activity &&
            formData.climate
        ) {
            try {
                // Xử lý trường hợp gender là 'Other' - chuyển thành 'preferNotToSay'
                const genderForCalculation = user.gender === 'Other' ? 'preferNotToSay' : user.gender;

                const calculated = calculateWaterIntake({
                    weight: formData.weight,
                    height: formData.height,
                    age: user.age,
                    gender: genderForCalculation as any,
                    activityLevel: formData.activity,
                    wakeUpTime: formData.wakeUpTime,
                    sleepTime: formData.bedTime,
                    weather: formData.climate,
                });
                return calculated;
            } catch (error) {
                console.error('Error calculating water intake:', error);
                return formData.dailyGoal || 2000;
            }
        }
        return formData.dailyGoal || 2000;
    }, [
        formData.height,
        formData.weight,
        formData.wakeUpTime,
        formData.bedTime,
        formData.activity,
        formData.climate,
        user?.age,
        user?.gender,
    ]);


    const handleSave = async () => {
        if (!user || !user.userId) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
            return;
        }

        setIsSaving(true);
        try {
            // Tạo object chứa tất cả các cập nhật
            const updates: Record<string, any> = {};

            if (formData.height !== undefined && formData.height !== null) {
                updates.height = formData.height;
            }
            if (formData.weight !== undefined && formData.weight !== null) {
                updates.weight = formData.weight;
            }
            if (formData.wakeUpTime && formData.wakeUpTime.trim() !== '') {
                updates.wakeUpTime = formData.wakeUpTime;
            }
            if (formData.bedTime && formData.bedTime.trim() !== '') {
                updates.bedTime = formData.bedTime;
            }
            if (formData.activity && formData.activity.trim() !== '') {
                updates.activity = formData.activity;
            }
            if (formData.climate && formData.climate.trim() !== '') {
                updates.climate = formData.climate;
            }
            // Luôn cập nhật dailyGoal với giá trị đã tính toán
            if (calculatedDailyGoal && calculatedDailyGoal > 0) {
                updates.dailyGoal = calculatedDailyGoal;
            }

            // Cập nhật tất cả các trường cùng lúc
            if (Object.keys(updates).length > 0) {
                await updateMultipleUserInfo(updates);
            }

            Alert.alert('Thành công', 'Đã cập nhật thông tin sức khỏe', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            console.error('Error saving health info:', error);
            const errorMessage = error instanceof Error ? error.message : 'Không thể lưu thông tin. Vui lòng thử lại.';
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const activityOptions = [
        { label: 'Ít vận động', value: 'sendatry' },
        { label: 'Hoạt động nhẹ', value: 'light_activity' },
        { label: 'Hoạt động vừa phải', value: 'moderate_activity' },
        { label: 'Rất năng động', value: 'very_active' },
    ];

    const climateOptions = [
        { label: 'Nóng', value: 'hot' },
        { label: 'Ôn hòa', value: 'temperate' },
        { label: 'Lạnh', value: 'cold' },
    ];

    return (
        <ScreenContainer headerTitle="Thông tin sức khỏe" showBackButton={true}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}>
                {/* Chiều cao */}
                <View style={styles.section}>
                    <Text style={[textTheme.subText, styles.label]}>Chiều cao (cm)</Text>
                    <CommonTextInput
                        value={formData.height?.toString() || ''}
                        handleChangeText={(text) => {
                            const height = parseInt(text) || 0;
                            setFormData({ ...formData, height });
                        }}
                        placeholder="Nhập chiều cao"
                        keyboardType="numeric"
                        additionalStyling={styles.input}
                    />
                </View>

                {/* Cân nặng */}
                <View style={styles.section}>
                    <Text style={[textTheme.subText, styles.label]}>Cân nặng (kg)</Text>
                    <CommonTextInput
                        value={formData.weight?.toString() || ''}
                        handleChangeText={(text) => {
                            const weight = parseInt(text) || 0;
                            setFormData({ ...formData, weight });
                        }}
                        placeholder="Nhập cân nặng"
                        keyboardType="numeric"
                        additionalStyling={styles.input}
                    />
                </View>

                {/* Giờ thức dậy */}
                <View style={styles.section}>
                    <View style={styles.timeLabelContainer}>
                        <Feather name="sunrise" size={18} color={COLOR_THEME.base.primary} />
                        <Text style={[textTheme.subText, styles.label]}>Giờ thức dậy</Text>
                    </View>
                    <TimePicker
                        value={formData.wakeUpTime || '07:00'}
                        onChange={(time) => setFormData({ ...formData, wakeUpTime: time })}
                    />
                </View>

                {/* Giờ đi ngủ */}
                <View style={styles.section}>
                    <View style={styles.timeLabelContainer}>
                        <Feather name="moon" size={18} color={COLOR_THEME.base.primary} />
                        <Text style={[textTheme.subText, styles.label]}>Giờ đi ngủ</Text>
                    </View>
                    <TimePicker
                        value={formData.bedTime || '23:00'}
                        onChange={(time) => setFormData({ ...formData, bedTime: time })}
                    />
                </View>

                {/* Mức độ hoạt động */}
                <View style={styles.section}>
                    <Text style={[textTheme.subText, styles.label]}>Mức độ hoạt động</Text>
                    <View style={styles.optionsContainer}>
                        {activityOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionButton,
                                    formData.activity === option.value && styles.optionButtonSelected,
                                ]}
                                onPress={() => setFormData({ ...formData, activity: option.value as any })}>
                                <Text
                                    style={[
                                        styles.optionText,
                                        formData.activity === option.value && styles.optionTextSelected,
                                    ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Khí hậu */}
                <View style={styles.section}>
                    <Text style={[textTheme.subText, styles.label]}>Khí hậu</Text>
                    <View style={styles.optionsContainer}>
                        {climateOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionButton,
                                    formData.climate === option.value && styles.optionButtonSelected,
                                ]}
                                onPress={() => setFormData({ ...formData, climate: option.value as any })}>
                                <Text
                                    style={[
                                        styles.optionText,
                                        formData.climate === option.value && styles.optionTextSelected,
                                    ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Mục tiêu hàng ngày */}
                <View style={styles.section}>
                    <View style={styles.labelContainer}>
                        <Text style={[textTheme.subText, styles.label]}>Mục tiêu nước hàng ngày</Text>
                        <View style={styles.autoBadge}>
                            <Feather name="zap" size={12} color={COLOR_THEME.base.primary} />
                            <Text style={styles.autoBadgeText}>Tự động</Text>
                        </View>
                    </View>
                    <View style={styles.goalDisplayContainer}>
                        <View style={styles.goalValueContainer}>
                            <Text style={styles.goalValue}>{calculatedDailyGoal.toLocaleString()}</Text>
                            <Text style={styles.goalUnit}>ml</Text>
                        </View>
                        <Text style={styles.goalDescription}>
                            Mục tiêu được tính toán dựa trên thông tin sức khỏe của bạn
                        </Text>
                    </View>
                </View>

                {/* Nút lưu */}
                <TouchableOpacity
                    style={[ButtonTheme.containedButton, styles.saveButton, isSaving && ButtonTheme.disableButtom]}
                    onPress={handleSave}
                    disabled={isSaving}>
                    <Text style={textTheme.buttonText}>
                        {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </ScreenContainer>
    );
};

export default EditHealthInfoScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    contentContainer: {
        padding: ScreenDimension.horizontalPadding,
        paddingBottom: ScreenDimension.scale(30),
    },
    section: {
        marginBottom: ScreenDimension.scale(20),
        backgroundColor: '#fff',
        padding: ScreenDimension.scale(16),
        borderRadius: 12,
    },
    label: {
        fontSize: ScreenDimension.fontScale(14),
        fontWeight: '600',
        color: '#333',
        marginBottom: ScreenDimension.scale(8),
    },
    input: {
        marginBottom: 0,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: ScreenDimension.scale(10),
    },
    optionButton: {
        paddingHorizontal: ScreenDimension.scale(16),
        paddingVertical: ScreenDimension.scale(10),
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    optionButtonSelected: {
        backgroundColor: COLOR_THEME.base.primary,
        borderColor: COLOR_THEME.base.primary,
    },
    optionText: {
        fontSize: ScreenDimension.fontScale(14),
        color: '#666',
    },
    optionTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    saveButton: {
        marginTop: ScreenDimension.scale(20),
        width: '100%',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: ScreenDimension.scale(8),
    },
    autoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLOR_THEME.base.primary + '15',
        paddingHorizontal: ScreenDimension.scale(8),
        paddingVertical: ScreenDimension.scale(4),
        borderRadius: 12,
        gap: 4,
    },
    autoBadgeText: {
        fontSize: ScreenDimension.fontScale(11),
        color: COLOR_THEME.base.primary,
        fontWeight: '600',
    },
    goalDisplayContainer: {
        backgroundColor: COLOR_THEME.base.primary + '08',
        borderRadius: 12,
        padding: ScreenDimension.scale(16),
        borderWidth: 1,
        borderColor: COLOR_THEME.base.primary + '20',
    },
    goalValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: ScreenDimension.scale(8),
    },
    goalValue: {
        fontSize: ScreenDimension.fontScale(32),
        fontWeight: '700',
        color: COLOR_THEME.base.primary,
        marginRight: ScreenDimension.scale(8),
    },
    goalUnit: {
        fontSize: ScreenDimension.fontScale(16),
        fontWeight: '600',
        color: COLOR_THEME.base.primary + 'CC',
    },
    goalDescription: {
        fontSize: ScreenDimension.fontScale(12),
        color: '#666',
        lineHeight: ScreenDimension.fontScale(18),
    },
    timeLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ScreenDimension.scale(8),
        marginBottom: ScreenDimension.scale(12),
    },
});

