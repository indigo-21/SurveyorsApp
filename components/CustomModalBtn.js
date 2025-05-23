import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "../constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";

function CustomModalBtn({ title, onPress }) {
    return (
        <View style={styles.row}>
            <Pressable
                android_ripple={{ color: Colors.ripple }}
                onPress={onPress}
                style={({ pressed }) =>
                    pressed
                        ? [styles.pressedItem, styles.buttonOptions]
                        : styles.buttonOptions
                }
            >
                <Text style={styles.text}>{title}</Text>
                <AntDesign
                    name="rightcircle"
                    size={24}
                    color={Colors.primary}
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        backgroundColor: "white",
        height: 50,
        borderRadius: 10,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        marginBottom: 8,
        width: "100%",
    },
    pressedItem: {
        opacity: 0.75,
        backgroundColor: Colors.ripple,
    },
    buttonOptions: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    text: {
        textAlign: "center",
    }
});

export default CustomModalBtn;
