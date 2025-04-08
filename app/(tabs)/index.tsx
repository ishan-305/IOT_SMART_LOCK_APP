import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";

const SERVER_URL = "http://192.168.1.12:3000";

export default function App() {
  const [image, setImage] = useState(null);
  const [lockState, setLockState] = useState("lock");
  const [loading, setLoading] = useState(false);

  const fetchImage = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_URL}/image`);
      setImage(res.data.image);
    } catch (err) {
      console.error("Failed to fetch image:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLockState = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/lock-state`);
      setLockState(res.data);
    } catch (err) {
      console.error("Failed to fetch lock state:", err);
    }
  };

  const toggleLock = async () => {
    const newState = lockState === "lock" ? "unlock" : "lock";
    try {
      await axios.post(`${SERVER_URL}/toggle-lock`, { state: newState });
      setLockState(newState);
    } catch (err) {
      console.error("Failed to toggle lock state:", err);
    }
  };

  useEffect(() => {
    fetchImage();
    fetchLockState();

    // Optional: refresh every 10 seconds
    const interval = setInterval(() => {
      fetchImage();
      fetchLockState();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Smart Door Lock</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : image ? (
        <Image
          source={{ uri: `data:image/png;base64,${image}` }}
          style={styles.image}
        />
      ) : (
        <Text>No Image Available</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={fetchImage}>
        <Text style={styles.buttonText}>🔄 Refresh Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          lockState === "lock" ? styles.locked : styles.unlocked,
        ]}
        onPress={toggleLock}
      >
        <Text style={styles.buttonText}>
          {lockState === "lock"
            ? "🔒 Locked (Tap to Unlock)"
            : "🔓 Unlocked (Tap to Lock)"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    minHeight: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 220,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  locked: {
    backgroundColor: "#d9534f",
  },
  unlocked: {
    backgroundColor: "#5cb85c",
  },
});
