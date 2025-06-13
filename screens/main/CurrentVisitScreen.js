import { FlatList, StyleSheet, Text, View } from "react-native";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
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
import {
    getFilteredPropertyInspectorJobs,
    getPropertyInspectorJobs,
    updateBookedJob,
} from "../../util/db/jobs";
import { Dropdown } from "react-native-element-dropdown";
import { getAllMeasures } from "../../util/db/measures";
import { getAllOutwardPostcodes } from "../../util/db/outwardPostcodes";
import { getAllJobStatuses } from "../../util/db/jobStatuses";
import CustomButton from "../../components/CustomButton";

function CurrentVisitScreen() {
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [filterModal, setFilterModal] = useState(false);
    const [activeJob, setActiveJob] = useState({
        jobNumber: "",
        jobID: "",
        isBooked: false,
    });
    const [dropdownValue, setDropdownValue] = useState({
        measureCat: [],
        postcode: [],
        jobStatus: [],
    });
    const [filterValues, setFilterValues] = useState({
        measureCat: null,
        postcode: null,
        jobStatus: null,
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
            console.log("fetching jobs....");
            const getPiJobsQuery = getPropertyInspectorJobs();

            const fetchJobs = async () => {
                await fetchDataFromDB(getPiJobsQuery, [
                    propertyInspectorID,
                    1,
                    2,
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

    async function bookJobPressHandler() {
        setModalIsVisible((prevData) => !prevData);
        setRefetchJobs((prevData) => !prevData);

        const formattedDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");

        const bookJobQuery = bookPIJob();
        const bookParams = [
            activeJob.jobNumber,
            "Booked",
            userID,
            propertyInspectorID,
            formattedDate,
            "Accepted By " +
                propertyInspector.user.firstname +
                " " +
                propertyInspector.user.lastname,
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
    }

    useEffect(() => {
        Promise.all([
            fetchDataFromDB(getAllMeasures(), []),
            fetchDataFromDB(getAllOutwardPostcodes(), []),
            fetchDataFromDB(getAllJobStatuses(), []),
        ])
            .then(([measures, postcodes, jobStatuses]) => {
                setDropdownValue({
                    measureCat: measures,
                    postcode: postcodes,
                    jobStatus: jobStatuses,
                });
            })
            .catch((error) => {
                console.error("Error fetching dropdown data:", error);
            });
    }, []);

    const updateFilterValues = (value, field) => {
        setFilterValues((prevValues) => ({
            ...prevValues,
            [field]: value,
        }));
    };

    const filterJobsHandler = () => {
        const filterParams = {
            propertyInspectorID: propertyInspectorID,
            measureCat: filterValues.measureCat?.measure_cat || null,
            postcode: filterValues.postcode?.name || null,
            jobStatus: filterValues.jobStatus?.description || null,
        };

        const { baseQuery, params } =
            getFilteredPropertyInspectorJobs(filterParams);
        // console.log(baseQuery, params);

        fetchDataFromDB(baseQuery, params)
            .then((result) => {
                // console.log(result);
                setJobList(result);
                // setFilterModal((prevData) => !prevData);
            })
            .catch((error) => {
                console.error("Error filtering jobs:", error);
            });
    };

    // console.log(filterValues);

    return (
        <ScreenWrapper>
            <CustomModal
                modalVisible={modalIsVisible}
                setModalVisible={setModalIsVisible}
                title={activeJob.jobNumber}
                subtitle="Job Number"
            >
                {activeJob.isBooked && (
                    <>
                        <CustomModalBtn
                            title="Update Status"
                            onPress={() => {
                                setModalIsVisible((prevData) => !prevData);
                                navigation.navigate("UpdateJob", {
                                    jobID: activeJob.jobID,
                                    jobNumber: activeJob.jobNumber,
                                });
                            }}
                        />
                        <CustomModalBtn
                            title="Job Details"
                            onPress={() => {
                                setModalIsVisible((prevData) => !prevData);
                                navigation.navigate("JobDetails", {
                                    jobID: activeJob.jobID,
                                    jobNumber: activeJob.jobNumber,
                                });
                            }}
                        />
                        <CustomModalBtn
                            title="Start Survey"
                            onPress={() => {
                                setModalIsVisible((prevData) => !prevData);
                                navigation.navigate("Survey", {
                                    jobID: activeJob.jobID,
                                    jobNumber: activeJob.jobNumber,
                                });
                            }}
                        />
                    </>
                )}

                {!activeJob.isBooked && (
                    <>
                        <CustomModalBtn
                            title="Book"
                            onPress={bookJobPressHandler}
                        />
                        <CustomModalBtn
                            title="Job Details"
                            onPress={() => {
                                setModalIsVisible((prevData) => !prevData);
                                navigation.navigate("JobDetails", {
                                    jobID: activeJob.jobID,
                                    jobNumber: activeJob.jobNumber,
                                });
                            }}
                        />
                    </>
                )}
            </CustomModal>

            <CustomModal
                modalVisible={filterModal}
                setModalVisible={setFilterModal}
                title="Filter Jobs"
                closeVisible={true}
            >
                <View style={styles.dropdownContainer}>
                    <Text style={styles.dropdownText}>Measure Category:</Text>
                    <Dropdown
                        data={dropdownValue.measureCat}
                        labelField="measure_cat"
                        valueField="measure_cat"
                        value={filterValues.measureCat?.measure_cat || null}
                        style={styles.dropdown}
                        placeholder="Select"
                        onChange={(value) => {
                            updateFilterValues(value, "measureCat");
                        }}
                    />
                </View>

                <View style={styles.dropdownContainer}>
                    <Text style={styles.dropdownText}>Post Code:</Text>
                    <Dropdown
                        data={dropdownValue.postcode}
                        labelField="name"
                        valueField="name"
                        value={filterValues.postcode?.name || null}
                        style={styles.dropdown}
                        placeholder="Select"
                        onChange={(value) => {
                            updateFilterValues(value, "postcode");
                        }}
                    />
                </View>

                <View style={styles.dropdownContainer}>
                    <Text style={styles.dropdownText}>Job Status:</Text>
                    <Dropdown
                        data={dropdownValue.jobStatus}
                        labelField="description"
                        valueField="description"
                        value={filterValues.jobStatus?.description || null}
                        style={styles.dropdown}
                        placeholder="Select"
                        onChange={(value) => {
                            updateFilterValues(value, "jobStatus");
                        }}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <CustomButton
                        text="Clear Filters"
                        importedStyles={{
                            backgroundColor: Colors.cancel,
                            color: Colors.black,
                        }}
                        onPress={() => {
                            setRefetchJobs(true);
                            setFilterValues(() => {
                                return {
                                    measureCat: null,
                                    postcode: null,
                                    jobStatus: null,
                                };
                            });
                        }}
                    />
                    <CustomButton
                        text="Filter Jobs"
                        importedStyles={{
                            backgroundColor: Colors.primary,
                            color: Colors.white,
                        }}
                        onPress={filterJobsHandler}
                    />
                </View>
            </CustomModal>
            <View
                style={{
                    justifyContent: "space-between",
                    flexDirection: "row",
                }}
            >
                <View>
                    <ScreenTitle title="List of Current Visits" />
                </View>
                <View>
                    <AntDesign
                        name="filter"
                        size={24}
                        color={Colors.primary}
                        onPress={() => {
                            setFilterModal((prevData) => !prevData);
                        }}
                    />
                </View>
            </View>
            <View style={styles.container}>
                {jobList.length === 0 && (
                    <Text
                        style={{
                            textAlign: "center",
                            marginTop: 16,
                            fontSize: 16,
                            color: Colors.primary,
                        }}
                    >
                        No current visits available.
                    </Text>
                )}
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
                                        {item.job_status_id === 1 ? (
                                            <AntDesign
                                                name="checkcircle"
                                                size={24}
                                                color={Colors.success}
                                            />
                                        ) : (
                                            <AntDesign
                                                name="exclamationcircle"
                                                size={24}
                                                color={Colors.warning}
                                            />
                                        )}
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
    dropdown: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        width: "100%",
        padding: 10,
    },
    dropdownContainer: {
        width: "100%",
        paddingHorizontal: 16,
        backgroundColor: Colors.white,
        justifyContent: "center",
        borderRadius: 8,
        marginBottom: 16,
    },
    dropdownText: {
        fontSize: 14,
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between", // Ensures equal spacing between buttons
        alignItems: "center",
        marginTop: 16,
        marginBottom: 16,
        width: "100%", // Ensures the container spans the full width
    },
});

export default CurrentVisitScreen;
