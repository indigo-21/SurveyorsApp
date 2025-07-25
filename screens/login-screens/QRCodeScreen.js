import { Dimensions, Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/CustomButton";
import Colors from "../../constants/Colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingOverlay from "../../components/LoadingOverlay";

const windowWidth = Dimensions.get('window').width;

function QRCodeScreen() {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkStorage() {
            const scannedData = await AsyncStorage.getItem("scannedData");
            if (scannedData) {
                navigation.navigate("LoginScreen");
            } else {
                setIsLoading(false);
            }
        }
        checkStorage();
    }, [navigation]);

    const qrButtonHandler = () => {
        // Navigate to QR code scanner screen
        navigation.navigate("QRCodeScanner");
    };

    if (isLoading) {
        return <LoadingOverlay message="Loading..." />;
    }

    return (
        <ImageBackground
            source={require("../../assets/images/background2.jpg")}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <Image
                    source={require("../../assets/images/agility_logo.png")}
                    style={styles.image}
                    resizeMode="contain"
                />

                <Text style={styles.title}>Welcome!</Text>
                <Text style={styles.text}>
                    To get started, please scan the QR code provided by your
                    administrator. This QR code will configure the app to
                    connect to the correct backend domain. Without scanning, you
                    won’t be able to use the app’s features.
                </Text>
                <View style={styles.buttonContainer}>
                    <CustomButton
                        text="Scan QR Code"
                        importedStyles={{
                            backgroundColor: Colors.primary,
                            color: Colors.black,
                        }}
                        onPress={qrButtonHandler}
                    />
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        color: "#000",
    },
    text: {
        fontSize: 14,
        color: "#000",
        textAlign: "center",
        paddingHorizontal: windowWidth * 0.1,
        marginTop: 10,
        marginBottom: 20,
    },
    image: {
        width: windowWidth * 0.5,
        height: 120,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        width: "85%", // Ensures the container spans the full width
    },
});

export default QRCodeScreen;
