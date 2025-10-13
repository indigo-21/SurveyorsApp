import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import { AuthContext } from "../../store/auth-context";
import { DataContext } from "../../store/data-context";
import CustomModal from "../../components/CustomModal";
import ConfigrationGrid from "../../components/ConfigurationGrid";
import { logout } from "../../util/auth";
import Colors from "../../constants/Colors";
import BoxGrid from "../../components/BoxGrid";
import ScreenWrapper from "../../components/ScreenWrapper";
import ScreenTitle from "../../components/ScreenTitle";
import IconButton from "../../components/IconButton";
import LoadingOverlay from "../../components/LoadingOverlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    dropAllTables,
    fetchDataFromDB,
    fetchFirstDataFromDB,
    initializeDB,
} from "../../util/database";
import { getSurveyQuestionSets } from "../../util/db/surveyQuestionSets";
import {
    getPropertyInspectorJobs,
    getPropertyInspectorUnbookedJobs,
} from "../../util/db/jobs";
import { setSyncReady } from "./services/SyncStatusService";
import { getLogs } from "../../util/db/tempSyncLogs";
import eventbus from "../../events/eventbus";
import { getPropertyInspector } from "../../util/db/propertyInspectors";
import Constants from 'expo-constants';

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

function DashboardScreen() {
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [url, setUrl] = useState("");
    const [syncCount, setSyncCount] = useState(0);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [canBookJobs, setCanBookJobs] = useState(0);
    const [imageError, setImageError] = useState(false);

    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const authContext = useContext(AuthContext);
    const dataContext = useContext(DataContext);

    const propertyInspector = authContext.propertyInspector;
    const userID = propertyInspector.user.id;
    const propertyInspectorID = propertyInspector.user.property_inspector.id;

    // Generate dynamic profile image URL or use a default
    const getProfileImageUrl = () => {
        if (!url) return null; // URL not loaded yet

        if (propertyInspector.user.photo) {
            return `${url}storage/profile_images/${propertyInspector.user.photo}`;
        }
        return null;
    };

    const profileImageUrl = getProfileImageUrl();

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
        // Prevent multiple concurrent initialization attempts
        if (isInitializing) {
            console.log('Database initialization already in progress');
            return;
        }

        const initialized = await AsyncStorage.getItem("db_initialized");
        if (initialized !== "true") {
            setIsInitializing(true);
            setIsFetching(true);
            try {
                // Add a small delay to ensure any pending database operations complete
                await new Promise(resolve => setTimeout(resolve, 500));

                // Drop all tables first and wait for completion
                await dropAllTables();
                console.log('Tables dropped successfully, proceeding with initialization');

                // Add another small delay to ensure cleanup is complete
                await new Promise(resolve => setTimeout(resolve, 200));

                // Only proceed if dropAllTables completed successfully
                console.log('initializeDB called');
                await initializeDB(propertyInspectorID);
                await fetchAllData();

            } catch (error) {
                console.error("Error during database initialization:", error);
                Alert.alert(
                    "Initialization Failed",
                    "There was an error while initializing the database. Please try again later.",
                );
            } finally {
                setIsFetching(false);
                setIsInitializing(false);
            }
            await AsyncStorage.setItem("db_initialized", "true");
        } else {
            setIsFetching(false);
        }

        setIsInitialized(true);
    };

    const fetchAllData = async () => {
        const getPiJobsQuery = getPropertyInspectorJobs();
        const getSurveyQuestionSetsQuery = getSurveyQuestionSets();
        const getPIUnbookedJobsQuery = getPropertyInspectorUnbookedJobs();
        const getCompletedJobsQuery = getPropertyInspectorJobs();
        try {
            const data = await Promise.all([
                fetchDataFromDB(getPiJobsQuery, [propertyInspectorID, 1, 2]),
                fetchDataFromDB(getSurveyQuestionSetsQuery),
                fetchDataFromDB(getPIUnbookedJobsQuery, [propertyInspectorID, 25]),
                fetchDataFromDB(getCompletedJobsQuery, [
                    propertyInspectorID,
                    16,
                    3,
                ]),
            ]);

            dataContext.storeDashboardValues(data);
            return data;
        } catch (error) {
            console.log(error);
            Alert.alert(
                "Fetching Failed",
                error.response?.data.message ||
                error.message ||
                "Please try again later.",
            );
            throw error;
        } finally {
            setSyncReady(true);
        }
    };

    useEffect(() => {
        checkAndInitialize().catch((err) => console.error("Error:", err));
    }, []);

    useEffect(() => {
        if (isFocused && isInitialized) {
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

    }, [isFocused, isInitialized]);

    useEffect(() => {
        const logsQuery = getLogs();
        const fetchLogs = async () => {
            try {
                const logs = await fetchDataFromDB(logsQuery);
                setSyncCount(logs.length);
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        };

        if (isFocused && isInitialized && !isInitializing) {
            const getPropertyInspectorData = async () => {
                try {
                    const propertyInspectorData = await fetchFirstDataFromDB(getPropertyInspector(), propertyInspectorID);
                    setCanBookJobs(propertyInspectorData.can_book_jobs);
                } catch (error) {
                    console.error("Error fetching property inspector data:", error);
                }
            }

            getPropertyInspectorData();
            fetchLogs();
        }

        const logsChangedHandler = () => {
            console.log("logsChanged event received");
            if (isInitialized && !isInitializing) {
                fetchLogs();
            }
        };

        eventbus.on("logsChanged", logsChangedHandler);

        return () => {
            eventbus.off("logsChanged", logsChangedHandler);
        };
    }, [isFocused, isInitialized, isInitializing]);

    const syncDataHandler = async () => {
        if (isInitializing) {
            Alert.alert(
                "Sync In Progress",
                "Database initialization is already in progress. Please wait for it to complete."
            );
            return;
        }

        setIsInitialized(false);
        await AsyncStorage.setItem("db_initialized", "");
        checkAndInitialize().catch((err) => console.error("Error:", err));
    };

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
            <CustomModal
                modalVisible={modalIsVisible}
                setModalVisible={setModalIsVisible}
                title="Queued Sync"
            >
                <View
                    style={{
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                    }}
                >
                    <Text style={{ fontSize: 45, color: Colors.black }}>
                        {syncCount}{" "}
                    </Text>
                    <Text style={{ marginBottom: 12 }}>
                        {" "}
                        Total Numbers of Queued Sync{" "}
                    </Text>
                    <Text
                        style={{
                            marginTop: 10,
                            fontSize: 12,
                            fontStyle: "italic",
                        }}
                    >
                        Note: Please allow the Queued Sync data to fully load
                        and complete before attempting to sync. This ensures
                        that all pending items are accurately counted and
                        included in the sync process, helping to prevent data
                        loss or incomplete synchronization.
                    </Text>
                </View>
            </CustomModal>
            <View style={styles.userContainer}>
                {profileImageUrl ? (
                    <Image
                        style={styles.image}
                        source={{ uri: profileImageUrl }}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <View style={[styles.image, styles.defaultAvatar]}>
                        <Text style={styles.avatarText}>
                            {propertyInspector.user.firstname?.charAt(0)?.toUpperCase()}
                            {propertyInspector.user.lastname?.charAt(0)?.toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={{ flex: 5, justifyContent: "center" }}>
                    <Text
                        style={{
                            fontSize: windowWidth > 500 ? 22 : 16,
                            color: Colors.white,
                            paddingBottom: 4,
                        }}
                    >
                        Hi, {propertyInspector.user.firstname}{" "}
                        {propertyInspector.user.lastname}
                    </Text>
                    <Text
                        style={{
                            fontSize: windowWidth > 500 ? 16 : 12,
                            color: Colors.white,
                            fontWeight: "300",

                        }}
                    >
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
                        disabled={syncCount !== 0}
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
                        onPress={() => {
                            setModalIsVisible((prevData) => !prevData);
                        }}
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
                        onPress={() => {
                            navigation.navigate("Calendar");
                        }}
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
                        onPress={() => {
                            navigation.navigate("Profile");
                        }}
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
                    onPress={() => {
                        navigation.navigate("CurrentVisits");
                    }}
                >
                    <Text style={styles.textCount}>
                        {dataContext.dashboardValues.currentVisits ?? 0}
                    </Text>
                    <Text style={styles.textBottomCenter}>Current Visits</Text>
                </BoxGrid>
                <BoxGrid
                    image={require("../../assets/images/question.png")}
                    onPress={() => {
                        navigation.navigate("QuestionSets");
                    }}
                >
                    <Text style={styles.textCount}>
                        {dataContext.dashboardValues.questionSets ?? 0}
                    </Text>
                    <Text style={styles.textBottomCenter}>Question Sets</Text>
                </BoxGrid>
                <BoxGrid
                    image={require("../../assets/images/complete.png")}
                    onPress={() => {
                        navigation.navigate("CompletedVisits");
                    }}
                >
                    <Text style={styles.textCount}>
                        {dataContext.dashboardValues.completedVisits ?? 0}
                    </Text>
                    <Text style={styles.textBottomCenter}>
                        Completed Visits
                    </Text>
                </BoxGrid>
                {canBookJobs ? (
                    <BoxGrid
                        image={require("../../assets/images/book.png")}
                        onPress={() => {
                            navigation.navigate("BookJobs", {
                                propertyInspectorID,
                            });
                        }}
                    >
                        <Text style={styles.textCount}>
                            {dataContext.dashboardValues.bookJobs ?? 0}
                        </Text>
                        <Text style={styles.textBottomCenter}>Book Jobs</Text>
                    </BoxGrid>
                ) : (
                    ""
                )}
            </View>
            {/* </SafeAreaView> */}


            {/* App version at the bottom */}
            <View style={styles.versionContainer}>
                <Text style={styles.versionText}>App version: {Constants.manifest?.version || Constants.expoConfig?.version || '1.0.0'}</Text>
            </View>

        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    row: {
        flex: 1,
        flexWrap: "wrap",
        marginTop: 8,
        maxHeight: "100%",
        alignContent: "center",
        // backgroundColor: Colors.black,
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
        width: "100%",
        fontSize: windowWidth > 500 ? 20 : 16,
        color: Colors.black,
        textAlign: "left",
        marginTop: 4,
    },
    textCount: {
        fontSize: windowWidth > 500 ? 40 : 24,
        color: Colors.black,
        paddingBottom: 4,
        fontWeight: "600",
        textAlign: "left",
    },
    versionContainer: {
        marginTop: 12,
        marginBottom: 12,
    },
    versionText: {
        fontSize: 12,
        color: Colors.black,
        opacity: 0.6,
    },
    userContainer: {
        flexDirection: "row",
        height: windowHeight * 0.1,
        borderRadius: 8,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        backgroundColor: Colors.primary,
        marginBottom: 16,
        alignItems: "center",
    },
    image: {
        height: windowHeight * 0.06,
        width: windowHeight * 0.06,
        margin: 16,
        borderRadius: (windowHeight * 0.06) / 2,
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
    defaultAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: windowHeight * 0.02,
        fontWeight: 'bold',
        color: Colors.primary,
    },
});

export default DashboardScreen;
