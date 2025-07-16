import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function QRCodeScannerScreen() {
    const navigation = useNavigation();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);

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
        if (scanned || processing) return; // Prevent multiple scans
        
        setScanned(true);
        setProcessing(true);

        try {
            console.log('QR Code data received:', data);
            const json = JSON.parse(data);

            await AsyncStorage.setItem("scannedData", JSON.stringify(json));
            
            Alert.alert(
                "Server Configuration Loaded", 
                "Successfully scanned server QR code! Redirecting to login...",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.navigate("LoginScreen");
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('QR Code parsing error:', error);
            Alert.alert(
                "Invalid Server QR Code", 
                "Could not read server configuration from QR code. Please ensure you're scanning the correct QR code provided by your administrator.",
                [
                    {
                        text: "Try Again",
                        onPress: () => {
                            setScanned(false);
                            setProcessing(false);
                        }
                    }
                ]
            );
        }
    };

    const handleRescan = () => {
        setScanned(false);
        setProcessing(false);
    };

    if (!permission) {
        return <LoadingOverlay message="Loading..." />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    Camera access is required to scan the server QR code
                </Text>
                <Text style={styles.permissionSubText}>
                    The QR code contains the server configuration needed to connect to your organization's system.
                </Text>
                <TouchableOpacity 
                    style={styles.permissionButton} 
                    onPress={requestPermission}
                >
                    <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{ 
                    barcodeTypes: ["qr"],
                    interval: 500, // Scan every 500ms for faster detection
                }}
                enableTorch={false}
                autofocus="on"
            />
            
            {/* Scanner overlay for better UX */}
            <View style={styles.overlay}>
                <View style={styles.scannerFrame} />
                <Text style={styles.instructionText}>
                    {processing ? "Processing QR Code..." : "Scan the server configuration QR code"}
                </Text>
            </View>
            
            {scanned && !processing && (
                <View style={styles.resultBox}>
                    <Text style={styles.resultText}>Server Configuration Loaded!</Text>
                    <Button title="Scan Again" onPress={handleRescan} color="#007AFF" />
                </View>
            )}
            
            {processing && (
                <View style={styles.processingOverlay}>
                    <LoadingOverlay message="Processing QR Code..." />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center" 
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerFrame: {
        width: 250,
        height: 250,
        borderWidth: 3,
        borderColor: '#00FF00',
        borderRadius: 10,
        backgroundColor: 'transparent',
        borderStyle: 'dashed',
    },
    instructionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 20,
        overflow: 'hidden',
    },
    resultBox: {
        position: "absolute",
        bottom: 80,
        left: 20,
        right: 20,
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    resultText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    processingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    permissionText: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 15,
        color: '#333',
        lineHeight: 28,
        fontWeight: '600',
    },
    permissionSubText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    permissionButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 10,
        minWidth: 250,
        alignItems: 'center',
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
