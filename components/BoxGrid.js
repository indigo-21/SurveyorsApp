import React from "react";
import { View, StyleSheet, Pressable, ImageBackground } from "react-native";
import Colors from "../constants/Colors";

function BoxGrid({ image, onPress, children }) {
    return (
        <View style={styles.gridItem}>
            <Pressable
                android_ripple={{ color: Colors.ripple }}
                onPress={onPress}
                style={({ pressed }) =>
                    pressed
                        ? [styles.pressedItem, styles.button]
                        : styles.button
                }
            >
                <View style={styles.innerContainer}>
                    {image && (
                        <ImageBackground
                            source={image}
                            style={styles.imageBackground}
                        />
                    )}
                    <View>{children}</View>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    gridItem: {
        borderRadius: 8,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        backgroundColor: Colors.white,
        height: 170,
        width: 180,
        margin: 8,
    },
    button: {
        flex: 1,
    },
    pressedItem: {
        opacity: 0.75,
        backgroundColor: Colors.ripple,
    },
    innerContainer: {
        flex: 1,
        overflow: "hidden",
        alignSelf: "left",
        paddingLeft: 16,
        paddingTop: 70,
    },
    imageBackground: {
        flex: 1,
        position: "absolute",
        width: 110,
        height: 110,
        opacity: 0.1,
        top: -15,
        right: -15,
    },
});

export default BoxGrid;
