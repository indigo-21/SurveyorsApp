import { Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
function IconButton({ icon, size, onPress, color }) {
    return (
        <>
            <Pressable onPress={onPress} >
                <MaterialIcons name={icon} size={size} color={color} />
            </Pressable>
        </>
    );
}

export default IconButton;
