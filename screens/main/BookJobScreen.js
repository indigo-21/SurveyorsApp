import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";

import ScreenWrapper from "../../components/ScreenWrapper";
import JobList from "../../components/JobList";
import Colors from "../../constants/Colors";
import CustomModal from "../../components/CustomModal";
import ScreenTitle from "../../components/ScreenTitle";
import { fetchDataFromDB, insertOrUpdateData } from "../../util/database";
import { getPropertyInspectorJobs, updateBookingJob } from "../../util/db/jobs";
import { bookPIJob } from "../../util/db/bookings";
import ModalButton from "../../components/CustomModalBtn";
import { AuthContext } from "../../store/auth-context";
import CustomButton from "../../components/CustomButton";

function BookJobScreen() {
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [activeJob, setActiveJob] = useState({ jobNumber: null, jobID: null });
    const [comment, setComment] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isPickerVisible, setPickerVisible] = useState(false);
    const navigation = useNavigation();
    const route = useRoute();
    const [unbookedJobs, setUnbookedJobs] = useState([]);
    const [searchText, setSearchText] = useState("");
    const authContext = useContext(AuthContext);
    const propertyInspector = authContext.propertyInspector;
    const propertyInspectorID = route.params?.propertyInspectorID;
    const userID = propertyInspector.user.id;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Book Job",
        });
    }, [navigation]);

    const showPicker = () => {
        setPickerVisible(true);
    };

    const hidePicker = () => {
        setPickerVisible(false);
    };

    const handleConfirm = (date) => {
        setSelectedDate(date);
        hidePicker();
    };

    async function bookJobPressHandler(jobNumber, jobID) {
        setModalIsVisible((prevData) => !prevData);
        setActiveJob({ jobNumber, jobID });

        // const formattedDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    }

    async function submitBookJobHandler() {

        const formattedDate = format(selectedDate, "yyyy-MM-dd HH:mm:ss");
        const dateToday = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

        const bookJobQuery = bookPIJob();
        const bookParams = [
            activeJob.jobNumber,
            "Booked",
            userID,
            propertyInspectorID,
            formattedDate,
            comment || "Booked by Property Inspector",
            dateToday,
            dateToday,
        ];

        const updateJobQuery = updateBookingJob();
        const updateParams = [
            2,
            dateToday,
            formattedDate,
            "%" + activeJob.jobNumber + "%",
        ];

        // console.log(comment);

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

    function jobDetailsNavigateHandler(jobNumber, jobID) {
        // setModalIsVisible((prevData) => !prevData);
        navigation.navigate("JobDetails", { jobID, jobNumber });
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

    return (
        <ScreenWrapper>

            <CustomModal
                setModalVisible={setModalIsVisible}
                modalVisible={modalIsVisible}
                title={activeJob.jobNumber}
                subtitle="Job Number"
            >

                <View style={styles.content}>
                    <CustomButton
                        text="Select Date & Time"
                        importedStyles={{
                            backgroundColor: Colors.primary,
                            color: Colors.white,
                            marginTop: 16,
                        }}
                        onPress={showPicker}
                    />
                </View>

                <Text
                    style={[
                        {
                            backgroundColor: Colors.white,
                            margin: 16,
                            padding: 8,
                            borderRadius: 8,
                            textAlign: "center",
                            width: "80%",
                            fontSize: 16,
                        },
                    ]}
                    onPress={showPicker}
                >
                    Selected: {format(selectedDate, "yyyy-MM-dd HH:mm:ss")}
                </Text>

                <DateTimePickerModal
                    isVisible={isPickerVisible}
                    mode="datetime"
                    date={selectedDate}
                    onConfirm={handleConfirm}
                    onCancel={hidePicker}
                    is24Hour={false} // Set to true for 24-hour format
                    themeVariant="light" // <-- This is critical on iOS
                    textColor="#000000" // <-- Makes text visible on white background
                />

                <TextInput
                    style={styles.textInput}
                    multiline
                    autoFocus={false}
                    placeholder="Add Comment (Optional)"
                    onChangeText={(value) =>
                        setComment(value)
                    }
                />
                <ModalButton title="Book" onPress={submitBookJobHandler} />
            </CustomModal>

            <ScreenTitle title="List of Unbooked Jobs" />

            <View style={styles.searchContainer}>
                <FontAwesome5 name="search" size={18} color={Colors.primary} />
                <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search job #, address, postcode, cert no..."
                    placeholderTextColor={Colors.ripple}
                    style={styles.searchInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="never"
                />
                {!!searchText && (
                    <Pressable
                        onPress={() => setSearchText("")}
                        style={({ pressed }) => [
                            styles.searchClearBtn,
                            pressed && { opacity: 0.6 },
                        ]}
                        hitSlop={10}
                    >
                        <FontAwesome5 name="times-circle" size={18} color={Colors.ripple} />
                    </Pressable>
                )}
            </View>

            <View style={styles.container}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={[...unbookedJobs]
                        .filter((item) => {
                            const q = searchText.trim().toLowerCase();
                            if (!q) return true;
                            const includes = (value) =>
                                value != null && String(value).toLowerCase().includes(q);
                            return (
                                includes(item.group_id) ||
                                includes(item.address1) ||
                                includes(item.address2) ||
                                includes(item.address3) ||
                                includes(item.city) ||
                                includes(item.county) ||
                                includes(item.postcode) ||
                                includes(item.cert_no) ||
                                includes(item.client_abbrevation)
                            );
                        })
                        .reverse()}
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
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 16, borderRadius: 2 }}>
                                        <Pressable
                                            onPress={() => bookJobPressHandler(item.group_id, item.id)}
                                            style={({ pressed }) => [
                                                { padding: 8, borderRadius: 4 },
                                                pressed && { backgroundColor: Colors.ripple }
                                            ]}
                                        >
                                            <Text style={{ color: Colors.primary, fontWeight: "bold", fontSize: 16 }}>
                                                Book
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
    searchContainer: {
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.ripple,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: Colors.white,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: Colors.black,
    },
    searchClearBtn: {
        paddingLeft: 8,
    },
    content: {
        flexDirection: "row",
        paddingVertical: 4,
        flexWrap: "wrap",
        justifyContent: "space-between",
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
    textInput: {
        height: 60,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop: 8,
        width: "100%",
        color: Colors.black,
        padding: 10,
        marginBottom: 32,
    },
});

export default BookJobScreen;
