import React, { useState } from "react";
import {
  Text,
  Image,
  TextInput,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import PTHeader from "./components/PTHeader";

import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";

const LoginForm = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted },
  } = useForm({
    defaultValues: {
      website_login: "",
      password: "",
    },
  });

  const handleLogin = async (data) => {
    try {
      console.log(process.env.EXPO_PUBLIC_IP);
      const response = await axios.post(
        `http://localhost:1433/users/login`,
        {
          website_login: data.website_login.trim(),
          password: data.password.trim(),
        }
      );
      console.log(response.status);
      if (response.status == 401) {
        Alert.alert("Login Failed", response.data.message);
      } else /*if (
        response.data[0].paid == "1" &&
        response.data[0].guest == "0" &&
        response.data[0].end_date > today
      ) */{
        // Store user data in AsyncStorage
        await AsyncStorage.setItem("userId", response.data.user_id.toString());
        router.push({
          pathname: "/club_meeting",
          query: { userId: response.data.user_id },
        });
      }
      /*
      if (res.data[0].end_date < today) {
        const responses = await axios.post("http://localhost:8081/user/guest", {
          user_id: response.data.user_id,
        });*/
        console.log("Server response:", response.data);
        Alert.alert("Login Response", response.data.message);
      } catch (error) {
      if (error.response) {
        console.error("Server error response:", error.response.data);
        Alert.alert(
          "Error",
          error.response.data.message || "An error occurred"
        );
      } else {
        console.error("Network or other error:", error);
        Alert.alert("Error", "Failed to connect to server");
      }
    }
  };

  return (
    <View style={styles.background}>
      <PTHeader></PTHeader>
      <View style={styles.loginContainer}>
        <View style={styles.inputs}>
          {[
            {
              name: "website_login",
              placeholder: "Please enter your login",
              label: "Login",
              autocomplete: "username",
              rule: { required: "You must enter your login" },
              secure:false,
            },
            {
              name: "password",
              placeholder: "Please Enter Your Password",
              label: "Password",
              autocomplete: "current-password",
              rule: { required: "You must enter your password" },
              secure:true,
            },
          ].map(({ name, placeholder, label, autocomplete, rule, secure }) => (
            <View key={name} style={styles.inputGroup}>
              {label && <Text style={styles.label}>{label}</Text>}
              <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    autoComplete={autocomplete}
                    placeholder={placeholder}
                    onChangeText={onChange}
                    secureTextEntry={secure}
                    value={value}
                    autoCapitalize="none"
                  />
                )}
                rules={rule}
              />
              {errors[name] && isSubmitted && (
                <Text style={styles.errorText}>{errors[name].message}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.function}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("./register")}
          >
            <Text>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(handleLogin)}
          >
            <Text>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#AFABA3",
    height: "100%",
  },
  logo: {
    width: 150,
    height: 60,
    marginVertical: 10,
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#FFD347",
    width: 130,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    marginVertical: 10, // Adds top and bottom spacing
    marginHorizontal: 15,
  },
  input: {
    borderWidth: 2,
    borderColor: "#433D33",
    width: "100%",
    height: 50,
    marginTop: "1%",
    paddingLeft: 10,
  },
  inputs: {
    marginHorizontal: 20,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
  },
  loginContainer: {
    backgroundColor: "#F1F6F5",
    borderWidth: 2,
    borderColor: "#433D33",
    marginTop: "20%",
    paddingVertical: "5%",
    marginHorizontal: "5%",
    justifyContent: "center",
  },
  logoContainer: {
    backgroundColor: "#F1F6F5",
  },
  function: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  errorText: {
    color: "red",
  },
});
