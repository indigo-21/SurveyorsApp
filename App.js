import NetInfo from '@react-native-community/netinfo';
import { useEffect } from "react";
import { StatusBar } from "react-native";
import StackNavigator from "./routes/StackNavigator";
import AuthContextProvider from "./store/auth-context";
import DataContextProvider from "./store/data-context";
import { syncToServer } from "./screens/main/services/SyncService";
import { getSyncReady } from './screens/main/services/SyncStatusService';
import SurveyContextProvider from './store/survey-context';

export default function App() {

    useEffect(() => {
        let intervalId;

        const checkAndSync = async () => {
            // console.log("Checking connection...");
            const state = await NetInfo.fetch();
            if (state.isConnected) {
                if (getSyncReady()) {
                    // console.log("Connected, syncing...");
                    syncToServer();
                } else {
                    // console.log("Sync not ready");
                }
            } else {
                console.log("Offline, will retry...");
            }
        };

        // Initial run
        checkAndSync();

        // Set interval for continuous sync
        intervalId = setInterval(() => {
            checkAndSync();
        }, 30000);

        // Cleanup on unmount
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return (
        <>
            <StatusBar barStyle="light-content" />
            <AuthContextProvider>
                <DataContextProvider>
                    <SurveyContextProvider>
                        <StackNavigator />
                    </SurveyContextProvider>
                </DataContextProvider>
            </AuthContextProvider>
        </>
    );
}