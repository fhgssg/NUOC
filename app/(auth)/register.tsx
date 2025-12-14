// /app/(auth)/register.tsx

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/UserAuthContext'; // Dùng relative path để import hook
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenDimension } from '@/constants/Dimensions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLOR_THEME } from '@/style/ColorTheme';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp, isAuthenticated, isLoading, user, isRegistered } = useAuth();
    const router = useRouter();

    // Refs cho các TextInput
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    // Tự động điều hướng khi đăng ký thành công
    useEffect(() => {
        // Chỉ redirect nếu đã đăng ký thành công (isRegistered = true) và có user
        // Sau khi đăng ký, luôn chuyển đến trang chủ để tiếp tục sử dụng ứng dụng
        if (!isLoading && isAuthenticated && user && isRegistered) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, isLoading, user, isRegistered]);

    const getErrorMessage = (errorCode: string): string => {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'Email này đã được sử dụng. Vui lòng dùng email khác hoặc đăng nhập.';
            case 'auth/invalid-email':
                return 'Email không hợp lệ. Vui lòng kiểm tra lại.';
            case 'auth/operation-not-allowed':
                return 'Đăng ký không được phép. Vui lòng liên hệ hỗ trợ.';
            case 'auth/weak-password':
                return 'Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu có ít nhất 6 ký tự.';
            case 'auth/network-request-failed':
                return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
            default:
                return `Đăng ký thất bại: ${errorCode || 'Lỗi không xác định'}`;
        }
    };

    const handleRegister = async () => {
        // Kiểm tra và focus vào ô đầu tiên còn trống
        if (!email) {
            setError('Vui lòng điền đủ email và mật khẩu.');
            emailInputRef.current?.focus();
            return;
        }
        if (!password) {
            setError('Vui lòng điền đủ email và mật khẩu.');
            passwordInputRef.current?.focus();
            return;
        }
        if (!confirmPassword) {
            setError('Vui lòng xác nhận mật khẩu.');
            confirmPasswordInputRef.current?.focus();
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Email không đúng định dạng. Vui lòng kiểm tra lại.');
            emailInputRef.current?.focus();
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            passwordInputRef.current?.focus();
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            setError('Mật khẩu và xác nhận mật khẩu không khớp.');
            confirmPasswordInputRef.current?.focus();
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Không cần name nữa, dùng empty string
            await signUp(email, password, '');
            // Đăng ký thành công, chờ auth state update và chuyển đến trang chủ
            // useEffect sẽ tự động điều hướng khi isAuthenticated và isRegistered thay đổi
        } catch (err: any) {
            console.error('Registration error:', err);
            const errorCode = err?.code || err?.message || 'unknown-error';
            const errorMessage = getErrorMessage(errorCode);
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <Text style={styles.title}>Đăng Ký Tài Khoản</Text>
                    <TextInput
                        ref={emailInputRef}
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                        blurOnSubmit={false}
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={passwordInputRef}
                            style={styles.passwordInput}
                            placeholder="Mật khẩu (ít nhất 6 ký tự)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            returnKeyType="next"
                            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                            blurOnSubmit={false}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={ScreenDimension.scale(24)}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={confirmPasswordInputRef}
                            style={styles.passwordInput}
                            placeholder="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            returnKeyType="done"
                            onSubmitEditing={handleRegister}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Ionicons
                                name={showConfirmPassword ? 'eye-off' : 'eye'}
                                size={ScreenDimension.scale(24)}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {loading ? (
                        <ActivityIndicator size="large" color={COLOR_THEME.base.primary} style={styles.loader} />
                    ) : (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.7}>
                            <Text style={styles.buttonText}>Đăng Ký</Text>
                        </TouchableOpacity>
                    )}

                    <Link href="/(auth)/login" style={styles.link}>
                        <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
                    </Link>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: ScreenDimension.horizontalPadding,
        paddingVertical: ScreenDimension.verticalPadding * 2,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        fontSize: ScreenDimension.fontScale(24),
        fontWeight: 'bold',
        marginBottom: ScreenDimension.scale(30),
        textAlign: 'center',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: ScreenDimension.scale(12),
        marginBottom: ScreenDimension.scale(15),
        borderRadius: 8,
        fontSize: ScreenDimension.fontScale(16),
        backgroundColor: '#fff',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: ScreenDimension.scale(15),
        backgroundColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        padding: ScreenDimension.scale(12),
        fontSize: ScreenDimension.fontScale(16),
    },
    eyeIcon: {
        padding: ScreenDimension.scale(10),
    },
    errorText: {
        color: 'red',
        marginBottom: ScreenDimension.scale(15),
        textAlign: 'center',
        fontSize: ScreenDimension.fontScale(14),
        paddingHorizontal: ScreenDimension.horizontalPadding,
    },
    link: {
        marginTop: ScreenDimension.scale(20),
        textAlign: 'center',
    },
    linkText: {
        color: COLOR_THEME.base.primary,
        fontSize: ScreenDimension.fontScale(14),
    },
    button: {
        backgroundColor: COLOR_THEME.base.primary,
        paddingVertical: ScreenDimension.scale(14),
        borderRadius: 8,
        alignItems: 'center',
        marginTop: ScreenDimension.scale(10),
    },
    buttonText: {
        color: '#fff',
        fontSize: ScreenDimension.fontScale(16),
        fontWeight: '600',
    },
    loader: {
        marginVertical: ScreenDimension.scale(20),
    },
});