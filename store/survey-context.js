import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const SurveyContext = createContext({
    jobInfo: {
        measureId: 0,
        surveyQuestionSetId: 0,
        schemeId: 0,
        info: "",
        description: "",
        shortName: "",
        jobId: 0,
        jobNumber: 0,
        surveyType: 1,
        measureCat: "",
        umr: "",
        surveys: [],
    },
    surveyData: [],
    storeJobInfo: (data) => { },
    setValueHandler: (surveyData, value, id, option) => { },
});

function SurveyContextProvider({ children }) {
    const [jobInfo, setJobInfo] = useState([]);
    const [surveyData, setSurveyData] = useState([]);

    useEffect(() => {
        const loadStoredSurveyData = async () => {
            try {
                const storedData = await AsyncStorage.getItem("surveyData");
                if (storedData !== null) {
                    setSurveyData(JSON.parse(storedData));
                }

                // await AsyncStorage.removeItem("surveyData");
            } catch (e) {
                console.error("Failed to load survey data", e);
            }
        };
        loadStoredSurveyData();
    }, []);

    useEffect(() => {
        const saveSurveyData = async () => {
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

    function setValueHandler(surveyData, value, id, option) {
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


    const contextValue = {
        jobInfo: jobInfo,
        storeJobInfo: storeJobInfo,
        setValueHandler: setValueHandler,
        surveyData: surveyData,
    };

    return (
        <SurveyContext.Provider value={contextValue}>
            {children}
        </SurveyContext.Provider>
    );
}

export default SurveyContextProvider;