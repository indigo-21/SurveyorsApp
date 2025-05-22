import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

export default function ScreenWrapper({ children }) {
    return (
        <ImageBackground
            source={require('../assets/images/background2.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                {children}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    container: {
        margin: 16,
        flex: 1,
    }
});