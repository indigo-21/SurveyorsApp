import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";

import ScreenWrapper from "../../components/ScreenWrapper";
import JobList from "../../components/JobList";
import Colors from "../../constants/Colors";
import CustomModal from "../../components/CustomModal";
import ScreenTitle from "../../components/ScreenTitle";
import { AuthContext } from "../../store/auth-context";
import { getPropertyInspectorJobs } from "../../util/db/jobs";
import { fetchDataFromDB } from "../../util/database";

function CompletedVisitScreen() {
    const navigation = useNavigation();
    const [jobList, setJobList] = useState([]);
    const isFocused = useIsFocused();
    const authContext = useContext(AuthContext);

    const propertyInspector = authContext.propertyInspector;
    const propertyInspectorID = propertyInspector.user.property_inspector.id;
    const userID = propertyInspector.user.id;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Completed Visits",
        });
    }, [navigation]);

    useEffect(() => {
        if (isFocused) {
            console.log("fetching jobs....");
            const getPiJobsQuery = getPropertyInspectorJobs();

            const fetchJobs = async () => {
                await fetchDataFromDB(getPiJobsQuery, [
                    propertyInspectorID,
                    16,
                    3,
                ])
                    .then((result) => {
                        setJobList(result);
                    })
                    .catch((error) => {
                        console.error("Error fetching jobs:", error);
                    });
            };

            fetchJobs();
        }
    }, [isFocused]);

    function surveyResultPressHandler(jobNumber, jobID) {
        // setModalIsVisible((prevData) => !prevData);

        navigation.navigate("SurveyResult", { jobNumber, jobID });
    }

    function jobDetailsNavigateHandler(jobNumber, jobID) {
        // setModalIsVisible((prevData) => !prevData);
        navigation.navigate("JobDetails", {
            jobID,
            jobNumber,
        });
    }

    return (
        <ScreenWrapper>
            <ScreenTitle title="List of Completed Visits" />
            <View style={styles.container}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={[...jobList].reverse()}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <JobList>
                            <View style={{ flexDirection: "column", flex: 1 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        width: "100%",
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

                                        {/* </View> */}

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
                                    <View style={styles.chip}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                            }}
                                        >
                                            {item.job_status_id === 3 ? (
                                                <View
                                                    style={{
                                                        backgroundColor:
                                                            Colors.success,
                                                        padding: 4,
                                                        paddingHorizontal: 8,
                                                        borderRadius: 20,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: Colors.white,
                                                        }}
                                                    >
                                                        Passed
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View
                                                    style={{
                                                        backgroundColor:
                                                            Colors.secondary,
                                                        padding: 4,
                                                        paddingHorizontal: 8,
                                                        borderRadius: 20,
                                                    }}
                                                >
                                                    <Text
                                                        style={{
                                                            color: Colors.white,
                                                        }}
                                                    >
                                                        Failed
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 16, borderRadius: 2 }}>
                                        <Pressable
                                            onPress={() => surveyResultPressHandler(item.group_id, item.id)}
                                            style={({ pressed }) => [
                                                { padding: 8, borderRadius: 4 },
                                                pressed && { backgroundColor: Colors.ripple }
                                            ]}
                                        >
                                            <Text style={{ color: Colors.primary, fontWeight: "bold", fontSize: 16 }}>
                                                Survey Result
                                            </Text>
                                        </Pressable>
                                        <View style={{ width: 1, height: 20, backgroundColor: Colors.ripple, marginHorizontal: 16 }} />
                                        <Pressable
                                            onPress={() => jobDetailsNavigateHandler(item.group_id, item.id)}
                                            style={({ pressed }) => [
                                                { padding: 8, borderRadius: 4 },
                                                pressed && { backgroundColor: Colors.ripple }
                                            ]}
                                        >
                                            <Text style={{ color: Colors.primary, fontWeight: "bold", fontSize: 16 }}>
                                                Job Details
                                            </Text>
                                        </Pressable>

                                    </View>
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
        marginLeft: 8,
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
    },
    chip: {
        padding: 6,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        marginLeft: 8,
    },
});

export default CompletedVisitScreen;
