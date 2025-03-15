import React from "react";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { StyleSheet } from "react-native";

const toastConfig = {
  // Définition d'un type de toast "bigToast"
  bigToast: ({ text1, text2, ...props }) => (
    <BaseToast
      {...props}
      style={styles.bigToastContainer}
      text1Style={styles.bigToastTitle}
      text2Style={styles.bigToastMessage}
      text1={text1}
      text2={text2}
    />
  ),
};

// Styles personnalisés
const styles = StyleSheet.create({
  bigToastContainer: {
    minHeight: 100,        // Hauteur minimale plus grande
    borderLeftColor: "#FF0000", // Couleur de bordure
    borderLeftWidth: 8,    // Largeur de la bordure
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  bigToastTitle: {
    fontSize: 20,          // Agrandir la taille du titre
    fontWeight: "bold",
  },
  bigToastMessage: {
    fontSize: 16,          // Agrandir la taille du message
  },
});

export default toastConfig;
