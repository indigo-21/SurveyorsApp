import { FlatList, StyleSheet, Text, View } from "react-native";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { format } from "date-fns";

import ScreenWrapper from "../../components/ScreenWrapper";
import JobList from "../../components/JobList";
import Colors from "../../constants/Colors";
import CustomModal from "../../components/CustomModal";
import ScreenTitle from "../../components/ScreenTitle";
import { getPropertyInspectorJobs, updateBookedJob } from "../../util/db/jobs";
import { AuthContext } from "../../store/auth-context";
import { fetchDataFromDB, insertOrUpdateData } from "../../util/database";
import CustomModalBtn from "../../components/CustomModalBtn";
import { bookPIJob } from "../../util/db/bookings";

function CurrentVisitScreen() {
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [activeJob, setActiveJob] = useState({
        jobNumber: "",
        jobID: "",
        isBooked: false,
    });
    const [refetchJobs, setFetchJobs] = useState(true);
    const [jobList, setJobList] = useState([]);
    const authContext = useContext(AuthContext);

    const propertyInspector = authContext.propertyInspector;
    const propertyInspectorID = propertyInspector.user.property_inspector.id;

    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Current Visits",
        });
    }, [navigation]);

    useEffect(() => {
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

        if (refetchJobs) {
            fetchJobs();
        }
    }, [refetchJobs]);

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
        navigation.navigate("UpdateJob");
    }

    function jobDetailsNavigateHandler() {
        setModalIsVisible((prevData) => !prevData);
        navigation.navigate("JobDetails", { jobID: activeJob.jobID, jobNumber: activeJob.jobNumber });
    }

    function surveyNavigateHandler() {
        setModalIsVisible((prevData) => !prevData);
        navigation.navigate("Survey");
    }

    async function bookJobPressHandler() {
        setModalIsVisible((prevData) => !prevData);
        setFetchJobs((prevData) => !prevData);

        const formattedDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

        const bookJobQuery = bookPIJob();
        const bookParams = [
            activeJob.jobNumber,
            "Accepted By " + propertyInspector.user.first_name + " " + propertyInspector.user.last_name,
            propertyInspectorID,
            propertyInspectorID,
            formattedDate,
            "Booked by Property Inspector",
            formattedDate,
            formattedDate,
        ];

        const updateJobQuery = updateBookedJob();
        const updateParams = [
            1,
            "%" + activeJob.jobNumber + "%",
        ];

        try {
            await insertOrUpdateData(bookJobQuery, bookParams);
            await insertOrUpdateData(updateJobQuery, updateParams);

        } catch (error) {
            console.error("Error booking job:", error);

        }

        setFetchJobs((prevData) => !prevData);


        // navigation.reset({
        //     index: 0,
        //     routes: [{ name: "Dashboard" }],
        // });
    }

    console.log(modalIsVisible);


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
                    data={jobList}
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
