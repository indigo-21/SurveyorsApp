import { FlatList, StyleSheet, Text, View } from "react-native";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AntDesign from '@expo/vector-icons/AntDesign';
import { format } from "date-fns";

import { AuthContext } from "../../store/auth-context";
import Colors from "../../constants/Colors";
import JobList from "../../components/JobList";
import CustomModal from "../../components/CustomModal";
import ScreenTitle from "../../components/ScreenTitle";
import ScreenWrapper from "../../components/ScreenWrapper";
import CustomModalBtn from "../../components/CustomModalBtn";
import { bookPIJob } from "../../util/db/bookings";
import { fetchDataFromDB, insertOrUpdateData } from "../../util/database";
import { getPropertyInspectorJobs, updateBookedJob } from "../../util/db/jobs";

function CurrentVisitScreen() {
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [activeJob, setActiveJob] = useState({
        jobNumber: "",
        jobID: "",
        isBooked: false,
    });
    const [refetchJobs, setRefetchJobs] = useState(true);
    const [jobList, setJobList] = useState([]);
    const isFocused = useIsFocused();
    const authContext = useContext(AuthContext);
    const navigation = useNavigation();

    const propertyInspector = authContext.propertyInspector;
    const propertyInspectorID = propertyInspector.user.property_inspector.id;
    const userID = propertyInspector.user.id;


    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Current Visits",
        });
    }, [navigation]);

    useEffect(() => {
        if (refetchJobs || isFocused) {
            console.log('fetching jobs....');
            const getPiJobsQuery = getPropertyInspectorJobs();

            const fetchJobs = async () => {
                await fetchDataFromDB(getPiJobsQuery, [propertyInspectorID, 1, 2])
                    .then((result) => {
                        setJobList(result);
                    })
                    .catch((error) => {
                        console.error("Error fetching jobs:", error);
                    });
            }

            fetchJobs();
        }
    }, [refetchJobs, isFocused]);

    function navigationPressHandler(job) {
        setModalIsVisible((prevData) => !prevData);

        if (job.job_status_id === 1) {
            setActiveJob(() => ({
                jobNumber: job.group_id,
                jobID: job.id,
                isBooked: true,
            }));
        } else {
            setActiveJob(() => ({
                jobNumber: job.group_id,
                jobID: job.id,
                isBooked: false,
            }));
        }

    }

    function updateNavigateHandler() {
        setModalIsVisible((prevData) => !prevData);
        navigation.navigate("UpdateJob", { jobID: activeJob.jobID, jobNumber: activeJob.jobNumber });
    }

    function jobDetailsNavigateHandler() {
        setModalIsVisible((prevData) => !prevData);
        navigation.navigate("JobDetails", { jobID: activeJob.jobID, jobNumber: activeJob.jobNumber });
    }

    function surveyNavigateHandler() {
        setModalIsVisible((prevData) => !prevData);
        navigation.navigate("Survey", { jobID: activeJob.jobID, jobNumber: activeJob.jobNumber });
    }

    async function bookJobPressHandler() {
        setModalIsVisible((prevData) => !prevData);
        setRefetchJobs((prevData) => !prevData);

        const formattedDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

        const bookJobQuery = bookPIJob();
        const bookParams = [
            activeJob.jobNumber,
            "Booked",
            userID,
            propertyInspectorID,
            formattedDate,
            "Accepted By " + propertyInspector.user.firstname + " " + propertyInspector.user.lastname,
            formattedDate,
            formattedDate,
        ];

        const updateJobQuery = updateBookedJob();
        const updateParams = [
            1,
            formattedDate,
            "%" + activeJob.jobNumber + "%",
        ];

        try {
            await insertOrUpdateData(bookJobQuery, bookParams);
            await insertOrUpdateData(updateJobQuery, updateParams);

        } catch (error) {
            console.error("Error booking job:", error);

        }

        setRefetchJobs((prevData) => !prevData);


        // navigation.reset({
        //     index: 0,
        //     routes: [{ name: "Dashboard" }],
        // });
    }


    return (
        <ScreenWrapper>
            <CustomModal
                modalVisible={modalIsVisible}
                setModalVisible={setModalIsVisible}
                title={activeJob.jobNumber}
                subtitle="Job Number"
            >
                {activeJob.isBooked &&
                    <>
                        <CustomModalBtn title="Update Status" onPress={updateNavigateHandler} />
                        <CustomModalBtn title="Job Details" onPress={jobDetailsNavigateHandler} />
                        <CustomModalBtn title="Start Survey" onPress={surveyNavigateHandler} />
                    </>
                }

                {!activeJob.isBooked &&
                    <>
                        <CustomModalBtn title="Book" onPress={bookJobPressHandler} />
                        <CustomModalBtn title="Job Details" onPress={jobDetailsNavigateHandler} />
                    </>
                }
            </CustomModal>
            <ScreenTitle title="List of Current Visits" />
            <View style={styles.container}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={[...jobList].reverse()}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <JobList onPress={() => navigationPressHandler(item)}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    width: "100%",
                                    height: 80,
                                    alignItems: "center",
                                }}
                            >
                                <View style={styles.clientRow}>
                                    <Text style={styles.clientName}>{item.client_abbrevation}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    {/* <View style={{ flexDirection: "row", justifyContent: "space-between" }}> */}
                                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
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
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        {
                                            item.job_status_id === 1 ?
                                                (<AntDesign name="checkcircle" size={24} color={Colors.success} />) :
                                                (<AntDesign name="exclamationcircle" size={24} color={Colors.warning} />)
                                        }
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
        marginLeft: 16,
    },
    clientName: {
        fontWeight: "bold",
        color: Colors.white,
        textAlign: "center",
        fontSize: 18,
    },
    chip: {
        padding: 6,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        marginLeft: 8,
    },
});

export default CurrentVisitScreen;
