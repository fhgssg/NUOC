// /app/(auth)/login.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/UserAuthContext'; // Dùng relative path để import hook
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenDimension } from '@/constants/Dimensions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLOR_THEME } from '@/style/ColorTheme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn, isAuthenticated, isLoading, user, isRegistered } = useAuth(); // Lấy thêm state từ context
    const router = useRouter();

    // Refs cho các TextInput
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    // Tự động điều hướng khi đăng nhập thành công (chỉ khi đã đăng nhập Firebase)
    useEffect(() => {
        // Chỉ redirect nếu đã đăng nhập Firebase (isRegistered = true) và có user
        // Sau khi đăng nhập, luôn chuyển đến trang chủ để tiếp tục sử dụng ứng dụng
        if (!isLoading && isAuthenticated && user && isRegistered) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, isLoading, user, isRegistered]);

    const getErrorMessage = (errorCode: string): string => {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'Email không tồn tại. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.';
            case 'auth/wrong-password':
                return 'Mật khẩu không đúng. Vui lòng kiểm tra lại.';
            case 'auth/invalid-credential':
                return 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
            case 'auth/invalid-email':
                return 'Email không hợp lệ. Vui lòng kiểm tra lại.';
            case 'auth/user-disabled':
                return 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.';
            case 'auth/network-request-failed':
                return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
            case 'auth/too-many-requests':
                return 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau.';
            default:
                return `Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.`;
        }
    };

    const handleLogin = async () => {
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
        setLoading(true);
        setError('');
        try {
            await signIn(email, password);
            console.log('Sign in completed, waiting for auth state update...');
            // Đăng nhập thành công, useEffect sẽ tự động điều hướng khi isAuthenticated thay đổi
            // Không cần setLoading(false) ở đây vì sẽ redirect
        } catch (err: any) {
            // Log như warning vì đây là thông báo bình thường khi người dùng nhập sai thông tin
            console.warn('Login failed:', err?.code || err?.message || 'Invalid credentials');
            // Firebase có thể trả về error.code hoặc error.message
            const errorCode = err?.code || (err?.message?.includes('auth/') ? err.message : '') || 'unknown-error';
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
                    <Text style={styles.title}>Đăng Nhập</Text>
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
                            placeholder="Mật khẩu"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
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
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {loading ? (
                        <ActivityIndicator size="large" color={COLOR_THEME.base.primary} style={styles.loader} />
                    ) : (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.7}>
                            <Text style={styles.buttonText}>Đăng Nhập</Text>
                        </TouchableOpacity>
                    )}

                    <Link href="/(auth)/register" style={styles.link}>
                        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký ngay</Text>
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