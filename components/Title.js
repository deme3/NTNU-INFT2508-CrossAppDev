import { Text } from "react-native";

export default function Title(props) {
  return <Text style={[{
    fontSize: 32,
    fontWeight: "bold",
    paddingTop: 16,
    paddingHorizontal: 16
  }, props.style]}>{props.children}</Text>
}