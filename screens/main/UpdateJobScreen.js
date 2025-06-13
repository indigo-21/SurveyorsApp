import { StyleSheet, Text, View } from "react-native";
import { useContext, useState, useLayoutEffect } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";

import { AuthContext } from "../../store/auth-context";
import Colors from "../../constants/Colors";
import CustomButton from "../../components/CustomButton";
import ScreenWrapper from "../../components/ScreenWrapper";
import ScreenTitle from "../../components/ScreenTitle";
import BookingService from "./services/BookingService";

const status = [
    { id: "1", label: "Customer No Show", value: "1" },
    { id: "15", label: "Customer Cancelled", value: "2" },
    { id: "23", label: "Customer Required Rebook", value: "3" },
    { id: "1", label: "Rebook", value: "4" },
];

function UpdateJobScreen() {
    const navigation = useNavigation();
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(status);
    const [isRebook, setIsRebook] = useState(false);
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const route = useRoute();
    const authContext = useContext(AuthContext);

    const propertyInspector = authContext.propertyInspector;

    const { jobID, jobNumber } = route.params;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Update Job",
        });
    }, [navigation]);

    const navigateHandler = () => {
        navigation.navigate("JobDetails", { jobID, jobNumber });
    };

    const updateJobHandler = async (value) => {
        if (value === "4") {
            setIsRebook(true);
        } else {
            setIsRebook(false);
        }

        setValue(value);
        // BookingService(value, status, jobNumber, propertyInspector, selectedDate);
    };

    const submitUpdateJobHandler = async () => {
        try {
            await BookingService(
                value,
                status,
                jobNumber,
                propertyInspector,
                selectedDate,
            );
            setTimeout(() => {
                navigation.goBack();
            }, 300);
        } catch (error) {
            console.error("Error updating job:", error);
        }
    };

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

    return (
        <ScreenWrapper>
            <ScreenTitle title={`Update Job: ${jobNumber}`} />

            <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownText}>Job Status:</Text>
                <Dropdown
                    data={items}
                    labelField="label"
                    valueField="value"
                    value={value}
                    style={styles.dropdown}
                    placeholder="Select"
                    onChange={(value) => {
                        updateJobHandler(value.value);
                    }}
                />
            </View>
            {isRebook && (
                <>
                    <View style={styles.container}>
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
                    </View>
                </>
            )}

            <View style={styles.buttonContainer}>
                <CustomButton
                    text="Cancel"
                    importedStyles={{
                        backgroundColor: Colors.cancel,
                        color: Colors.black,
                    }}
                    onPress={() => navigation.goBack()}
                />
                <CustomButton
                    text="Update"
                    importedStyles={{
                        backgroundColor: Colors.primary,
                        color: Colors.white,
                    }}
                    onPress={() => submitUpdateJobHandler()}
                />
            </View>
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <View style={styles.container}>
                    <Text
                        style={[
                            styles.text,
                            { fontStyle: "italic", fontSize: 13 },
                        ]}
                    >
                        Click the button below to view the job details.
                    </Text>
                </View>

                <View style={styles.content}>
                    <CustomButton
                        text="Job Details"
                        importedStyles={{
                            backgroundColor: Colors.primary,
                            color: Colors.white,
                            marginTop: 16,
                        }}
                        onPress={navigateHandler}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between", // Ensures equal spacing between buttons
        alignItems: "center",
        marginTop: 16,
        width: "100%", // Ensures the container spans the full width
    },

    content: {
        flexDirection: "row",
        paddingVertical: 4,
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    text: {
        color: Colors.black,
        marginHorizontal: 8,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        margin: 8,
    },
    textColumn: {
        color: Colors.black,
        marginHorizontal: 8,
        fontWeight: "bold",
        flexBasis: 120,
    },
    container: {
        width: "100%",
        marginTop: 16,
        justifyContent: "center",
        alignItems: "center",
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
        marginTop: 16,
        paddingHorizontal: 16,
        backgroundColor: Colors.white,
        height: "13%",
        justifyContent: "center",
        borderRadius: 8,
    },
    dropdownText: {
        fontSize: 14,
        marginBottom: 8,
    },
});

export default UpdateJobScreen;
