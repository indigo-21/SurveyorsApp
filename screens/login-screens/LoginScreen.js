import {
    Alert,
    Dimensions,
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

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

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
            setEnteredEmail("");
            setEnteredPassword("");
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
                                    source={require("../../assets/images/agility_logo.png")}
                                    style={styles.logo}
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
                            style={styles.imageBottom}
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
        width: windowWidth * 0.5,
        height: windowHeight * 0.12,
        marginBottom: windowWidth * 0.02,
        resizeMode: "contain",
    },
    input: {
        width: windowWidth * 0.85,
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
        width: "85%",
        width: windowWidth * 0.85,

    },
    imageBottom: {
        width: "100%",
        height: windowHeight * 0.3,
        resizeMode: "contain",
    }
});

export default LoginScreen;
