import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";
import { format } from 'date-fns';

export const SurveyContext = createContext({
    jobInfo: {
        measureId: 0,
        surveyQuestionSetId: 0,
        schemeId: 0,
        info: "",
        description: "",
        shortName: "",
        longName: "",
        jobId: 0,
        jobNumber: 0,
        surveyType: 1,
        measureCat: "",
        umr: "",
    },
    surveyData: [],
    storeJobInfo: (data) => { },
    setValueHandler: (surveyData, location, questionNumber, ncSeverity, value, id, option) => { },
    removeJobSurveyData: (jobNumber, umr) => { },
});

function SurveyContextProvider({ children }) {
    const [jobInfo, setJobInfo] = useState([]);
    const [surveyData, setSurveyData] = useState([]);

    useEffect(() => {
        const loadStoredSurveyData = async () => {
            // await AsyncStorage.removeItem("surveyData");

            try {
                const storedData = await AsyncStorage.getItem("surveyData");
                if (storedData !== null) {
                    setSurveyData(JSON.parse(storedData));
                }

            } catch (e) {
                console.error("Failed to load survey data", e);
            }
        };
        loadStoredSurveyData();
    }, []);

    useEffect(() => {
        const saveSurveyData = async () => {
            // await AsyncStorage.removeItem("surveyData");

            try {
                await AsyncStorage.setItem("surveyData", JSON.stringify(surveyData));
            } catch (e) {
                console.error("Failed to save survey data", e);
            }
        };
        saveSurveyData();
    }, [surveyData]);

    function storeJobInfo(data) {
        setJobInfo((prevState) => ({
            ...prevState,
            ...data,
        }));
    };

    // console.info(JSON.stringify(surveyData));


    function setValueHandler(surveyData, location, questionNumber, ncSeverity, value, id, option) {
        const { jobNumber, umr, surveyType, surveyQuestionSetId } = surveyData;

        setSurveyData((prev) => {
            const existingJob = prev.find(
                (job) => job.jobNumber === jobNumber && job.umr === umr
            );

            if (existingJob) {
                const testResults = existingJob.testResult || [];

                const existingResult =
                    testResults.find(
                        (r) => r.questionId === id && r.surveyType === surveyType
                    ) || {
                        questionId: id,
                        jobId: jobInfo.jobId || 0,
                        time: format(new Date(), 'HH:mm'),
                        geostamp: location,
                        questionNumber,
                        ncSeverity,
                        surveyType,
                        result: "",
                        comment: "",
                        images: [],
                    };

                const newResult = {
                    ...existingResult,
                    [option]: value,
                };

                const updatedTestResults = [
                    ...testResults.filter(
                        (r) =>
                            !(r.questionId === id && r.surveyType === surveyType)
                    ),
                    newResult,
                ];

                const updatedJobs = prev.map((job) =>
                    job.jobNumber === jobNumber && job.umr === umr
                        ? { ...job, testResult: updatedTestResults }
                        : job
                );

                return updatedJobs;
            } else {
                return [
                    ...prev,
                    {
                        jobNumber,
                        umr,
                        surveyQuestionSetId,
                        surveyType,
                        testResult: [
                            {
                                questionId: id,
                                jobId: jobInfo.jobId || 0,
                                time: format(new Date(), 'HH:mm'),
                                geostamp: location,
                                questionNumber,
                                ncSeverity,
                                surveyType,
                                result: option === "result" ? value : "",
                                comment: option === "comment" ? value : "",
                                images: option === "images" ? value : [],
                            },
                        ],
                    },
                ];
            }
        });

    }

    function removeJobSurveyData(jobNumber, umr) {
        setSurveyData((prev) => prev.filter((job) => job.umr !== umr && job.jobNumber !== jobNumber));
    }


    const contextValue = {
        jobInfo: jobInfo,
        storeJobInfo: storeJobInfo,
        setValueHandler: setValueHandler,
        removeJobSurveyData: removeJobSurveyData,
        surveyData: surveyData,
    };

    return (
        <SurveyContext.Provider value={contextValue}>
            {children}
        </SurveyContext.Provider>
    );
}

export default SurveyContextProvider;