import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Text,
  View,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import PTHeader from "./components/PTHeader";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PORT = 8081;

const Profile = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [profiles, setProfiles] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `http://localhost:1433/profile/${userId}`
        );
        setProfiles(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, [userId]);
  return (
    <View style={styles.background}>
      <PTHeader button={false}/>
      <ScrollView>
        <View style={styles.title}>
          <Text style={styles.titleText}>
            {profiles.first_name} {profiles.last_name}
          </Text>
        </View>
        <View style={styles.information}>
          <Text style={styles.infoText}>Member_id: {profiles.user_id}</Text>
          <Text style={styles.infoText}>Email: {profiles.email}</Text>
          <Text style={styles.infoText}>
            Phone Number: {profiles.phone_number}
          </Text>
          <Text style={styles.infoText}>
            Join_Date: {new Date(profiles.join_date).toLocaleDateString()}
          </Text>
          <Text style={styles.infoText}>Address: {profiles.address}</Text>
          <Text style={styles.infoText}>Interests: {profiles.interests}</Text>
          <Text style={styles.infoText}>
            Date of Birth: {new Date(profiles.dob).toLocaleDateString()}
          </Text>
          <Text style={styles.infoText}>Pronouns: {profiles.pronouns}</Text>
          <Text style={styles.infoText}>Postcode: {profiles.postcode}</Text>
          <Text style={styles.infoText}>
            Privacy:{" "}
            {profiles.private
              ? "Personal Info Private"
              : "Personal Info Public"}
          </Text>
          <Text style={styles.infoText}>
            Marketing: {profiles.want_marketing ? "Opted In" : "Opted Out"}
          </Text>
          
          <View style={styles.function}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/club_meeting",
                query: { user_Id: userId },
              })
            }
          >
            <Text>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/editProfile",
                query: { user_Id: userId },
              })
            }
          >
            <Text>Edit Profile</Text>
          </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#AFABA3",
    height: "100%",
  },
  title: {
    padding: 10,
    backgroundColor: "#8A7D6A",
  },
  information: {
    padding: 10,
    backgroundColor: "#F1F6F5",
  },
  infoText: {
    fontSize: 20,
    marginBottom: 5,
  },
  container: {
    padding: 20,
    alignItems: "flex-start",
  },
  button: {
    backgroundColor: "#FFD347",
    width: 130,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    marginVertical: 10, // Adds top and bottom spacing
    marginRight: 30,
  },
  function: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  titleText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },
});
