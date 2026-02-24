import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../src/constants/colors";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>

        <Text style={styles.paragraph}>
          UTARIFY respects your privacy and is committed to protecting your
          personal data. This policy explains how we collect, use, and safeguard
          your information.
        </Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We may collect personal details such as your name, email address, and
          contact information when you register or use our services.
        </Text>

        <Text style={styles.heading}>2. How We Use Information</Text>
        <Text style={styles.paragraph}>
          Your data is used to facilitate lost-and-found reports, improve our
          services, and ensure secure communication between users.
        </Text>

        <Text style={styles.heading}>3. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement security measures to protect your information. However,
          we cannot guarantee complete security of data transmitted over the
          internet.
        </Text>

        <Text style={styles.heading}>4. Sharing of Information</Text>
        <Text style={styles.paragraph}>
          We do not sell your personal data. Limited sharing may occur when
          necessary for dispute resolution or compliance with legal obligations.
        </Text>

        <Text style={styles.heading}>5. Updates to Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. Continued use of
          the app after updates means you accept the changes.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.navy,
    marginBottom: 16,
    textAlign: "center",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.pink,
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 16,
    color: COLORS.grayDark,
    lineHeight: 22,
    marginBottom: 8,
  },
});
