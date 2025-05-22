import { StatusBar } from "react-native";
import StackNavigator from "./routes/StackNavigator";
import AuthContextProvider from "./store/auth-context";
import DataContextProvider from "./store/data-context";

export default function App() {

    return (
        <>
            <StatusBar barStyle="light-content" />
            <AuthContextProvider>
                <DataContextProvider>
                    <StackNavigator />
                </DataContextProvider>
            </AuthContextProvider>
        </>
    );
}