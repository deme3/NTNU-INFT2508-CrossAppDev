import { Platform } from "react-native";

const Globals = {
  serverAddress: (Platform.OS === "android" ? "10.0.2.2" : "localhost"),
  serverPort: 3000
};

export default Globals;