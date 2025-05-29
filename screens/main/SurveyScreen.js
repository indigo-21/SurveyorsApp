import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import ConfigrationGrid from "../../components/ConfigurationGrid";
import Colors from "../../constants/Colors";
import CustomButton from "../../components/CustomButton";
import CustomModal from "../../components/CustomModal";
import TabNavigator from "../../routes/TabNavigator";
import ScreenTitle from "../../components/ScreenTitle";
import { getJobMeasures } from "../../util/db/jobMeasures";
import { fetchDataFromDB } from "../../util/database";
import { SurveyContext } from "../../store/survey-context";

function SurveyScreen() {
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [schemeList, setSchemeList] = useState([]);
    const route = useRoute();
    const surveyContext = useContext(SurveyContext);
    const navigation = useNavigation();

    const { jobNumber, jobID } = route.params || {};

    const detailsHandler = () => {
        setModalIsVisible((prevData) => !prevData);
    };

    useEffect(() => {
        const getJobMeasuresQuery = getJobMeasures();

        const fetchJobMeasures = async () => {
            await fetchDataFromDB(getJobMeasuresQuery, ["%" + jobNumber + "%"])
                .then((data) => {
                    setSchemeList(data);
                    surveyContext.storeJobInfo({
                        measureId: data[0].measure_id,
                        surveyQuestionSetId: data[0].survey_question_set_id,
                        schemeId: data[0].scheme_id,
                        info: data[0].info,
                        description: data[0].description,
                        shortName: data[0].short_name,
                        jobId: jobID,
                        jobNumber: jobNumber,
                        measureCat: data[0].measure_cat,
                        umr: data[0].umr,
                    });

                }).catch((error) => {
                    console.error("Error fetching job measures:", error);
                });
        };

        fetchJobMeasures();

    }, []);

    const changeMeasureHandler = (data) => {
        surveyContext.storeJobInfo({
            measureId: data.measure_id,
            info: data.info,
            description: data.description,
            measureCat: data.measure_cat,
            umr: data.umr,
        });
    };

    return (
        <View style={styles.container}>
            <CustomModal
                modalVisible={modalIsVisible}
                setModalVisible={setModalIsVisible}
                title={surveyContext.jobInfo.measureCat}
                subtitle="Measure Cat"
            >
                <View style={styles.content}>
                    <Text style={styles.contentTitle}>Scheme Measure Info</Text>
                    <Text style={styles.contentText}>
                        {surveyContext.jobInfo.info}
                    </Text>
                </View>
                <View style={styles.content}>
                    <Text style={styles.contentTitle}>Scheme</Text>
                    <Text style={styles.contentText}>
                        Energy Company Obligation (ECO)
                    </Text>
                    <Text style={styles.contentDescription}>
                        {surveyContext.jobInfo.description}
                    </Text>
                </View>
            </CustomModal>
            <View style={styles.measureContainer}>

                <ScreenTitle title={`Job Number: ${jobNumber}`} size={16} />

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
                    {schemeList.map((item, index) => {
                        return (
                            <ConfigrationGrid
                                key={item.id}
                                importedStyles={
                                    surveyContext.jobInfo.measureId === item.measure_id && surveyContext.jobInfo.umr === item.umr ?
                                        { backgroundColor: Colors.primary, width: 120 } :
                                        { width: 120 }
                                }
                                textContent={`(${item.short_name})`}
                                onPress={() => changeMeasureHandler(item)}
                                active={surveyContext.jobInfo.measureId === item.measure_id && surveyContext.jobInfo.umr === item.umr}
                            >
                                <Text style={
                                    surveyContext.jobInfo.measureId === item.measure_id && surveyContext.jobInfo.umr === item.umr ?
                                        [styles.text, { color: Colors.white }] :
                                        styles.text
                                }>
                                    {item.measure_cat}
                                </Text>
                            </ConfigrationGrid>
                        );
                    })}
                    <ConfigrationGrid
                        importedStyles={{ width: 120 }}
                        textContent="Review"
                        onPress={() => navigation.navigate("Summary", { jobNumber })}
                    >
                        <Text style={styles.text}>
                            Summary
                        </Text>
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
        width: "100%",
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
