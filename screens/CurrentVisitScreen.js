import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import ScreenWrapper from "../components/ScreenWrapper";
import JobList from "../components/JobList";
import Colors from "../constants/Colors";
import CustomModal from "../components/CustomModal";
import ScreenTitle from "../components/ScreenTitle";
import AntDesign from "@expo/vector-icons/AntDesign";

function CurrentVisitScreen() {
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Current Visits",
        });
    }, [navigation]);

    function navigationPressHandler() {
        setModalIsVisible((prevData) => !prevData);
    }

    function updateNavigateHandler() {
        setModalIsVisible((prevData) => !prevData);
        navigation.navigate("UpdateJob");
    }

    function jobDetailsNavigateHandler() {
        setModalIsVisible((prevData) => !prevData);
        navigation.navigate("JobDetails");
    }

    function surveyNavigateHandler() {
        setModalIsVisible((prevData) => !prevData);
        navigation.navigate("Survey");
    }

    return (
        <ScreenWrapper>
            <CustomModal
                modalVisible={modalIsVisible}
                setModalVisible={setModalIsVisible}
                title="AES000000012"
                subtitle="Job Number"
            >
                <View style={styles.row}>
                    <Pressable
                        android_ripple={{ color: Colors.ripple }}
                        onPress={updateNavigateHandler}
                        style={({ pressed }) =>
                            pressed
                                ? [styles.pressedItem, styles.buttonOptions]
                                : styles.buttonOptions
                        }
                    >
                        <Text style={styles.text}>Update Status</Text>
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
                <View style={styles.row}>
                    <Pressable
                        android_ripple={{ color: Colors.ripple }}
                        onPress={surveyNavigateHandler}
                        style={({ pressed }) =>
                            pressed
                                ? [styles.pressedItem, styles.buttonOptions]
                                : styles.buttonOptions
                        }
                    >
                        <Text style={styles.text}>Start Survey</Text>
                        <AntDesign
                            name="rightcircle"
                            size={24}
                            color={Colors.primary}
                        />
                    </Pressable>
                </View>
            </CustomModal>
            <ScreenTitle title="List of Current Visits" />
            <View style={styles.container}>
                <JobList onPress={navigationPressHandler}>
                    <View
                        style={{
                            flexDirection: "row",
                            width: "100%",
                            height: 80,
                            alignItems: "center",
                        }}
                    >
                        <View style={styles.clientRow}>
                            <Text style={styles.clientName}>AES</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                                AES000000012
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Address: 123 Main St, City, State
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Postcode: B9 5RJ
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Booking Date: May 05, 2025 08:30
                            </Text>
                        </View>
                    </View>
                </JobList>
                <JobList onPress={navigationPressHandler}>
                    <View
                        style={{
                            flexDirection: "row",
                            width: "100%",
                            height: 80,
                            alignItems: "center",
                        }}
                    >
                        <View style={styles.clientRow}>
                            <Text style={styles.clientName}>AES</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                                AES000000012
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Address: 123 Main St, City, State
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Postcode: B9 5RJ
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Booking Date: May 05, 2025 08:30
                            </Text>
                        </View>
                    </View>
                </JobList>
                <JobList onPress={navigationPressHandler}>
                    <View
                        style={{
                            flexDirection: "row",
                            width: "100%",
                            height: 80,
                            alignItems: "center",
                        }}
                    >
                        <View style={styles.clientRow}>
                            <Text style={styles.clientName}>AES</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                                AES000000012
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Address: 123 Main St, City, State
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Postcode: B9 5RJ
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Booking Date: May 05, 2025 08:30
                            </Text>
                        </View>
                    </View>
                </JobList>

                <JobList onPress={navigationPressHandler}>
                    <View
                        style={{
                            flexDirection: "row",
                            width: "100%",
                            height: 80,
                            alignItems: "center",
                        }}
                    >
                        <View style={styles.clientRow}>
                            <Text style={styles.clientName}>AES</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                                AES000000012
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Address: 123 Main St, City, State
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Postcode: B9 5RJ
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Booking Date: May 05, 2025 08:30
                            </Text>
                        </View>
                    </View>
                </JobList>
                <JobList onPress={navigationPressHandler}>
                    <View
                        style={{
                            flexDirection: "row",
                            width: "100%",
                            height: 80,
                            alignItems: "center",
                        }}
                    >
                        <View style={styles.clientRow}>
                            <Text style={styles.clientName}>AES</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                                AES000000012
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Address: 123 Main St, City, State
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Postcode: B9 5RJ
                            </Text>
                            <Text style={{ fontSize: 12 }}>
                                Booking Date: May 05, 2025 08:30
                            </Text>
                        </View>
                    </View>
                </JobList>
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

export default CurrentVisitScreen;
