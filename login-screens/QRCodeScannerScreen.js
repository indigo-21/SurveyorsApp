import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import LoadingOverlay from "../components/LoadingOverlay";

export default function QRCodeScannerScreen() {
    const navigation = useNavigation();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    // const [parsedResult, setParsedResult] = useState(null);

    useEffect(() => {
        async function checkStorage() {
            const scannedData = await AsyncStorage.getItem("scannedData");
            if (scannedData) {
                navigation.navigate("LoginScreen");
            }
        }
        checkStorage();
    }, [navigation]);

    const handleBarCodeScanned = async ({ data }) => {
        setScanned(true);

        try {
            const json = JSON.parse(data);

            await AsyncStorage.setItem("scannedData", JSON.stringify(json));
            navigation.navigate("LoginScreen");

            // Alert.alert("QR Code Scanned", JSON.stringify(json, null, 2));
        } catch (error) {
            Alert.alert("Invalid QR Code", "Could not parse JSON.");
        }
    };

    // const handleRescan = () => {
    //     setScanned(false);
    //     setParsedResult(null);
    // };

    if (!permission) {
        return <LoadingOverlay message="Loading..." />;
    }

    if (!permission.granted) {
        return (
            Alert.alert('Camera Permission Required', 'Please allow camera access to scan QR codes.', [
                {
                    text: 'Allow Camera',
                    onPress: () => {
                        requestPermission();
                    },
                    style: 'default',
                }
            ])
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />
            {/* 
            {scanned && (
                <View style={styles.resultBox}>
                    <Button title="Scan Again" onPress={handleRescan} />
                </View>
            )} */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    resultBox: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: "#000000aa",
        padding: 15,
        borderRadius: 10,
    },
    resultText: {
        color: "#fff",
        fontSize: 14,
        marginTop: 10,
    },
});
