import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { CalendarList } from "react-native-calendars";
import Colors from "../../constants/Colors";

function CalendarScreen() {
    const [modalVisible, setModalVisible] = useState(false);

    const modalhandler = (day) => {
        console.log("Pressed date:", day.dateString);
        setModalVisible(true);
    };

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <Pressable
                    style={styles.modalContainer}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Hello World!</Text>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.textStyle}>Hide Modal</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
            <CalendarList
                scrollEnabled
                removeClippedSubviews={true}
                initialNumToRender={1}
                maxToRenderPerBatch={2}
                windowSize={5}
                onDayPress={(day) => {
                    modalhandler(day);
                }}
                theme={{
                    todayTextColor: "#00adf5",
                    selectedDayBackgroundColor: "#00adf5",
                    selectedDayTextColor: "#fff",
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    modalView: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "100%",
        height: "80%",
        bottom: 0,
        position: "absolute",
    },
});

export default CalendarScreen;
