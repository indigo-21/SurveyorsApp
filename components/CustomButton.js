import { View, Text, StyleSheet, Pressable } from "react-native";
import Colors from "../constants/Colors";

function CustomButton({ importedStyles, text, onPress, disabled }) {
    return (
        <View style={{ flex: 1, flexDirection: "row" }}>
            <Pressable
                disabled={disabled}
                android_ripple={{ color: Colors.ripple }}
                onPress={onPress}
                style={({ pressed }) =>
                    pressed
                        ? [styles.pressedItem, styles.button]
                        : [importedStyles, styles.button]
                }
            >
                <Text style={styles.textStyle}>{text}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        flex: 1,
        borderRadius: 20,
        elevation: 2,
        marginHorizontal: 8,
        overflow: "hidden"
    },
    textStyle: {
        color: Colors.white,
        fontWeight: "bold",
        textAlign: "center",
        padding: 10,
    },
    pressedItem: {
        opacity: 0.75,
        backgroundColor: Colors.ripple,
    },
});

export default CustomButton;
