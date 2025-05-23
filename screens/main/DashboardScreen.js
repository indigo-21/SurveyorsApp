import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import { AuthContext } from "../../store/auth-context";
import { DataContext } from "../../store/data-context";
import { logout } from "../../util/auth";
import ConfigrationGrid from "../../components/ConfigurationGrid";
import Colors from "../../constants/Colors";
import BoxGrid from "../../components/BoxGrid";
import ScreenWrapper from "../../components/ScreenWrapper";
import ScreenTitle from "../../components/ScreenTitle";
import IconButton from "../../components/IconButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dropAllTables, fetchDataFromDB, initializeDB } from "../../util/database";
import { getSurveyQuestionSets } from "../../util/db/surveyQuestionSets";
import {
    getPropertyInspectorJobs,
    getPropertyInspectorUnbookedJobs,
} from "../../util/db/jobs";
import { setSyncReady } from "./services/SyncStatusService";

function DashboardScreen() {
    const [isFetching, setIsFetching] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [url, setUrl] = useState("");

    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const authContext = useContext(AuthContext);
    const dataContext = useContext(DataContext);

    const propertyInspector = authContext.propertyInspector;
    const userID = propertyInspector.user.id;
    const propertyInspectorID = propertyInspector.user.property_inspector.id;

    const pressLogoutHandler = async () => {
        setIsLoggingOut(true);
        try {
            await logout(userID);

            authContext.logout();
        } catch (error) {
            Alert.alert(
                "Logout Failed",
                error.response?.data.message ||
                error.message ||
                "There's an issue logging out your account, please try again later.",
            );
            setIsLoggingOut(false);
        }
        setIsLoggingOut(false);
    };

    useEffect(() => {
        const urlStorage = async () => {
            const scannedData = await AsyncStorage.getItem("scannedData");
            if (scannedData) {
                const parsedData = JSON.parse(scannedData);
                const url = parsedData.url;
                setUrl(url);
            }
        };

        urlStorage();
    }, []);

    const checkAndInitialize = async () => {
        const initialized = await AsyncStorage.getItem("db_initialized");
        if (initialized !== "true") {
            setIsFetching(true);

            // await dropAllTables();
            // console.log('initializeDB called');
            await initializeDB();
            await fetchAllData();
            await AsyncStorage.setItem("db_initialized", "true");
        }
        setIsFetching(false);
    };

    const fetchAllData = async () => {
        const getPiJobsQuery = getPropertyInspectorJobs();
        const getSurveyQuestionSetsQuery = getSurveyQuestionSets();
        const getPIUnbookedJobsQuery = getPropertyInspectorUnbookedJobs();

        Promise.all([
            fetchDataFromDB(getPiJobsQuery, [propertyInspectorID, 1, 2]),
            fetchDataFromDB(getSurveyQuestionSetsQuery),
            fetchDataFromDB(getPIUnbookedJobsQuery, [propertyInspectorID, 25]),
        ])
            .then((data) => {
                dataContext.storeDashboardValues(data);
            })
            .catch((error) => {
                console.log(error);
                Alert.alert(
                    "Fetching Failed",
                    error.response?.data.message ||
                    error.message ||
                    "Please try again later.",
                );
            }).finally(() => {
                setSyncReady(true);
            });
    };

    useEffect(() => {
        checkAndInitialize().catch((err) => console.error("Error:", err));
    }, []);

    useEffect(() => {
        if (isFocused) {
            const fetchData = async () => {
                setIsFetching(true);
                try {
                    await fetchAllData();
                    console.log("Data fetched successfully");
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setIsFetching(false);
                }
            };
            fetchData();
        }
    }, [isFocused]);

    const syncDataHandler = async () => {
        await AsyncStorage.setItem("db_initialized", "");
        checkAndInitialize().catch((err) => console.error("Error:", err));
    };

    function currentVisitNavigateHandler() {
        navigation.navigate("CurrentVisits");
    }

    function questionSetsNavigateHandler() {
        navigation.navigate("QuestionSets");
    }

    function bookJobNavigateHandler() {
        navigation.navigate("BookJobs", { propertyInspectorID });
    }

    function completedVisitNavigateHandler() {
        navigation.navigate("CompletedVisits");
    }

    if (isLoggingOut) {
        return <LoadingOverlay message="Logging out..." />;
    }

    if (isFetching) {
        return (
            <LoadingOverlay message="Please wait while the data is fetching..." />
        );
    }

    return (
        <ScreenWrapper>
            <View style={styles.userContainer}>
                <Image
                    style={styles.image}
                    source={{
                        uri: `${url}storage/profile_images/${propertyInspector.user.photo}`,
                    }}
                />
                <View style={{ flex: 5, justifyContent: "center" }}>
                    <Text
                        style={{
                            fontSize: 18,
                            color: Colors.white,
                            fontWeight: "500",
                        }}
                    >
                        Hi, {propertyInspector.user.firstname}{" "}
                        {propertyInspector.user.lastname}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.white }}>
                        {" "}
                        {propertyInspector.user.account_level.name}
                    </Text>
                </View>
                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                    }}
                >
                    <IconButton
                        icon="logout"
                        size={24}
                        onPress={pressLogoutHandler}
                        color={Colors.white}
                    />
                </View>
            </View>
            <ScreenTitle title="Configurations" size={16} />
            <View style={styles.rowConfiguration}>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{
                        flexDirection: "row",
                        maxHeight: 100,
                        width: "100%",
                    }}
                    contentContainerStyle={{ alignItems: "center" }}
                >
                    <ConfigrationGrid
                        importedStyles={{ width: 100 }}
                        textContent="Sync Data"
                        onPress={syncDataHandler}
                    >
                        <FontAwesome5
                            name="sync"
                            size={24}
                            color={Colors.primary}
                        />
                    </ConfigrationGrid>
                    <ConfigrationGrid
                        importedStyles={{ width: 100 }}
                        textContent="Queued Sync"
                    >
                        <FontAwesome5
                            name="clock"
                            size={24}
                            color={Colors.primary}
                        />
                    </ConfigrationGrid>
                    <ConfigrationGrid
                        importedStyles={{ width: 100 }}
                        textContent="Calendar"
                    >
                        <FontAwesome5
                            name="calendar-alt"
                            size={24}
                            color={Colors.primary}
                        />
                    </ConfigrationGrid>
                    <ConfigrationGrid
                        importedStyles={{ width: 100 }}
                        textContent="Profile"
                    >
                        <FontAwesome5
                            name="user"
                            size={24}
                            color={Colors.primary}
                        />
                    </ConfigrationGrid>
                    <ConfigrationGrid
                        importedStyles={{ width: 100 }}
                        textContent="Self-Bill Issue"
                    >
                        <FontAwesome5
                            name="exclamation-triangle"
                            size={24}
                            color={Colors.primary}
                        />
                    </ConfigrationGrid>
                </ScrollView>
            </View>

            <ScreenTitle title="Bookings" size={16} />
            <View style={styles.row}>
                <BoxGrid
                    image={require("../../assets/images/house_icon.png")}
                    onPress={currentVisitNavigateHandler}
                >
                    <Text style={styles.textCount}>
                        {dataContext.dashboardValues.currentVisits ?? 0}
                    </Text>
                    <Text style={styles.textBottomCenter}>Current Visits</Text>
                </BoxGrid>
                <BoxGrid
                    image={require("../../assets/images/question.png")}
                    onPress={questionSetsNavigateHandler}
                >
                    <Text style={styles.textCount}>
                        {dataContext.dashboardValues.questionSets ?? 0}
                    </Text>
                    <Text style={styles.textBottomCenter}>Question Sets</Text>
                </BoxGrid>
                <BoxGrid
                    image={require("../../assets/images/complete.png")}
                    onPress={completedVisitNavigateHandler}
                >
                    <Text style={styles.textCount}>
                        {dataContext.dashboardValues.completedVisits ?? 0}
                    </Text>
                    <Text style={styles.textBottomCenter}>
                        Completed Visits
                    </Text>
                </BoxGrid>
                <BoxGrid
                    image={require("../../assets/images/book.png")}
                    onPress={bookJobNavigateHandler}
                >
                    <Text style={styles.textCount}>
                        {dataContext.dashboardValues.bookJobs ?? 0}
                    </Text>
                    <Text style={styles.textBottomCenter}>Book Jobs</Text>
                </BoxGrid>
            </View>
            {/* </SafeAreaView> */}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    row: {
        flex: 1,
        flexWrap: "wrap",
        marginTop: 8,
        maxHeight: 400,
        alignContent: "center",
    },
    rowConfiguration: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        maxHeight: 90,
        alignContent: "center",
        marginTop: 8,
    },
    textBottomCenter: {
        fontSize: 16,
        color: Colors.black,
    },
    textCount: {
        fontSize: 28,
        color: Colors.black,
        paddingBottom: 4,
        fontWeight: "600",
    },
    userContainer: {
        flexDirection: "row",
        height: 80,
        borderRadius: 8,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        backgroundColor: Colors.primary,
        marginBottom: 16,
    },
    image: {
        height: 50,
        width: 50,
        margin: 16,
        borderRadius: 25,
        borderWidth: 1.5,
        borderColor: Colors.white,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        backgroundColor: Colors.white,
        objectFit: "cover",
    },
});

export default DashboardScreen;
