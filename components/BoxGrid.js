import {
    View,
    StyleSheet,
    Pressable,
    ImageBackground,
    Dimensions,
    useWindowDimensions,
} from "react-native";
import Colors from "../constants/Colors";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

function BoxGrid({ image, onPress, children }) {
    const { width, height } = useWindowDimensions();

    // Simple breakpoints for width and height
    const getBoxWidth = () => {
        if (width > 1000) return width * 0.4;
        if (width > 800) return width * 0.35;
        return width * 0.42;
    };

    const getBoxHeight = () => {
        if (height > 1000) return height * 0.23;
        return height * 0.2;
    };

    const getContainerPadding = () => {
        if (width > 1000) return width * 0.05;
        if (width > 800) return width * 0.18;
        return 70;
    };

    return (
        <View
            style={[
                styles.gridItem,
                { width: getBoxWidth(), height: getBoxHeight() },
            ]}
        >
            <Pressable
                android_ripple={{ color: Colors.ripple }}
                onPress={onPress}
                style={({ pressed }) =>
                    pressed
                        ? [styles.pressedItem, styles.button]
                        : styles.button
                }
            >
                <View
                    style={[
                        styles.innerContainer,
                        { paddingTop: getContainerPadding() },
                    ]}
                >
                    {image && (
                        <ImageBackground
                            source={image}
                            style={styles.imageBackground}
                        />
                    )}
                    <View style={styles.textContainer}>{children}</View>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    gridItem: {
        borderRadius: 8,
        elevation: 4,
        shadowColor: "black",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        backgroundColor: Colors.white,
        margin: 8,
    },
    button: {
        flex: 1,
    },
    pressedItem: {
        opacity: 0.75,
        backgroundColor: Colors.ripple,
    },
    innerContainer: {
        flex: 1,
        overflow: "hidden",
        paddingLeft: 16,
        justifyContent: "center",
        position: "relative", // <--- ADD THIS
    },
    imageBackground: {
        position: "absolute",
        width: windowWidth * 0.18,
        height: windowHeight * 0.13,
        opacity: 0.1,
        top: -10,
        right: -10,
        resizeMode: "contain",
    },
    textContainer: {
        flex: 1,
    },
});

export default BoxGrid;
