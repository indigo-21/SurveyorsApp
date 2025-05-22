import { StyleSheet, Text, View } from "react-native";
import Colors from "../constants/Colors";

function JobDetailsBox({ title, children }) {
    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: Colors.white,
        marginVertical: 8,
        borderRadius: 8,
    },
    titleContainer: {
        flexDirection: "row",
        fontSize: 16,
        fontWeight: "bold",
        backgroundColor: Colors.primary,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
    title: {
        flex: 1,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.white,
        padding: 8,
    },
    content: {
        width: "100%",
        padding: 16,
        backgroundColor: Colors.white,
        borderBottomEndRadius: 8,
        borderBottomStartRadius: 8,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    }
});

export default JobDetailsBox;
