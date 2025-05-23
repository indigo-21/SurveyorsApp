import { FlatList, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import ScreenWrapper from "../../components/ScreenWrapper";
import ScreenTitle from "../../components/ScreenTitle";
import Colors from "../../constants/Colors";
import { getSurveyQuestionSets } from "../../util/db/surveyQuestionSets";
import { fetchDataFromDB } from "../../util/database";

function QuestionSetScreen() {
    const [questionSetData, setQuestionSetData] = useState([]);

    useEffect(() => {
        const getQuestionSetQuery = getSurveyQuestionSets();

        const fetchQuestionSet = async () => {
            await fetchDataFromDB(getQuestionSetQuery)
                .then((result) => {
                    if (result) {
                        setQuestionSetData(result);
                        console.log("Question Set Data: ", result);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching question set data: ", error);
                });
        }

        fetchQuestionSet();
    }, []);


    return (
        <ScreenWrapper>
            <ScreenTitle title="List of Question Sets" />
            <View style={styles.container}>
                <View style={styles.row}>
                    <Text style={[styles.cell, styles.header]}>
                        Question Set
                    </Text>
                    <Text style={[styles.cell, styles.header]}>Revision</Text>
                </View>

                <FlatList
                    data={questionSetData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.body}>
                            <Text style={styles.cell}>{item.question_set}</Text>
                            <Text style={styles.cell}>{item.question_revision}</Text>
                        </View>
                    )}
                />
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
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingVertical: 8,
    },
    cell: {
        flex: 1,
        textAlign: "center",
        fontSize: 12,
    },
    header: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 10,
        fontWeight: "bold",
        color: Colors.white,
        alignContent: "center",
        justifyContent: "center",
    },
    body: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingVertical: 15,
    },
});

export default QuestionSetScreen;
