import { FlatList, StyleSheet, Text, View } from "react-native";

import ScreenWrapper from "../components/ScreenWrapper";
import ScreenTitle from "../components/ScreenTitle";
import Colors from "../constants/Colors";

const data = [
    {
        id: "Agility Standard V1",
        name: "Agility_V1_2023_02_03",
        age: "Feb 03, 2023",
    },
    {
        id: "Agility Standard V1-1",
        name: "Agility_V1-1_2023-07-03",
        age: "Dec 03, 2023",
    },
    { id: "GSENZH 2024 V1", name: "GSENZH_V1_2024_08_06", age: "Jan 03, 2023" },
    {
        id: "GSENZH 2024 V1.1",
        name: "GSENZH_V1_2024_09_02",
        age: "Aug 03, 2023",
    },
    {
        id: "GSENZH 2024 V1.2",
        name: "GSENZH_V1_2024_09_06",
        age: "Sep 03, 2023",
    },
];

function QuestionSetScreen() {
    return (
        <ScreenWrapper>
            <ScreenTitle title="List of Question Sets" />
            <View style={styles.container}>
                <View style={styles.row}>
                    <Text style={[styles.cell, styles.header]}>
                        Question Set
                    </Text>
                    <Text style={[styles.cell, styles.header]}>Revision</Text>
                    <Text style={[styles.cell, styles.header]}>
                        Last Update
                    </Text>
                </View>

                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.body}>
                            <Text style={styles.cell}>{item.id}</Text>
                            <Text style={styles.cell}>{item.name}</Text>
                            <Text style={styles.cell}>{item.age}</Text>
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
