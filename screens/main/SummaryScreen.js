import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
    useIsFocused,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import { addDays, addHours, format } from "date-fns";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import ScreenWrapper from "../../components/ScreenWrapper";
import ScreenTitle from "../../components/ScreenTitle";
import CustomButton from "../../components/CustomButton";
import Colors from "../../constants/Colors";
import { getJobSummary, updateCompletedJobs } from "../../util/db/jobs";
import { fetchDataFromDB, fetchFirstDataFromDB, insertOrUpdateData } from "../../util/database";
import { SurveyContext } from "../../store/survey-context";
import { getAllSurveyQuestions } from "../../util/db/surveyQuestions";
import { storeCompletedJob } from "../../util/db/completedJobs";
import { storeCompletedJobPhoto } from "../../util/db/completedJobPhotos";
import { getClientReinspectRemediation } from "../../util/db/clients";
import { storeLogs } from "../../util/db/queuedSms";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

function SummaryScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const surveyContext = useContext(SurveyContext);
    const { jobNumber } = route.params || {};
    const [jobSummary, setJobSummary] = useState({});
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

        const storeCompletedJobsQuery = storeCompletedJob();
        const storeCompletedJobPhotoQuery = storeCompletedJobPhoto();
        const updateCompletedJobsQuery = updateCompletedJobs();
        const getClientReinspectRemediationQuery = getClientReinspectRemediation();
        const getQueuedSmsQuery = storeLogs();
        const now = new Date(); // Declare now
        const dateToday = format(now, "yyyy-MM-dd HH:mm:ss");

        const specificJob = surveyContext.surveyData.filter(
            (job) => job.jobNumber === jobNumber,
        );

        // Loop through each job in specificJob and prepare data for completed jobs

        specificJob.forEach(async (job) => {
            // Prepare completed jobs data
            job.testResult.forEach(async (result) => {
                const completedJobsUuid = uuidv4();
                const completedJobsParams = [
                    completedJobsUuid,
                    result.jobId,
                    result.time,
                    result.geostamp,
                    result.result,
                    result.comment,
                    0,
                    0,
                    job.surveyQuestionSetId,
                    result.questionId,
                    null,
                    null,
                    dateToday,
                    dateToday
                ];

                try {
                    // Insert or update completed job data
                    await insertOrUpdateData(
                        storeCompletedJobsQuery,
                        completedJobsParams,
                    );

                    if (result.images.length !== 0) {
                        result.images.forEach(async (image) => {
                            const completedJobPhotosUuid = uuidv4();

                            const completedJobPhotoParams = [
                                completedJobPhotosUuid,
                                completedJobsUuid,
                                image.fileName,
                                image.uri,
                                0,
                                dateToday,
                                dateToday,
                                null,
                            ];

                            // Insert or update completed job photo data
                            await insertOrUpdateData(
                                storeCompletedJobPhotoQuery,
                                completedJobPhotoParams,
                            );
                        });
                    }
                } catch (error) {
                    console.error("Error preparing completed job data:", error);
                }
            });


            const getSurveyResult = job.testResult.filter(
                (result) => result.result === "Non-Compliant",
            );
            const getJobId = job.testResult.find(
                (result) => result.jobId,
            ).jobId;

            let jobRemediationType = "";
            let jobStatus = 3;
            let reinspectRemediation = dateToday;

            if (getSurveyResult.length !== 0) {
                const clientRemediationDuration = await fetchFirstDataFromDB(
                    getClientReinspectRemediationQuery,
                    getJobId,
                );

                const getCat1 = getSurveyResult.find(
                    (result) => result.ncSeverity === "Cat1"
                );

                jobRemediationType = "NC";
                jobStatus = 16;

                let remediationTime, durationUnit;

                if (getCat1) {
                    jobRemediationType = "Cat1";
                    remediationTime = clientRemediationDuration.cat1_remediate_complete;
                    durationUnit = clientRemediationDuration.cat1_remediate_complete_duration_unit;
                } else {
                    remediationTime = clientRemediationDuration.nc_remediate_complete;
                    durationUnit = clientRemediationDuration.nc_remediate_complete_duration_unit;
                }

                let adjustedDate;
                if (durationUnit === 1) {
                    adjustedDate = addHours(now, Number(remediationTime));
                } else {
                    adjustedDate = addDays(now, Number(remediationTime));
                }


                reinspectRemediation = format(adjustedDate, "yyyy-MM-dd HH:mm:ss");
            }

            const updateCompletedJobsParams = [
                jobStatus,
                dateToday,
                jobRemediationType === "" ? dateToday : null,
                jobRemediationType,
                reinspectRemediation,
                dateToday,
                // null,
                getJobId,
            ];

            // Update job data
            try {
                await insertOrUpdateData(
                    updateCompletedJobsQuery,
                    updateCompletedJobsParams,
                );
            } catch (error) {
                console.error("Error updating completed jobs:", error);
            }

            const queuedSmsParams = [
                getJobId,
                0,
                dateToday,
                dateToday
            ];

            // Store Queued SMS data
            try {
                await insertOrUpdateData(
                    getQueuedSmsQuery,
                    queuedSmsParams,
                );
            } catch (error) {
                console.error("Error updating completed jobs:", error);
            }

            surveyContext.removeJobSurveyData(job.jobNumber, job.umr);

            navigation.navigate("Dashboard");
        });

        // console.log("submit");
    };

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
                                                {`${jobStoredData?.testResult
                                                    ?.length || 0
                                                    } of ${job.questionsCount
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
                                marginBottom: 32,
                            },
                        ]}
                        disabled={!allJobsComplete}
                        onPress={submitSurveyHandler}
                    />
                </ScrollView>
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
