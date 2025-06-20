import { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, TextInput } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import * as Location from "expo-location";

import Colors from "../constants/Colors";
import { SurveyContext } from "../store/survey-context";
import ImageCapture from "./ImageCapture";

function SurveyQuestions({ questionSet }) {
    const surveyContext = useContext(SurveyContext);
    const [location, setLocation] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(
                location.coords.latitude + ", " + location.coords.longitude,
            );
        })();
    }, []);

    const setValueHandler = (value, questionNumber, ncSeverity, id, option) => {
        surveyContext.setValueHandler(
            surveyContext.jobInfo,
            location,
            questionNumber,
            ncSeverity,
            value,
            id,
            option,
        );
    };

    // console.log(location);

    // console.info(JSON.stringify(surveyContext.surveyData));

    const renderQuestion = ({ item }) => {
        const status = [
            { label: "Passed", value: "Passed" },
            { label: "Non-Compliant", value: "Non-Compliant" },
        ];

        if (item.unable_to_validate_allowed) {
            status.push({
                label: "Unable to Validate",
                value: "Unable to Validate",
            });
        }

        if (item.na_allowed) {
            status.push({ label: "N/A", value: "N/A" });
        }

        const testResult = surveyContext.surveyData
            ?.find(
                (v) =>
                    v.jobNumber === surveyContext.jobInfo.jobNumber &&
                    v.umr === surveyContext.jobInfo.umr,
            )
            ?.testResult?.find(
                (r) =>
                    r.questionId === item.id &&
                    r.surveyType === surveyContext.jobInfo.surveyType,
            );

        return (
            <View key={item.id} style={styles.container}>
                <View style={styles.row}>
                    <Text style={styles.questionText}>Question # </Text>
                    <Text style={styles.questionNumber}>
                        {item.question_number}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.question}>{item.question}</Text>
                </View>
                <View style={[styles.row, { marginTop: 16 }]}>
                    <Dropdown
                        data={status}
                        labelField="label"
                        valueField="value"
                        value={testResult?.result || null}
                        style={styles.dropdown}
                        placeholder="Select"
                        onChange={(value) => {
                            setValueHandler(
                                value.value,
                                item.question_number,
                                item.nc_severity,
                                item.id,
                                "result",
                            );
                        }}
                    />
                </View>
                <View style={styles.row}>
                    <TextInput
                        style={styles.textInput}
                        multiline
                        value={testResult?.comment || null}
                        autoFocus={false}
                        onChangeText={(value) =>
                            setValueHandler(
                                value,
                                item.question_number,
                                item.nc_severity,
                                item.id,
                                "comment",
                            )
                        }
                    />
                </View>
                <View style={styles.row}>
                    {testResult?.result && (
                        <ImageCapture
                            questionId={item.id}
                            questionNumber={item.question_number}
                            location={location}
                            ncSeverity={item.nc_severity}
                        />
                    )}
                </View>
            </View>
        );
    };

    return (
        <FlatList
            data={questionSet}
            renderItem={renderQuestion}
            keyExtractor={(item, index) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        />
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        margin: 8,
        backgroundColor: Colors.white,
        borderRadius: 8,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 16,
        color: "#000",
        fontWeight: "600",
    },
    questionText: {
        fontSize: 10,
        color: Colors.cancel,
        fontStyle: "italic",
        marginRight: 4,
    },
    questionNumber: {
        fontSize: 14,
        color: Colors.primary,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    question: {
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
        padding: 2,
    },
    textInput: {
        height: 60,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop: 8,
        width: "100%",
        color: Colors.black,
        padding: 10,
    },
    dropdown: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        width: "100%",
        padding: 10,
    },
});

export default SurveyQuestions;
