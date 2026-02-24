import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../src/constants/colors";

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms of Use</Text>

        <Text style={styles.paragraph}>
          Welcome to UTARIFY. By using our application, you agree to comply with
          and be bound by the following terms and conditions.
        </Text>

        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using UTARIFY, you confirm that you accept these Terms
          of Use and agree to comply with them.
        </Text>

        <Text style={styles.heading}>2. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          Users are responsible for providing accurate information when
          reporting lost or found items and for respectful interaction with
          other users.
        </Text>

        <Text style={styles.heading}>3. Prohibited Activities</Text>
        <Text style={styles.paragraph}>
          You agree not to misuse the platform for fraudulent activities,
          harassment, or posting irrelevant content.
        </Text>

        <Text style={styles.heading}>4. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          UTARIFY is a community-driven platform. We do not guarantee recovery of
          lost items and are not liable for any disputes between users.
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
