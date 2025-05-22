import { Pressable, StyleSheet, View } from "react-native";
import Colors from "../constants/Colors";

function JobList({ onPress, children }) {
    return (
        <View style={styles.row}>
            <Pressable
                onPress={onPress}
                android_ripple={{ color: Colors.ripple }}
                style={({ pressed }) =>
                    pressed
                        ? [styles.pressedItem, styles.button]
                        : styles.button
                }
            >
                {children}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        backgroundColor: "white",
        marginVertical: 5,
        borderRadius: 10,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        alignItems: "center",
        width: "100%",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        padding: 8,
    },
    pressedItem: {
        opacity: 0.75,
        backgroundColor: Colors.ripple,
    },
});

export default JobList;
