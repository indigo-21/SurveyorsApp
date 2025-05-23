import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from "../constants/Colors";
import ScoreMonitoringScreen from "../screens/main/ScoreMonitoringScreen";
import MeasureSpecificScreen from "../screens/main/MeasureSpecificScreen";

function TabNavigator() {
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.primary,
                },
                tabBarActiveTintColor: Colors.white,
                tabBarInactiveTintColor: Colors.lightGray,
                tabBarLabelStyle: {
                    fontSize: 14,
                },
                tabBarIconStyle: {
                    size: 20,
                },
                tabBarButtonStyle: {
                    borderRadius: 10,
                },
            }}
        >
            <Tab.Screen
                name="ScoreMonitoring"
                component={ScoreMonitoringScreen}
                options={{
                    title: "Score Monitoring",
                    tabBarIcon: ({ focused }) => {
                        return <MaterialCommunityIcons
                            name="book-cog"
                            size={24}
                            color={focused ? Colors.white : Colors.cancel}
                        />
                    },
                }}
            />
            <Tab.Screen
                name="MeasureSpecific"
                component={MeasureSpecificScreen}
                options={{
                    title: "Measure Specific",
                    tabBarIcon: ({ focused }) => {
                        return <MaterialCommunityIcons
                            name="ruler"
                            size={24}
                            color={focused ? Colors.white : Colors.cancel}
                        />
                    },
                }}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
