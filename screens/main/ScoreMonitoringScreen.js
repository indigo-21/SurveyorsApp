import { StyleSheet, View } from "react-native";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";

import ScreenWrapper from "../../components/ScreenWrapper";
import SurveyQuestions from "../../components/SurveyQuestions";
import { SurveyContext } from "../../store/survey-context";
import { getSurveyQuestions } from "../../util/db/surveyQuestions";
import { fetchDataFromDB } from "../../util/database";
import LoadingOverlay from "../../components/LoadingOverlay";

function ScoreMonitoringScreen() {
    const surveyContext = useContext(SurveyContext);
    const [isLoading, setIsLoading] = useState(false);
    const isFocused = useIsFocused();
    const [surveyQuestionList, setSurveyQuestionList] = useState([]);

    useEffect(() => {
        setSurveyQuestionList([]);
        if (isFocused) {
            surveyContext.storeJobInfo({
                surveyType: 1,
            });
        }
    }, [isFocused]);

    useEffect(() => {
        if (isFocused) {
            setIsLoading(true);
            const getSurveyQuestionsQuery = getSurveyQuestions();
            const surveyQuestionsParams = [
                surveyContext.jobInfo.measureCat,
                surveyContext.jobInfo.surveyType,
                surveyContext.jobInfo.surveyQuestionSetId
            ];
            const fetchSurveyQuestions = async () => {
                await fetchDataFromDB(getSurveyQuestionsQuery, surveyQuestionsParams)
                    .then((data) => {
                        setSurveyQuestionList(data);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    })
                    .catch((error) => {
                        console.error("Error fetching survey questions:", error);
                    });
            };

            setTimeout(() => {
                fetchSurveyQuestions();
            }, 200);
        }
    }, [surveyContext.jobInfo, isFocused]);

    if (isLoading) {
        return <LoadingOverlay message="Loading..." />;
    }

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <SurveyQuestions questionSet={surveyQuestionList} />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
    },
});

export default ScoreMonitoringScreen;
