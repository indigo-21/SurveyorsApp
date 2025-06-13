import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { AuthContext } from "../store/auth-context";
import { Image } from "react-native";

import Colors from "../constants/Colors";
import CurrentVisitScreen from "../screens/main/CurrentVisitScreen";
import UpdateJobScreen from "../screens/main/UpdateJobScreen";
import JobDetailsScreen from "../screens/main/JobDetailsScreen";
import QuestionSetScreen from "../screens/main/QuestionSetScreen";
import BookJobScreen from "../screens/main/BookJobScreen";
import CompletedVisitScreen from "../screens/main/CompletedVisitScreen";
import SurveyScreen from "../screens/main/SurveyScreen";
import OTPVerificationScreen from "../screens/main/OTPVerificationScreen";
import DashboardScreen from "../screens/main/DashboardScreen";
import LoginScreen from "../screens/login-screens/LoginScreen";
import QRCodeScannerScreen from "../screens/login-screens/QRCodeScannerScreen";
import QRCodeScreen from "../screens/login-screens/QRCodeScreen";
import SummaryScreen from "../screens/main/SummaryScreen";
import SurveyResultScreen from "../screens/main/SurveyResultScreen";
import CalendarScreen from "../screens/main/CalendarScreen";

const Stack = createNativeStackNavigator();

function AuthStack() {
    return (
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
    );
}

function AuthenticatedStack() {
    return (
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

            <Stack.Screen
                name="Summary"
                component={SummaryScreen}
            />

            <Stack.Screen
                name="SurveyResult"
                component={SurveyResultScreen}
            />

            <Stack.Screen
                name="Calendar"
                component={CalendarScreen}
            />
        </Stack.Navigator>
    );
}

function StackNavigator() {
    const authContext = useContext(AuthContext);

    if (authContext.isInitializing) {
        return null; // Or a loading indicator
    }

    return (
        <NavigationContainer>
            {authContext.isAuthenticated ? <AuthenticatedStack /> : <AuthStack />}
        </NavigationContainer>
    );
}

export default StackNavigator;
