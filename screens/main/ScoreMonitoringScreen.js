import { StyleSheet, View } from "react-native";
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import ScreenWrapper from "../../components/ScreenWrapper";
import SurveyQuestions from "../../components/SurveyQuestions";

const questionSet = [
    {
        id: 1,
        question_number: "DP.3",
        question: "Are elements that are treated free from rot, infestation and visible signs of corrosion?",
        can_have_photo: "1",
        na_allowed: "0",
        unable_to_validate: "0",
        remote_reinspection_allowed: "0",
        score_monitoring: "0",
        nc_severity: "0",
        uses_dropdown: "0",
        dropdown_list: null,
        innovation_measure: "0",
    },
    {
        id: 1,
        question_number: "DP.3",
        question: "Are elements that are treated free from rot, infestation and visible signs of corrosion?",
        can_have_photo: "1",
        na_allowed: "0",
        unable_to_validate: "0",
        remote_reinspection_allowed: "0",
        score_monitoring: "0",
        nc_severity: "0",
        uses_dropdown: "0",
        dropdown_list: null,
        innovation_measure: "0",
    },
    {
        id: 1,
        question_number: "DP.3",
        question: "Are elements that are treated free from rot, infestation and visible signs of corrosion?",
        can_have_photo: "1",
        na_allowed: "0",
        unable_to_validate: "0",
        remote_reinspection_allowed: "0",
        score_monitoring: "0",
        nc_severity: "0",
        uses_dropdown: "0",
        dropdown_list: null,
        innovation_measure: "0",
    },
    {
        id: 1,
        question_number: "DP.3",
        question: "Are elements that are treated free from rot, infestation and visible signs of corrosion?",
        can_have_photo: "1",
        na_allowed: "0",
        unable_to_validate: "0",
        remote_reinspection_allowed: "0",
        score_monitoring: "0",
        nc_severity: "0",
        uses_dropdown: "0",
        dropdown_list: null,
        innovation_measure: "0",
    },
    {
        id: 1,
        question_number: "DP.3",
        question: "Are elements that are treated free from rot, infestation and visible signs of corrosion?",
        can_have_photo: "1",
        na_allowed: "0",
        unable_to_validate: "0",
        remote_reinspection_allowed: "0",
        score_monitoring: "0",
        nc_severity: "0",
        uses_dropdown: "0",
        dropdown_list: null,
        innovation_measure: "0",
    },
    {
        id: 1,
        question_number: "DP.3",
        question: "Are elements that are treated free from rot, infestation and visible signs of corrosion?",
        can_have_photo: "1",
        na_allowed: "0",
        unable_to_validate: "0",
        remote_reinspection_allowed: "0",
        score_monitoring: "0",
        nc_severity: "0",
        uses_dropdown: "0",
        dropdown_list: null,
        innovation_measure: "0",
    },
];

function ScoreMonitoringScreen() {

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <SurveyQuestions questionSet={questionSet} />
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
