import {
    Alert,
    Image,
    ImageBackground,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { login } from "../../util/auth";
import { useContext, useState } from "react";
import { AuthContext } from "../../store/auth-context";

import Colors from "../../constants/Colors";
import CustomButton from "../../components/CustomButton";
import LoadingOverlay from "../../components/LoadingOverlay";

function LoginScreen() {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [enteredEmail, setEnteredEmail] = useState("");
    const [enteredPassword, setEnteredPassword] = useState("");

    const authContext = useContext(AuthContext);

    const loginHandler = async () => {
        setIsAuthenticating(true);
        try {
            const propertyInspectorData = await login(
                enteredEmail,
                enteredPassword,
            );
            const token = propertyInspectorData.token;
            const propertyInspector = propertyInspectorData;

            authContext.authenticate(token, propertyInspector);
        } catch (error) {
            Alert.alert(
                "Login Failed",
                error.response?.data.message ||
                    error.message ||
                    "Could not log you in, please check your credentials",
            );
            setIsAuthenticating(false);
            return;
        }
        setIsAuthenticating(false);
    };

    if (isAuthenticating) {
        return <LoadingOverlay message="Logging in..." />;
    }

    return (
        <ImageBackground
            source={require("../../assets/images/background2.jpg")}
            style={{ flex: 1 }}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    <View style={{ flex: 1 }}>
                        <View style={styles.container}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    
                                }}
                            >
                                <Image
                                    source={require("../../assets/images/agility_logo_login.png")}
                                    style={{width: "80%", height: 130}}
                                />
                            </View>
                            <Text style={styles.loginText}>
                                Welcome to Agility Eco, where you can manage
                                Jobs as a Property Inspector
                            </Text>
                            <TextInput
                                autoCapitalize="none"
                                placeholder="Email"
                                style={styles.input}
                                keyboardType="email-address"
                                autoComplete="email"
                                autoCorrect={false}
                                value={enteredEmail}
                                onChangeText={(text) => setEnteredEmail(text)}
                            />
                            <TextInput
                                placeholder="Password"
                                style={styles.input}
                                secureTextEntry
                                value={enteredPassword}
                                onChangeText={(text) =>
                                    setEnteredPassword(text)
                                }
                            />
                            <View style={styles.buttonContainer}>
                                <CustomButton
                                    text="Login"
                                    importedStyles={{
                                        backgroundColor: Colors.primary,
                                        color: Colors.black,
                                    }}
                                    onPress={loginHandler}
                                />
                            </View>
                        </View>

                        <Image
                            source={require("../../assets/images/login_screen3.png")}
                            style={{
                                width: "100%",
                                height: 200, // Consider using fixed height instead of "30%" for better control
                            }}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        padding: 24,
        flex: 1,
        flexDirection: "column",
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    input: {
        width: "80%",
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#bbbaba",
        borderRadius: 5,
    },
    loginText: {
        color: Colors.text,
        marginHorizontal: 50,
        textAlign: "center",
        marginBottom: 40,
        fontSize: 12,
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        width: "85%", // Ensures the container spans the full width
    },
});

export default LoginScreen;
