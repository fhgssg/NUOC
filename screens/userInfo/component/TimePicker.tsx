import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Pressable } from 'react-native';
import { ScreenDimension } from '@/constants/Dimensions';
import { COLOR_THEME } from '@/style/ColorTheme';
import { Feather } from '@expo/vector-icons';

type TimePickerProps = {
    value: string; // Format: "HH:mm"
    onChange: (time: string) => void;
    label?: string;
};

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, label }) => {
    const [hours, setHours] = useState<string>('07');
    const [minutes, setMinutes] = useState<string>('00');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [tempHours, setTempHours] = useState<string>('07');
    const [tempMinutes, setTempMinutes] = useState<string>('00');
    const hoursListRef = useRef<FlatList>(null);
    const minutesListRef = useRef<FlatList>(null);

    // Parse initial value
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            setHours(h || '07');
            setMinutes(m || '00');
            setTempHours(h || '07');
            setTempMinutes(m || '00');
        }
    }, [value]);

    // Open modal
    const openModal = () => {
        setTempHours(hours);
        setTempMinutes(minutes);
        setIsModalVisible(true);
    };

    // Close modal and apply changes
    const closeModal = (apply: boolean) => {
        if (apply) {
            setHours(tempHours);
            setMinutes(tempMinutes);
            onChange(`${tempHours}:${tempMinutes}`);
        }
        setIsModalVisible(false);
    };

    // Generate options
    const hoursOptions = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return hour;
    });

    const minutesOptions = Array.from({ length: 60 }, (_, i) => {
        const minute = i.toString().padStart(2, '0');
        return minute;
    });

    // Scroll to selected value when modal opens
    useEffect(() => {
        if (isModalVisible) {
            const hoursIndex = hoursOptions.findIndex(h => h === tempHours);
            const minutesIndex = minutesOptions.findIndex(m => m === tempMinutes);
            
            setTimeout(() => {
                if (hoursIndex !== -1 && hoursListRef.current) {
                    hoursListRef.current.scrollToIndex({
                        index: hoursIndex,
                        animated: false,
                        viewPosition: 0.5,
                    });
                }
                if (minutesIndex !== -1 && minutesListRef.current) {
                    minutesListRef.current.scrollToIndex({
                        index: minutesIndex,
                        animated: false,
                        viewPosition: 0.5,
                    });
                }
            }, 100);
        }
    }, [isModalVisible, tempHours, tempMinutes]);

    const handleTempHoursChange = (newHours: string) => {
        setTempHours(newHours);
    };

    const handleTempMinutesChange = (newMinutes: string) => {
        setTempMinutes(newMinutes);
    };

    const scrollToIndex = (ref: React.RefObject<FlatList>, index: number) => {
        if (ref.current && index !== -1) {
            ref.current.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.5,
            });
        }
    };

    const handleScroll = (
        event: any,
        options: string[],
        setValue: (value: string) => void,
    ) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        if (options[index]) {
            setValue(options[index]);
        }
    };

    const formatTime = (h: string, m: string) => {
        const hour = parseInt(h);
        const period = hour >= 12 ? 'CH' : 'SA';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour.toString().padStart(2, '0')}:${m} ${period}`;
    };

    const formatTime24 = (h: string, m: string) => {
        return `${h}:${m}`;
    };

    const renderHoursItem = ({ item, index }: { item: string; index: number }) => {
        const isSelected = item === tempHours;
        return (
            <TouchableOpacity
                onPress={() => {
                    scrollToIndex(hoursListRef, index);
                    handleTempHoursChange(item);
                }}>
                <View
                    style={[
                        styles.item,
                        isSelected && styles.selectedItem,
                    ]}>
                    <Text
                        style={[
                            styles.itemText,
                            isSelected && styles.selectedItemText,
                        ]}>
                        {item}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderMinutesItem = ({ item, index }: { item: string; index: number }) => {
        const isSelected = item === tempMinutes;
        return (
            <TouchableOpacity
                onPress={() => {
                    scrollToIndex(minutesListRef, index);
                    handleTempMinutesChange(item);
                }}>
                <View
                    style={[
                        styles.item,
                        isSelected && styles.selectedItem,
                    ]}>
                    <Text
                        style={[
                            styles.itemText,
                            isSelected && styles.selectedItemText,
                        ]}>
                        {item}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <>
            {/* Display Button */}
            <TouchableOpacity
                style={styles.displayButton}
                onPress={openModal}
                activeOpacity={0.7}>
                <View style={styles.displayContent}>
                    <Feather name="clock" size={20} color={COLOR_THEME.base.primary} />
                    <View style={styles.displayTextContainer}>
                        <Text style={styles.displayLabel}>Thời gian</Text>
                        <Text style={styles.displayTime}>
                            {formatTime(hours, minutes)}
                        </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#999" />
                </View>
            </TouchableOpacity>

            {/* Modal Picker */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => closeModal(false)}>
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => closeModal(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn thời gian</Text>
                            <TouchableOpacity
                                onPress={() => closeModal(false)}
                                style={styles.closeButton}>
                                <Feather name="x" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.pickerContainer}>
                {/* Hours Picker */}
                <View style={styles.pickerColumn}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerLabel}>Giờ</Text>
                    </View>
                    <View style={styles.pickerWrapper}>
                        <FlatList
                            ref={hoursListRef}
                            data={hoursOptions}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            onScroll={(e) =>
                                handleScroll(e, hoursOptions, handleTempHoursChange)
                            }
                            scrollEventThrottle={16}
                            nestedScrollEnabled={true}
                            contentContainerStyle={{
                                paddingTop: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
                                paddingBottom: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
                            }}
                            onScrollToIndexFailed={(error: any) => {
                                hoursListRef.current?.scrollToOffset({
                                    offset: error.averageItemLength * error.index,
                                    animated: false,
                                });
                                setTimeout(() => {
                                    if (
                                        hoursOptions.length !== 0 &&
                                        hoursListRef.current !== null
                                    ) {
                                        hoursListRef.current.scrollToIndex({
                                            index: error.index,
                                            animated: false,
                                        });
                                    }
                                }, 100);
                            }}
                            renderItem={renderHoursItem}
                        />
                    </View>
                </View>

                {/* Separator */}
                <View style={styles.separator}>
                    <Text style={styles.separatorText}>:</Text>
                </View>

                {/* Minutes Picker */}
                <View style={styles.pickerColumn}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerLabel}>Phút</Text>
                    </View>
                    <View style={styles.pickerWrapper}>
                        <FlatList
                            ref={minutesListRef}
                            data={minutesOptions}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={ITEM_HEIGHT}
                            decelerationRate="fast"
                            onScroll={(e) =>
                                handleScroll(
                                    e,
                                    minutesOptions,
                                    handleTempMinutesChange,
                                )
                            }
                            scrollEventThrottle={16}
                            nestedScrollEnabled={true}
                            contentContainerStyle={{
                                paddingTop: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
                                paddingBottom: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
                            }}
                            onScrollToIndexFailed={(error: any) => {
                                minutesListRef.current?.scrollToOffset({
                                    offset: error.averageItemLength * error.index,
                                    animated: false,
                                });
                                setTimeout(() => {
                                    if (
                                        minutesOptions.length !== 0 &&
                                        minutesListRef.current !== null
                                    ) {
                                        minutesListRef.current.scrollToIndex({
                                            index: error.index,
                                            animated: false,
                                        });
                                    }
                                }, 100);
                            }}
                            renderItem={renderMinutesItem}
                        />
                    </View>
                </View>

                {/* Period Display (SA/CH) */}
                <View style={styles.periodContainer}>
                    <View style={styles.periodBox}>
                        <Text style={styles.periodText}>
                            {parseInt(tempHours) >= 12 ? 'CH' : 'SA'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Display formatted time in modal */}
            <View style={styles.timeDisplay}>
                <Feather name="clock" size={16} color={COLOR_THEME.base.primary} />
                <Text style={styles.timeDisplayText}>
                    {formatTime(tempHours, tempMinutes)}
                </Text>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => closeModal(false)}>
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => closeModal(true)}>
                    <Text style={styles.confirmButtonText}>Xác nhận</Text>
                </TouchableOpacity>
            </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    displayButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: ScreenDimension.scale(16),
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    displayContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ScreenDimension.scale(12),
    },
    displayTextContainer: {
        flex: 1,
    },
    displayLabel: {
        fontSize: ScreenDimension.fontScale(12),
        color: '#666',
        marginBottom: ScreenDimension.scale(4),
    },
    displayTime: {
        fontSize: ScreenDimension.fontScale(16),
        fontWeight: '600',
        color: COLOR_THEME.base.primary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: ScreenDimension.scale(30),
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: ScreenDimension.scale(20),
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: ScreenDimension.fontScale(18),
        fontWeight: '700',
        color: '#333',
    },
    closeButton: {
        padding: ScreenDimension.scale(4),
    },
    modalActions: {
        flexDirection: 'row',
        gap: ScreenDimension.scale(12),
        padding: ScreenDimension.scale(20),
        paddingTop: ScreenDimension.scale(16),
    },
    modalButton: {
        flex: 1,
        paddingVertical: ScreenDimension.scale(14),
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    cancelButtonText: {
        fontSize: ScreenDimension.fontScale(16),
        fontWeight: '600',
        color: '#666',
    },
    confirmButton: {
        backgroundColor: COLOR_THEME.base.primary,
    },
    confirmButtonText: {
        fontSize: ScreenDimension.fontScale(16),
        fontWeight: '600',
        color: '#fff',
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: ScreenDimension.scale(250),
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        paddingVertical: ScreenDimension.scale(10),
        position: 'relative',
    },
    pickerColumn: {
        flex: 1,
        height: '100%',
    },
    pickerHeader: {
        alignItems: 'center',
        paddingBottom: ScreenDimension.scale(8),
    },
    pickerLabel: {
        fontSize: ScreenDimension.fontScale(12),
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
    },
    pickerWrapper: {
        flex: 1,
        position: 'relative',
    },
    item: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: ScreenDimension.fontScale(18),
        color: '#999',
    },
    selectedItem: {
        backgroundColor: COLOR_THEME.base.primary + '15',
        borderRadius: 8,
        marginHorizontal: ScreenDimension.scale(8),
    },
    selectedItemText: {
        fontSize: ScreenDimension.fontScale(24),
        fontWeight: '700',
        color: COLOR_THEME.base.primary,
    },
    separator: {
        width: ScreenDimension.scale(20),
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: ScreenDimension.scale(30),
    },
    separatorText: {
        fontSize: ScreenDimension.fontScale(32),
        fontWeight: '700',
        color: COLOR_THEME.base.primary,
    },
    periodContainer: {
        width: ScreenDimension.scale(50),
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: ScreenDimension.scale(30),
    },
    periodBox: {
        backgroundColor: COLOR_THEME.base.primary,
        paddingHorizontal: ScreenDimension.scale(12),
        paddingVertical: ScreenDimension.scale(6),
        borderRadius: 8,
    },
    periodText: {
        fontSize: ScreenDimension.fontScale(14),
        fontWeight: '700',
        color: '#fff',
    },
    timeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: ScreenDimension.scale(12),
        gap: ScreenDimension.scale(8),
        paddingVertical: ScreenDimension.scale(8),
        backgroundColor: COLOR_THEME.base.primary + '10',
        borderRadius: 8,
    },
    timeDisplayText: {
        fontSize: ScreenDimension.fontScale(16),
        fontWeight: '600',
        color: COLOR_THEME.base.primary,
    },
});

export default TimePicker;

