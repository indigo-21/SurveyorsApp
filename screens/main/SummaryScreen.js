import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useIsFocused, useRoute } from "@react-navigation/native";

import ScreenWrapper from "../../components/ScreenWrapper";
import ScreenTitle from "../../components/ScreenTitle";
import CustomButton from "../../components/CustomButton";
import Colors from "../../constants/Colors";
import { getJobSummary } from "../../util/db/jobs";
import { fetchDataFromDB } from "../../util/database";
import { SurveyContext } from "../../store/survey-context";
import { getAllSurveyQuestions } from "../../util/db/surveyQuestions";

function SummaryScreen() {
    const route = useRoute();
    const { jobNumber } = route.params || {};
    const [jobSummary, setJobSummary] = useState({});
    const surveyContext = useContext(SurveyContext);
    const isFocused = useIsFocused();
    const [allJobsComplete, setAllJobsComplete] = useState(false);

    useEffect(() => {
        const getJobSummaryQuery = getJobSummary();
        const getJobSummaryParams = ["%" + jobNumber + "%"];
        const fetchJobSummary = async () => {
            try {
                const jobs = await fetchDataFromDB(
                    getJobSummaryQuery,
                    getJobSummaryParams,
                );
                // For each job, fetch its questions and add questionsCount
                const jobsWithQuestions = await Promise.all(
                    jobs.map(async (job) => {
                        const questions = await fetchDataFromDB(
                            getAllSurveyQuestions(),
                            [job.measure_cat, job.survey_question_set_id],
                        );
                        return {
                            ...job,
                            questionsCount: questions.length,
                        };
                    }),
                );

                const allComplete = jobsWithQuestions.every((job) => {
                    const jobStoredData = surveyContext.surveyData.find(
                        (jobItem) =>
                            jobItem.jobNumber === jobNumber &&
                            jobItem.umr === job.umr,
                    );
                    const answeredCount =
                        jobStoredData?.testResult?.length || 0;
                    return answeredCount === job.questionsCount;
                });

                setAllJobsComplete(allComplete);
                setJobSummary(jobsWithQuestions);
            } catch (error) {
                console.error("Error fetching job summary:", error);
            }
        };
        fetchJobSummary();
    }, [isFocused]);

    const submitSurveyHandler = () => {
        console.log("submit");
    };

    // console.info(JSON.stringify(surveyContext));
    return (
        <ScreenWrapper>
            <ScreenTitle title="Summary of Survey" />
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {jobSummary && jobSummary.length > 0 ? (
                        jobSummary.map((job) => {
                            const jobStoredData = surveyContext.surveyData.find(
                                (jobItem) =>
                                    jobItem.jobNumber === jobNumber &&
                                    jobItem.umr === job.umr,
                            );

                            const testResultCount =
                                jobStoredData?.testResult?.length || 0;

                            const averageScore = (
                                (testResultCount * 100) /
                                job.questionsCount
                            ).toFixed();

                            const isComplete =
                                testResultCount === job.questionsCount;

                            return (
                                <View key={job.id} style={styles.row}>
                                    <View style={styles.box}>
                                        <View
                                            style={{
                                                alignItems: "center",
                                                marginBottom: 16,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: "bold",
                                                    color: Colors.primary,
                                                }}
                                            >
                                                {job.job_number}
                                            </Text>
                                            <Text>Job Number</Text>
                                        </View>
                                        <View style={styles.content}>
                                            <Text style={styles.textColumn}>
                                                Measure Cat
                                            </Text>
                                            <Text style={styles.text}>
                                                {job.measure_cat}
                                            </Text>
                                        </View>
                                        <View style={styles.content}>
                                            <Text style={styles.textColumn}>
                                                UMR
                                            </Text>
                                            <Text style={styles.text}>
                                                {job.umr}
                                            </Text>
                                        </View>
                                        <View style={styles.content}>
                                            <Text style={styles.textColumn}>
                                                Scheme
                                            </Text>
                                            <Text style={styles.text}>
                                                {job.short_name}
                                            </Text>
                                        </View>
                                        <View style={styles.content}>
                                            <Text style={styles.textColumn}>
                                                Overall Status
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.text,
                                                    {
                                                        backgroundColor:
                                                            isComplete
                                                                ? Colors.success
                                                                : Colors.warning,
                                                        paddingHorizontal: 8,
                                                        paddingVertical: 2,
                                                        borderRadius: 12,
                                                        color: Colors.white,
                                                    },
                                                ]}
                                            >
                                                {!isComplete
                                                    ? `Incomplete`
                                                    : `Complete`}
                                            </Text>
                                        </View>
                                        <View style={styles.content}>
                                            <Text style={styles.textColumn}>
                                                Questions Answered
                                            </Text>
                                            <Text style={styles.text}>
                                                (
                                                {`${
                                                    jobStoredData?.testResult
                                                        ?.length || 0
                                                } of ${
                                                    job.questionsCount
                                                }, ${averageScore}%`}
                                                )
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text>No job summary available.</Text>
                    )}
                </ScrollView>
            </View>
            <View style={{ justifyContent: "flex-end" }}>
                <View style={styles.content}>
                    <CustomButton
                        text="Submit"
                        importedStyles={[
                            allJobsComplete
                                ? {
                                      backgroundColor: Colors.primary,
                                  }
                                : {
                                      backgroundColor: Colors.cancel,
                                  },
                            {
                                color: Colors.white,
                                marginTop: 16,
                            },
                        ]}
                        disabled={!allJobsComplete}
                        onPress={submitSurveyHandler}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 16,
    },
    row: {
        flexDirection: "column",
        justifyContent: "space-between",
        paddingHorizontal: 10,
    },
    box: {
        width: "100%",
        backgroundColor: "white",
        marginVertical: 5,
        borderRadius: 10,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        padding: 20,
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
        fontSize: 14,
    },
    textColumn: {
        color: Colors.black,
        marginHorizontal: 8,
        fontWeight: "bold",
        flexBasis: 120,
        fontSize: 14,
    },
});

export default SummaryScreen;
