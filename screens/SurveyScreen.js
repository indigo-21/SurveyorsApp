import { ScrollView, StyleSheet, Text, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import TabNavigator from "../routes/TabNavigator";
import ConfigrationGrid from "../components/ConfigurationGrid";
import Colors from "../constants/Colors";
import CustomButton from "../components/CustomButton";
import { useState } from "react";
import CustomModal from "../components/CustomModal";

function SurveyScreen() {
    const [modalIsVisible, setModalIsVisible] = useState(false);

    const detailsHandler = () => {
        setModalIsVisible((prevData) => !prevData);
    };

    return (
        <View style={styles.container}>
            <CustomModal
                modalVisible={modalIsVisible}
                setModalVisible={setModalIsVisible}
                title="H_CONT"
                subtitle="Lodgement Type"
            >
                <View style={styles.content}>
                    <Text style={styles.contentTitle}>Scheme Measure Info</Text>
                    <Text style={styles.contentText}>
                        [Gas] Broken replacement - no pre-existing heating
                        controls - B_Broken_solid_nopreHCs
                    </Text>
                </View>
                <View style={styles.content}>
                    <Text style={styles.contentTitle}>Scheme</Text>
                    <Text style={styles.contentText}>
                        Energy Company Obligation (ECO)
                    </Text>
                    <Text style={styles.contentDescription}>
                        The Energy Company Obligation (ECO) is a government
                        energy efficiency scheme in Great Britain to help reduce
                        carbon emissions and tackle fuel poverty.
                    </Text>
                </View>
            </CustomModal>
            <View style={styles.measureContainer}>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{
                        flexDirection: "row",
                        maxHeight: 100,
                        width: "100%",
                    }}
                    contentContainerStyle={{ alignItems: "center" }} // Align items vertically
                >
                    <ConfigrationGrid
                        importedStyles={{ width: 120 }}
                        textContent="(ECO)"
                    >
                        <Text style={styles.text}>H_CONT</Text>
                    </ConfigrationGrid>
                    <ConfigrationGrid
                        importedStyles={{ width: 120 }}
                        textContent="(ECO)"
                    >
                        <Text style={styles.text}>BOILER</Text>
                    </ConfigrationGrid>
                    <ConfigrationGrid
                        importedStyles={{ width: 120 }}
                        textContent="(ECO)"
                    >
                        <Text style={styles.text}>UFI</Text>
                    </ConfigrationGrid>
                    <ConfigrationGrid
                        importedStyles={{ width: 120 }}
                        textContent="(ECO)"
                    >
                        <Text style={styles.text}>Summary</Text>
                    </ConfigrationGrid>
                </ScrollView>
                <View style={styles.measureInfoContainer}>
                    <CustomButton
                        importedStyles={{
                            backgroundColor: Colors.primary,
                            color: Colors.white,
                            justifyContent: "center",
                            height: 40,
                        }}
                        text="Measure Details"
                        onPress={detailsHandler}
                    />
                    {/* <View style={styles.measureSubInfoContainer}>
                        <Text style={styles.measureTitle}>
                            Scheme Measure Info
                        </Text>
                        <Text style={styles.measureSubTitle}>
                            [Gas] Broken replacement - no pre-existing heating
                            controls - B_Broken_solid_nopreHCs
                        </Text>
                    </View> */}
                </View>
            </View>

            {/* Dynamic Content */}
            <View style={styles.tabContainer}>
                <TabNavigator />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },
    measureContainer: {
        height: 180,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f8f8",
        padding: 16,
    },
    tabContainer: {
        flex: 1,
    },
    text: {
        fontSize: 14,
        color: Colors.black,
    },
    measureInfoContainer: {
        flex: 1,
        flexDirection: "row",
        width: "100%",
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    measureSubInfoContainer: {
        flexDirection: "row",
    },
    measureTitle: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: "600",
        marginBottom: 4,
    },
    measureSubTitle: {
        fontSize: 14,
        color: Colors.black,
    },
    content: {
        padding: 16,
        marginBottom: 8,
        backgroundColor: Colors.white,
        borderRadius: 8,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
    contentTitle: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: "600",
        marginBottom: 4,
    },
    contentText: {
        fontSize: 14,
        color: Colors.black,
    },
    contentDescription: {
        fontSize: 14,
        color: Colors.black,
        marginTop: 4,
        fontStyle: "italic",
    },
});

export default SurveyScreen;
