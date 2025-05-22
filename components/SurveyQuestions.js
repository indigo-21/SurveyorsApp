import { FlatList, StyleSheet, Text, View, TextInput } from "react-native";
import Colors from "../constants/Colors";
import DropDownPicker from "react-native-dropdown-picker";
import { useState } from "react";

const status = [
    { label: "Customer No Show", value: "1" },
    { label: "Customer Cancelled", value: "2" },
    { label: "Customer Required Rebook", value: "3" },
    { label: "Rebook", value: "4" },
];

function SurveyQuestions({ questionSet }) {
    const [open, setOpen] = useState({});
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(status);

    const handleOpen = (id) => {
        setOpen((prevData) => ({ ...prevData, [id]: !prevData[id] }));
    };

    const renderQuestion = ({ item, index }) => (
        <View key={index} style={[styles.container, { zIndex: 1000 - index }]}>
            <View style={styles.row}>
                <Text style={styles.questionText}>Question # </Text>
                <Text style={styles.questionNumber}>
                    {item.question_number}
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.question}>{item.question}</Text>
            </View>
            <View style={[styles.row, { zIndex: 1000 - index, marginTop: 16 }]}>
                <DropDownPicker
                    open={open[index] || false}
                    value={value}
                    items={items}
                    setOpen={() => handleOpen(index)} //item.id
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Select"
                    style={{
                        borderColor: "#ccc",
                        backgroundColor: "#fff",
                        minHeight: 35,
                    }}
                    dropDownContainerStyle={{
                        borderColor: "#ccc",
                        borderRadius: 10,
                        elevation: 10,
                    }}
                    textStyle={{
                        textAlign: "center",
                        fontSize: 16,
                        color: "#333",
                    }}
                    placeholderStyle={{
                        textAlign: "center",
                        color: "gray",
                        fontWeight: "500",
                    }}
                    listItemLabelStyle={{
                        textAlign: "center",
                    }}
                    listItemContainerStyle={{
                        height: 40,
                        justifyContent: "center",
                    }}
                />
            </View>
            <View style={styles.row}>
                <TextInput style={styles.textInput} multiline />
            </View>
        </View>
    );

    return (
        <FlatList
            data={questionSet}
            renderItem={renderQuestion}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
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
});

export default SurveyQuestions;
