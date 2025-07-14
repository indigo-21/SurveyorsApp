import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function LoadingOverlay({ message }) {
    return (
        <View style={styles.rootContainer}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",

                }}
            >
                <Image
                    source={require("../assets/images/agility_logo.png")}
                    style={styles.logo}
                />
            </View>
            <Text style={styles.message}>{message}</Text>
            <ActivityIndicator size="large" />
        </View>
    );
}

export default LoadingOverlay;

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    message: {
        fontSize: 16,
        marginBottom: 12,
    },
    logo: {
        width: windowWidth * 0.5,
        height: windowHeight * 0.12,
        marginBottom: windowWidth * 0.02,
        resizeMode: "contain",
    },
});