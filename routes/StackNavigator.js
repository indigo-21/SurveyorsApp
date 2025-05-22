import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { AuthContext } from "../store/auth-context";

import Colors from "../constants/Colors";
import DashboardScreen from "../screens/DashboardScreen";
import CurrentVisitScreen from "../screens/CurrentVisitScreen";
import UpdateJobScreen from "../screens/UpdateJobScreen";
import JobDetailsScreen from "../screens/JobDetailsScreen";
import QuestionSetScreen from "../screens/QuestionSetScreen";
import BookJobScreen from "../screens/BookJobScreen";
import CompletedVisitScreen from "../screens/CompletedVisitScreen";
import SurveyScreen from "../screens/SurveyScreen";
import LoginScreen from "../login-screens/LoginScreen";
import QRCodeScannerScreen from "../login-screens/QRCodeScannerScreen";
import QRCodeScreen from "../login-screens/QRCodeScreen";
import OTPVerificationScreen from "../screens/OTPVerificationScreen";
import { Image } from "react-native";

const Stack = createNativeStackNavigator();

function AuthStack() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name="QRCode"
                    component={QRCodeScreen}
                />

                <Stack.Screen
                    name="QRCodeScanner"
                    component={QRCodeScannerScreen}
                />

                <Stack.Screen name="LoginScreen" component={LoginScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

function AuthenticatedStack() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: Colors.primary,
                    },
                    headerTintColor: Colors.white,
                }}
            >
                <Stack.Screen
                    name="OTPVerification"
                    component={OTPVerificationScreen}
                />
                <Stack.Screen
                    name="Dashboard"
                    component={DashboardScreen}
                    options={{
                        headerBackVisible: false,
                        gestureEnabled: false,
                        headerTitle: () => (
                            <Image
                                source={require("../assets/images/AgilityEco_WhiteLogo.png")}
                                style={{
                                    width: 120,
                                    height: 70,
                                    resizeMode: "contain",
                                    alignSelf: "center",
                                }}
                            />
                        ),
                        headerStyle: {
                            backgroundColor: Colors.primary,
                        },
                    }}
                />
                <Stack.Screen
                    name="CurrentVisits"
                    component={CurrentVisitScreen}
                />
                <Stack.Screen
                    name="UpdateJob"
                    component={UpdateJobScreen}
                />
                <Stack.Screen
                    name="JobDetails"
                    component={JobDetailsScreen}
                />
                <Stack.Screen
                    name="QuestionSets"
                    component={QuestionSetScreen}
                />

                <Stack.Screen
                    name="BookJobs"
                    component={BookJobScreen}
                />

                <Stack.Screen
                    name="CompletedVisits"
                    component={CompletedVisitScreen}
                />

                <Stack.Screen
                    name="Survey"
                    component={SurveyScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

function StackNavigator() {
    const authContext = useContext(AuthContext);

    if (authContext.isAuthenticated) {
        return <AuthenticatedStack />;
    }

    return <AuthStack />;
}

export default StackNavigator;
