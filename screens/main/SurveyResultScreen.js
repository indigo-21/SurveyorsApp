import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import ScreenWrapper from "../../components/ScreenWrapper";
import ConfigrationGrid from "../../components/ConfigurationGrid";
import { getJobMeasures } from "../../util/db/jobMeasures";
import { fetchDataFromDB } from "../../util/database";
import Colors from "../../constants/Colors";
import { getCompletedJobSurveyResults } from "../../util/db/completedJobs";
import ScreenTitle from "../../components/ScreenTitle";

function SurveyResultScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [jobMeasures, setJobMeasures] = useState([]);
    const [activeJob, setActiveJob] = useState(null);
    const [surveyResults, setSurveyResults] = useState([]);
    const flatListRef = useRef(null);

    const { jobNumber, jobId } = route.params || {};

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Survey Results",
        });
    }, [navigation]);

    useEffect(() => {
        const getJobMeasuresQuery = getJobMeasures();

        const fetchJobMeasures = async () => {
            await fetchDataFromDB(getJobMeasuresQuery, [`%${jobNumber}%`])
                .then((data) => {
                    setJobMeasures(data);
                    setActiveJob(data[0].job_id);
                })
                .catch((error) => {
                    console.error("Error fetching job measures:", error);
                });
        };

        fetchJobMeasures();
    }, []);

    useEffect(() => {
        const fetchCompletedJobSurveyResults = async () => {
            await fetchDataFromDB(getCompletedJobSurveyResults(), [activeJob])
                .then((data) => {
                    setSurveyResults(data);
                })
                .catch((error) => {
                    console.error(
                        "Error fetching completed job survey results:",
                        error,
                    );
                });
        };

        fetchCompletedJobSurveyResults();
    }, [activeJob]);

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0 });
        }
    }, [activeJob]);

    const changeMeasureHandler = (data) => {
        setActiveJob(data.job_id);
    };

    return (
        <ScreenWrapper>
            <View style={styles.rowConfiguration}>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={{
                        flexDirection: "row",
                        maxHeight: 100,
                        width: "100%",
                    }}
                    contentContainerStyle={{ alignItems: "center" }}
                >
                    {jobMeasures.map((item) => {
                        return (
                            <ConfigrationGrid
                                key={item.job_id}
                                importedStyles={
                                    activeJob === item.job_id
                                        ? {
                                              backgroundColor: Colors.primary,
                                              width: 120,
                                          }
                                        : { width: 120 }
                                }
                                textContent={`(${item.short_name})`}
                                onPress={() => changeMeasureHandler(item)}
                                active={activeJob === item.job_id}
                            >
                                <Text
                                    style={
                                        activeJob === item.job_id
                                            ? [
                                                  styles.text,
                                                  { color: Colors.white },
                                              ]
                                            : styles.text
                                    }
                                >
                                    {item.measure_cat}
                                </Text>
                            </ConfigrationGrid>
                        );
                    })}
                </ScrollView>
            </View>
            <FlatList
                ref={flatListRef}
                showsVerticalScrollIndicator={false}
                data={surveyResults}
                keyExtractor={(item) => item.survey_question_id}
                renderItem={({ item }) => (
                    <View style={styles.surveyResultsContainer}>
                        <View style={styles.textRow}>
                            <Text style={styles.textTitle}>
                                {item.question_number}:{" "}
                            </Text>
                            <Text style={styles.text}>{item.question}</Text>
                        </View>
                        <View style={styles.textRow}>
                            <Text style={styles.textTitle}>Result: </Text>
                            <Text style={styles.text}>{item.pass_fail}</Text>
                        </View>
                        <View style={styles.textRow}>
                            <Text style={styles.textTitle}>Comments: </Text>
                            <Text style={styles.text}>
                                {item.comments === "" ? "N/A" : item.comments}
                            </Text>
                        </View>
                        <View style={styles.textRow}>
                            <Text style={styles.textTitle}>Survey Type: </Text>
                            <Text style={styles.text}>
                                {item.score_monitoring
                                    ? "Score Monitoring"
                                    : "Measure Specific"}
                            </Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <Text style={styles.text}>No survey results found.</Text>
                }
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    rowConfiguration: {
        // flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        maxHeight: 90,
        alignContent: "center",
        marginBottom: 16,
    },
    text: {
        fontSize: 14,
    },
    textTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginRight: 8,
    },
    surveyResultsContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.white,
        borderRadius: 8,
        marginTop: 10,
    },
    textRow: {
        flexDirection: "row",
        marginBottom: 12,
        flexWrap: "wrap",
        flexBasis: "100%",
    },
});

export default SurveyResultScreen;
