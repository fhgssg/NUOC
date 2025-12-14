// /app/(auth)/_layout.tsx

import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        // Ẩn header cho tất cả các màn hình trong nhóm (auth)
        <Stack screenOptions={{ headerShown: false }} />
    );
}