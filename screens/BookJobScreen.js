import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import ScreenWrapper from "../components/ScreenWrapper";
import JobList from "../components/JobList";
import Colors from "../constants/Colors";
import CustomModal from "../components/CustomModal";
import ScreenTitle from "../components/ScreenTitle";
import AntDesign from "@expo/vector-icons/AntDesign";
import { fetchDataFromDB } from "../util/database";
import { getPropertyInspectorJobs } from "../util/db/jobs";

function BookJobScreen() {
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const navigation = useNavigation();
    const route = useRoute();
    const [unbookedJobs, setUnbookedJobs] = useState([]);
    const [activeJob, setActiveJob] = useState({
        jobNumber: "",
        jobID: "",
    });
    const propertyInspectorID = route.params?.propertyInspectorID;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Book Job",
        });
    }, [navigation]);

    function navigationPressHandler({ jobNumber, jobID }) {
        setModalIsVisible((prevData) => !prevData);

        setActiveJob({ jobNumber, jobID });
    }

    function bookJobPressHandler() {
        setModalIsVisible((prevData) => !prevData);
        navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
        });
        // navigation.navigate("Dashboard");
    }

    function jobDetailsNavigateHandler() {
        setModalIsVisible((prevData) => !prevData);
        navigation.navigate("JobDetails", { jobID: activeJob.jobID, jobNumber: activeJob.jobNumber });
    }

    useEffect(() => {
        // console.log('Property Inspector ID:', propertyInspectorID);
        const getPIUnbookedJobs = async () => {
            const getPIBookingsQuery = getPropertyInspectorJobs('jobs');
            try {
                const result = await fetchDataFromDB(getPIBookingsQuery, [
                    propertyInspectorID,
                    25,
                ]);

                if (result.length === 0) {
                    console.log("No unbooked jobs found for this property inspector.");
                    return;
                }

                setUnbookedJobs(result);
            }
            catch (error) {
                console.error("Error fetching unbooked jobs:", error);
            }
        }

        getPIUnbookedJobs();
    }, []);

    // console.log("Unbooked Jobs:", unbookedJobs);

    return (
        <ScreenWrapper>

            <CustomModal
                setModalVisible={setModalIsVisible}
                modalVisible={modalIsVisible}
                title={activeJob.jobNumber}
                subtitle="Job Number"
            >
                <View style={styles.row}>
                    <Pressable
                        android_ripple={{ color: Colors.ripple }}
                        onPress={bookJobPressHandler}
                        style={({ pressed }) =>
                            pressed
                                ? [styles.pressedItem, styles.buttonOptions]
                                : styles.buttonOptions
                        }
                    >
                        <Text style={styles.text}>Book</Text>
                        <AntDesign
                            name="rightcircle"
                            size={24}
                            color={Colors.primary}
                        />
                    </Pressable>
                </View>
                <View style={styles.row}>
                    <Pressable
                        android_ripple={{ color: Colors.ripple }}
                        onPress={jobDetailsNavigateHandler}
                        style={({ pressed }) =>
                            pressed
                                ? [styles.pressedItem, styles.buttonOptions]
                                : styles.buttonOptions
                        }
                    >
                        <Text style={styles.text}>Job Details</Text>
                        <AntDesign
                            name="rightcircle"
                            size={24}
                            color={Colors.primary}
                        />
                    </Pressable>
                </View>
            </CustomModal>

            <ScreenTitle title="List of Unbooked Jobs" />
            <View style={styles.container}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={unbookedJobs}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <JobList onPress={() => navigationPressHandler({ jobNumber: item.group_id, jobID: item.id })}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    width: "100%",
                                    height: 80,
                                    alignItems: "center",
                                }}
                            >
                                <View style={styles.clientRow}>
                                    <Text style={styles.clientName}>
                                        {item.client_abbrevation}
                                    </Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {item.group_id}
                                    </Text>
                                    <Text style={{ fontSize: 12 }}>
                                        Address: {item.address1}
                                    </Text>
                                    <Text style={{ fontSize: 12 }}>
                                        Postcode: {item.postcode}
                                    </Text>
                                    <Text style={{ fontSize: 12 }}>
                                        Cert No: {item.cert_no}
                                    </Text>
                                </View>
                            </View>
                        </JobList>
                    )}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 16,
    },
    clientRow: {
        fontSize: 16,
        alignContent: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        height: 60,
        width: 60,
        borderRadius: 30,
        marginLeft: 16,
    },
    clientName: {
        fontWeight: "bold",
        color: Colors.white,
        textAlign: "center",
        fontSize: 18,
    },
    pressedItem: {
        opacity: 0.75,
        backgroundColor: Colors.ripple,
    },
    buttonOptions: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    row: {
        backgroundColor: "white",
        height: 50,
        borderRadius: 10,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        marginBottom: 8,
        width: "100%",
    },
    text: {
        textAlign: "center",
    }
});

export default BookJobScreen;
