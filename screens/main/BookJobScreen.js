import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { format } from 'date-fns';

import ScreenWrapper from "../../components/ScreenWrapper";
import JobList from "../../components/JobList";
import Colors from "../../constants/Colors";
import CustomModal from "../../components/CustomModal";
import ScreenTitle from "../../components/ScreenTitle";
import AntDesign from "@expo/vector-icons/AntDesign";
import { fetchDataFromDB, insertOrUpdateData } from "../../util/database";
import { getPropertyInspectorJobs, updateBookingJob } from "../../util/db/jobs";
import { bookPIJob } from "../../util/db/bookings";
import ModalButton from "../../components/CustomModalBtn";
import { AuthContext } from "../../store/auth-context";

function BookJobScreen() {
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const navigation = useNavigation();
    const route = useRoute();
    const [unbookedJobs, setUnbookedJobs] = useState([]);
    const [activeJob, setActiveJob] = useState({
        jobNumber: "",
        jobID: "",
    });
    const authContext = useContext(AuthContext);
    const propertyInspector = authContext.propertyInspector;
    const propertyInspectorID = route.params?.propertyInspectorID;
    const userID = propertyInspector.user.id;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Book Job",
        });
    }, [navigation]);

    function navigationPressHandler({ jobNumber, jobID }) {
        setModalIsVisible((prevData) => !prevData);

        setActiveJob({ jobNumber, jobID });
    }

    async function bookJobPressHandler() {
        setModalIsVisible((prevData) => !prevData);

        const formattedDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

        const bookJobQuery = bookPIJob();
        const bookParams = [
            activeJob.jobNumber,
            "Booked",
            userID,
            propertyInspectorID,
            formattedDate,
            "Booked by Property Inspector",
            formattedDate,
            formattedDate,
        ];

        const updateJobQuery = updateBookingJob();
        const updateParams = [
            1,
            formattedDate,
            formattedDate,
            "%" + activeJob.jobNumber + "%",
        ];

        try {
            await insertOrUpdateData(bookJobQuery, bookParams);
            await insertOrUpdateData(updateJobQuery, updateParams);

        } catch (error) {
            console.error("Error booking job:", error);

        }

        navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
        });
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
                <ModalButton title="Book" onPress={bookJobPressHandler} />
                <ModalButton title="Job Details" onPress={jobDetailsNavigateHandler} />
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
});

export default BookJobScreen;
