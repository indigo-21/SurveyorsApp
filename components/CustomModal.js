import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "../constants/Colors";
import { useNavigation } from "@react-navigation/native";

function CustomModal({ setModalVisible, modalVisible, title, subtitle, children }) {
    const navigation = useNavigation();

    return (
        <Modal animationType="fade" transparent={true} visible={modalVisible} >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.titleRow}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <Text style={styles.modalText}>{subtitle}</Text>
                    </View>
                    {children}
                    <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalVisible(!modalVisible)}
                    >
                        <Text style={styles.textStyle}>Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal >
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    modalView: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 20,
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
    },
    button: {
        width: "100%",
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonClose: {
        marginTop: 8,
        backgroundColor: Colors.primary,
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    modalText: {
        textAlign: "center",
    },
    modalTitle: {
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 20,
    },
    titleRow: {
        marginBottom: 8,
    },
});

export default CustomModal;
