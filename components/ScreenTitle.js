import { Text, View } from "react-native";
import Colors from "../constants/Colors";

function ScreenTitle({ title, size }) {
    return (
        <View>
            <Text style={[styles.title, { fontSize: size || 18 }]}>
                {title}
            </Text>
        </View >
    );
}

const styles = {
    title: {
        color: Colors.primary,
        fontWeight: '600',
        marginLeft: 8
    },
};

export default ScreenTitle;
