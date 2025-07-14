import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { AuthContext } from "../../store/auth-context";
import { logout, sendSMS, verifyOTP } from "../../util/auth";
import {
    Alert,
    Dimensions,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import LoadingOverlay from "../../components/LoadingOverlay";
import CustomButton from "../../components/CustomButton";
import Colors from "../../constants/Colors";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function OTPVerificationScreen() {
    const navigation = useNavigation();
    const authContext = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [enteredOtp, setEnteredOtp] = useState("");
    const [isResend, setIsResend] = useState({
        isActive: true,
        time: 30,
    });

    const parsePropertyInspector = authContext.propertyInspector;
    const piID = parsePropertyInspector.user.id;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, []);

    const sendSMSFunction = async () => {
        try {
            await sendSMS(piID);
        } catch (error) {
            Alert.alert(
                "Error",
                error.response?.data.message ||
                error.message ||
                "Could not send SMS, please try again later",
            );
        }
    };

    useEffect(() => {
        setIsLoading(true);
        if (
            parsePropertyInspector.user?.otp != null &&
            parsePropertyInspector.user?.otp_verified_at != null
        ) {
            navigation.reset({
                index: 0,
                routes: [{ name: "Dashboard" }],
            });
        } else {
            sendSMSFunction();
            setIsLoading(false);
        }
    }, [
        parsePropertyInspector.user?.otp,
        parsePropertyInspector.user?.otp_verified_at
    ]);

    useEffect(() => {
        let timer;
        if (isResend.isActive && isResend.time > 0) {
            timer = setInterval(() => {
                setIsResend((prev) => ({
                    ...prev,
                    time: prev.time - 1,
                }));
            }, 1000);
        }
        if (isResend.time <= 0 && isResend.isActive) {
            setIsResend((prev) => ({
                ...prev,
                isActive: false,
                time: 0,
            }));
        }
        return () => clearInterval(timer);
    }, [isResend.isActive, isResend.time]);

    const resendOtpHandler = () => {

        if (isResend.isActive) {
            console.log("Resending OTP...");
            return;
        } else {
            setIsResend((prev) => ({
                ...prev,
                isActive: true,
                time: 30,
            }));
            console.log("Resending OTP...");
        }
        sendSMSFunction();
    };

    const backButtonHandler = async () => {
        try {
            await logout(piID);
            authContext.logout();
        } catch (error) {
            Alert.alert(
                "Logout Failed",
                error.response?.data.message ||
                error.message ||
                "Could not log you out, please try again later",
            );
        }
    };

    const verifyButtonHandler = async () => {
        setIsLoading(true);
        try {
            const response = await verifyOTP(piID, enteredOtp);

            authContext.updatePropertyInspector(response.otp, response.otp_verified_at);

            navigation.reset({
                index: 0,
                routes: [{ name: "Dashboard" }],
            });
        } catch (error) {
            Alert.alert(
                "Verification Failed",
                error.response?.data.message ||
                error.message ||
                "Could not verify OTP, please try again later",
            );
            setIsLoading(false);
            return;
        }
    };

    if (isLoading) {
        return <LoadingOverlay message="Loading..." />;
    }

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <ImageBackground
                source={require("../../assets/images/background2.jpg")}
                style={{ flex: 1 }}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled">
                        <View style={styles.container}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",

                                }}
                            >
                                <Image
                                    source={require("../../assets/images/agility_logo.png")}
                                    style={styles.logo}
                                />
                            </View>

                            <Text style={styles.title}>OTP Verification</Text>
                            <Text style={styles.text}>
                                A six digit code has been sent to your mobile phone.
                                Please type this in below and click verify. This code is
                                one time limited and will expire in one hour. If you
                                need the code to be resent click the resend code button.
                            </Text>

                            <TextInput
                                placeholder="Verification Code"
                                style={styles.input}
                                keyboardType="number-pad"
                                value={enteredOtp}
                                maxLength={6}
                                onChangeText={(text) => setEnteredOtp(text)}
                            />

                            <Text style={styles.smallText}>
                                If you did not receive the code, please check your
                                mobile number or click resend code.
                            </Text>

                            <Pressable
                                disabled={isResend.isActive}
                                onPress={resendOtpHandler}
                            >
                                <Text style={styles.resendText}>
                                    Resend Code{" "}
                                    {isResend.isActive && `(${isResend.time}s)`}
                                </Text>
                            </Pressable>

                            <View style={styles.buttonContainer}>
                                <CustomButton
                                    text="Back"
                                    importedStyles={{
                                        backgroundColor: Colors.cancel,
                                        color: Colors.white,
                                    }}
                                    onPress={backButtonHandler}
                                />
                                <CustomButton
                                    text="Verify"
                                    importedStyles={{
                                        backgroundColor: Colors.primary,
                                        color: Colors.black,
                                    }}
                                    onPress={verifyButtonHandler}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground >
        </>
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
        marginBottom: windowHeight * 0.03,
        fontStyle: "italic",
        color: Colors.primary,
    },
    logo: {
        width: windowWidth * 0.5,
        height: windowHeight * 0.12,
        marginBottom: windowWidth * 0.02,
        resizeMode: "contain",
    },
    smallText: {
        fontSize: 12,
        color: Colors.cancel,
        textAlign: "center",
        paddingHorizontal: 40,
        marginTop: 10,
    },
    resendText: {
        fontSize: 12,
        color: Colors.primary,
        textAlign: "center",
        paddingHorizontal: 40,
        marginTop: 10,
        marginBottom: 20,
    },
    input: {
        width: windowWidth * 0.85,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#bbbaba",
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        width: windowWidth * 0.85,
    },
});

export default OTPVerificationScreen;
