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
import * as FileSystem from "expo-file-system";
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
        console.log("📸 Take image handler called");
        setOptionModalVisible(false); // Close the option modal
        
        try {
            const image = await ImagePicker.launchCameraAsync({
                quality: 0.5,
                cameraType: ImagePicker.CameraType.back,
                allowsEditing: false,
                base64: false,
            });
            console.log("📸 Camera result:", image);

            if (!image.canceled) {
                console.log("📸 Image not canceled, processing...");
                processSelectedImage(image);
            } else {
                console.log("❌ Image was canceled");
            }
        } catch (error) {
            console.error("❌ Camera error:", error);
        }
    };

    const pickImageHandler = async () => {
        console.log("🖼️ Pick image handler called");
        setOptionModalVisible(false); // Close the option modal
        
        try {
            const image = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.5,
                allowsEditing: false, // Disable editing
                base64: false,
            });
            console.log("🖼️ Gallery result:", image);

            if (!image.canceled) {
                console.log("🖼️ Image not canceled, processing...");
                processSelectedImage(image);
            } else {
                console.log("❌ Image was canceled");
            }
        } catch (error) {
            console.error("❌ Gallery error:", error);
        }
    };

    const processSelectedImage = async (image) => {
        console.log("🔍 Processing image started");
        console.log("🔍 Full image object:", JSON.stringify(image, null, 2));
        
        // Check if image.assets exists and has content
        if (!image.assets || image.assets.length === 0) {
            console.error("❌ No assets found in image object");
            return;
        }
        
        console.log("🔍 First asset:", JSON.stringify(image.assets[0], null, 2));
        
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

        try {
            const fileName = generateFileName();
            console.log("📝 Generated filename:", fileName);
            
            // For now, let's try without FileSystem first
            console.log("🧪 Testing with original URI first");
            
            const newImageArray = [
                ...imageUri,
                {
                    uri: image.assets[0].uri,
                    fileName: fileName,
                },
            ];
            
            console.log("📷 New image array:", newImageArray);
            setImageUri(newImageArray);
            
            console.log("� Calling setValueHandler...");
            // Immediately update context after adding image
            surveyContext.setValueHandler(
                surveyContext.jobInfo,
                location,
                questionNumber,
                ncSeverity,
                newImageArray,
                questionId,
                "images"
            );
            console.log("✅ setValueHandler completed");

        } catch (err) {
            console.error("❌ Failed to process image:", err);
            console.error("❌ Error details:", err.message);
            console.error("❌ Error stack:", err.stack);
        }
    };

    const showImageOptions = () => {
        console.log("📋 Show image options called");
        setOptionModalVisible(true);
    };

    const deleteImageHandler = async (selectedImage) => {
        const removedImage = imageUri.filter(
            (img) => img.uri !== selectedImage.uri,
        );

        // Remove the physical file if it's in our app directory
        try {
            if (selectedImage.uri.includes(FileSystem.documentDirectory)) {
                await FileSystem.deleteAsync(selectedImage.uri);
                console.log("Deleted file:", selectedImage.uri);
            }
        } catch (err) {
            console.error("Failed to delete file:", err);
        }

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
        console.log("🔄 Loading images from context:", imagesFromContext);
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
                    {console.log("🖼️ Rendering images:", imageUri)}
                    {imageUri &&
                        imageUri.map((image, index) => {
                            console.log(`🖼️ Rendering image ${index}:`, image.uri);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleImagePress(image)}
                                >
                                    <Image
                                        source={{ uri: image.uri }}
                                        style={styles.image}
                                        onError={(error) => {
                                            console.log(`❌ Image load error for ${image.uri}:`, error);
                                        }}
                                        onLoad={() => {
                                            console.log(`✅ Image loaded successfully: ${image.uri}`);
                                        }}
                                    />
                                </TouchableOpacity>
                            );
                        })}
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
                                    onError={(error) => {
                                        console.log('Preview image load error:', error);
                                    }}
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
