import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";

import ScreenWrapper from "../components/ScreenWrapper";
import ScreenTitle from "../components/ScreenTitle";
import DropDownPicker from "react-native-dropdown-picker";
import Colors from "../constants/Colors";
import CustomButton from "../components/CustomButton";
import JobDetailsBox from "../components/JobDetailsBox";

const status = [
    { label: "Customer No Show", value: "1" },
    { label: "Customer Cancelled", value: "2" },
    { label: "Customer Required Rebook", value: "3" },
    { label: "Rebook", value: "4" },
];

function UpdateJobScreen() {
    const navigation = useNavigation();
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(status);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Update Job",
        });
    }, [navigation]);

    return (
        <ScreenWrapper>
            <ScreenTitle title="Update Job: TMK0000000024" />

            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                placeholder="Select a Status"
                style={{
                    borderColor: "#ccc",
                    borderRadius: 10,
                    height: 50,
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    marginTop: 16,
                }}
                textStyle={{
                    textAlign: "center",
                    fontSize: 16,
                    color: "#333",
                }}
                placeholderStyle={{
                    textAlign: "center",
                    color: "gray",
                    fontWeight: "500",
                }}
                dropDownContainerStyle={{
                    borderColor: "#ccc",
                    borderRadius: 10,
                    height: "auto",
                }}
                listItemLabelStyle={{
                    textAlign: "center",
                    borderBottomColor: "#ccc",
                    borderBottomWidth: 1,
                    paddingBottom: 8,
                }}
                searchContainerStyle={{
                    borderBottomWidth: 0,
                }}
                listItemContainerStyle={{
                    height: 40,
                    justifyContent: "center",
                    alignContent: "center",
                }}
            />

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
                />
            </View>

            <View style={styles.container}>
                <JobDetailsBox title="Job Location">
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Owner Name</Text>
                        <Text style={styles.text}>Someone</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Email</Text>
                        <Text style={styles.text}>
                            someonetesting@gmail.com
                        </Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Contact </Text>
                        <Text style={styles.text}>44628172381</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>
                            Alternative Contact
                        </Text>
                        <Text style={styles.text}>N/A</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>City</Text>
                        <Text style={styles.text}>Birmingham</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Address</Text>
                        <Text style={styles.text}>Third Avenue</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>County</Text>
                        <Text style={styles.text}>West Midlands</Text>
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.textColumn}>Postcode</Text>
                        <Text style={styles.text}>B9 5RJ</Text>
                    </View>

                    <View style={styles.content}>
                        <CustomButton
                            text="More Details"
                            importedStyles={{
                                backgroundColor: Colors.primary,
                                color: Colors.white,
                                marginTop: 16,
                            }}
                            onPress={() => navigation.navigate("JobDetails")}
                        />
                    </View>
                </JobDetailsBox>
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
    },
});

export default UpdateJobScreen;
