import { useContext, useEffect, useState } from "react";
import {
    Button,
    Image,
    StyleSheet,
    View,
    Modal,
    TouchableOpacity,
    Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Colors from "../constants/Colors";
import IconButton from "./IconButton";
import { SurveyContext } from "../store/survey-context";
import CustomButton from "./CustomButton";

function ImageCapture({ questionId, questionNumber, location, ncSeverity }) {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUri, setImageUri] = useState([]);
    const [optionModalVisible, setOptionModalVisible] = useState(false);
    const surveyContext = useContext(SurveyContext);

    const handleImagePress = (image) => {
        setSelectedImage(image);
        setPreviewVisible(true);
    };

    const handleClosePreview = () => {
        setPreviewVisible(false);
        setSelectedImage(null);
    };

    const takeImageHandler = async () => {
        setOptionModalVisible(false); // Close the option modal
        const image = await ImagePicker.launchCameraAsync({
            quality: 0.5,
            cameraType: ImagePicker.CameraType.back,
        });
        console.log(image);

        if (!image.canceled) {
            processSelectedImage(image);
        }
    };

    const pickImageHandler = async () => {
        setOptionModalVisible(false); // Close the option modal
        const image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
            allowsEditing: false, // Disable editing
            allowsMultipleSelection: false, // Single selection only
        });
        console.log(image);

        if (!image.canceled) {
            processSelectedImage(image);
        }
    };

    const processSelectedImage = (image) => {
        // Generate filename if it's null
        const generateFileName = () => {
            if (image.assets[0].fileName) {
                return image.assets[0].fileName;
            }
            // Extract filename from URI or generate timestamp-based name
            const uriParts = image.assets[0].uri.split('/');
            const fileNameFromUri = uriParts[uriParts.length - 1];
            if (fileNameFromUri && fileNameFromUri.includes('.')) {
                return fileNameFromUri;
            }
            // Generate timestamp-based filename
            return `image_${Date.now()}.jpg`;
        };

        const newImageArray = [
            ...imageUri,
            {
                uri: image.assets[0].uri,
                fileName: generateFileName(),
            },
        ];
        setImageUri(newImageArray);

        // Immediately update context after adding image
        surveyContext.setValueHandler(
            surveyContext.jobInfo,
            location,
            questionNumber,
            ncSeverity,
            newImageArray,
            questionId,
            "images",
        );
    };

    const showImageOptions = () => {
        setOptionModalVisible(true);
    };

    const deleteImageHandler = (selectedImage) => {
        const removedImage = imageUri.filter(
            (img) => img.uri !== selectedImage.uri,
        );

        // Remove the selected image from the imageUri state
        setImageUri((prev) =>
            prev.filter((img) => img.uri !== selectedImage.uri),
        );
        // Immediately update context after deleting image
        surveyContext.setValueHandler(
            surveyContext.jobInfo,
            location,
            questionNumber,
            ncSeverity,
            removedImage,
            questionId,
            "images",
        );
        setSelectedImage(null);
        setPreviewVisible(false);
    };

    useEffect(() => {
        // This effect only loads images from context on mount/update
        const imagesFromContext =
            surveyContext.surveyData
                .find(
                    (v) =>
                        v.jobNumber === surveyContext.jobInfo.jobNumber &&
                        v.umr === surveyContext.jobInfo.umr,
                )
                ?.testResult.find(
                    (r) =>
                        r.questionId === questionId &&
                        r.surveyType === surveyContext.jobInfo.surveyType,
                )?.images || [];
        setImageUri(imagesFromContext);
    }, [surveyContext.surveyData, surveyContext.jobInfo, questionId]);

    // console.info(JSON.stringify(surveyContext.surveyData));

    return (
        <View style={styles.container}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <View style={styles.imageContainer}>
                    {imageUri &&
                        imageUri.map((image, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleImagePress(image)}
                            >
                                <Image
                                    source={{ uri: image.uri }}
                                    style={styles.image}
                                />
                            </TouchableOpacity>
                        ))}
                </View>
                <View>
                    <IconButton
                        icon={"camera-alt"}
                        size={30}
                        onPress={showImageOptions}
                        color={Colors.primary}
                    />
                </View>
            </View>
            <Modal
                visible={previewVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        {selectedImage && (
                            <>
                                <Image
                                    source={{ uri: selectedImage.uri }}
                                    style={styles.previewImage}
                                />
                                <View style={styles.buttonContainer}>
                                    <CustomButton
                                        text="Cancel"
                                        importedStyles={{
                                            backgroundColor: Colors.cancel,
                                            color: Colors.white,
                                        }}
                                        onPress={handleClosePreview}
                                    />

                                    <CustomButton
                                        text="Remove"
                                        importedStyles={{
                                            backgroundColor: Colors.primary,
                                            color: Colors.black,
                                        }}
                                        onPress={() =>
                                            deleteImageHandler(selectedImage)
                                        }
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            
            {/* Option Modal for Camera/Gallery Selection */}
            <Modal
                visible={optionModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setOptionModalVisible(false)}
            >
                <View style={styles.optionModalBackground}>
                    <View style={styles.optionModalContainer}>
                        <Text style={styles.optionModalTitle}>Select Image Source</Text>
                        
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={takeImageHandler}
                        >
                            <Text style={styles.optionButtonText}> Take Photo</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={pickImageHandler}
                        >
                            <Text style={styles.optionButtonText}> Choose from Gallery</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.optionButton, styles.cancelButton]}
                            onPress={() => setOptionModalVisible(false)}
                        >
                            <Text style={[styles.optionButtonText, styles.cancelButtonText]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        marginTop: 16,
    },
    image: {
        width: 50,
        height: 70,
        borderRadius: 10,
        marginBottom: 10,
        marginRight: 8,
    },
    imageContainer: {
        flex: 1,
        flexDirection: "row",
        marginBottom: 10,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
    previewImage: {
        width: 400,
        height: 500,
        borderRadius: 15,
        resizeMode: "contain",
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        width: "85%", // Ensures the container spans the full width
    },
    optionModalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    optionModalContainer: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 30,
        minHeight: 250,
    },
    optionModalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: Colors.black,
    },
    optionButton: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: "center",
    },
    optionButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.white,
    },
    cancelButton: {
        backgroundColor: Colors.cancel,
        marginTop: 10,
    },
    cancelButtonText: {
        color: Colors.white,
    },
});

export default ImageCapture;
