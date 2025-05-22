import React from "react";
import { View, StyleSheet, Pressable, ImageBackground, Text } from "react-native";
import Colors from "../constants/Colors";

function ConfigrationGrid({ importedStyles, textContent, onPress, children }) {
    return (
        <View style={styles.container}>
            <View style={[styles.gridItem, importedStyles]}>
                <Pressable style={styles.button} onPress={onPress} android_ripple={{ color: Colors.ripple }}>
                    <View style={styles.content}>{children}</View>
                    <Text style={styles.textBottomCenter}>{textContent}</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    gridItem: {
        borderRadius: 8,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        backgroundColor: Colors.white,
        height: 56,
        margin: 8,
        // overflow: "hidden",
    },
    button: {
        paddingTop: 8,
        flex: 1,
    },
    content: {
        justifyContent: "center",
        alignItems: "center",
    },
    textBottomCenter: {
        fontSize: 12,
        paddingVertical: 4,
        color: Colors.black,
        textAlign: "center",
        color: Colors.primary
    },
});

export default ConfigrationGrid;
