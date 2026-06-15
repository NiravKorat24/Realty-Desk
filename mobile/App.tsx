import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { projects } from "./src/data/projects";
import { colors } from "./src/theme/colors";
import { API_BASE_URL } from "./src/theme/config";

type ProfileSummary = {
  _id: string;
  projectName: string;
  buildingName: string;
  floorLabel: string;
  unitNumber: string;
  buyerName: string;
  mobileNumber: string;
  email?: string;
  status?: string;
  notes?: string;
};

type ProfileDetail = ProfileSummary & {
  alternateMobile?: string;
  address?: string;
  governmentId?: string;
  budget?: string;
  source?: string;
  documents: Array<{
    title: string;
    type?: string;
    url?: string;
    notes?: string;
    addedAt: string;
  }>;
};

type SelectCardProps = {
  title: string;
  value?: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  disabled?: boolean;
};

const emptyForm = {
  buyerName: "",
  mobileNumber: "",
  email: "",
  notes: ""
};

const emptyDetailForm = {
  alternateMobile: "",
  address: "",
  governmentId: "",
  budget: "",
  source: "",
  notes: ""
};

const emptyDocumentForm = {
  title: "",
  type: "",
  url: "",
  notes: ""
};

function SelectCard({ title, value, options, onSelect, disabled }: SelectCardProps) {
  return (
    <View style={[styles.card, disabled && styles.cardDisabled]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionWrap}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionButton, selected && styles.optionButtonSelected]}
              onPress={() => onSelect(option.value)}
              disabled={disabled}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function App() {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [form, setForm] = useState(emptyForm);
  const [detailForm, setDetailForm] = useState(emptyDetailForm);
  const [documentForm, setDocumentForm] = useState(emptyDocumentForm);
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileDetail | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingDocument, setSavingDocument] = useState(false);

  const projectOptions = projects.map(({ label, value }) => ({ label, value }));
  const project = projects.find((item) => item.value === selectedProject);
  const buildingOptions =
    project?.buildings.map(({ label, value }) => ({ label, value })) ?? [];
  const building = project?.buildings.find((item) => item.value === selectedBuilding);
  const floorOptions =
    building?.floors.map(({ label, value }) => ({ label, value })) ?? [];
  const floor = building?.floors.find((item) => item.value === selectedFloor);
  const unitOptions = floor?.units ?? [];

  const canSaveProfile = useMemo(() => {
    return (
      selectedProject &&
      selectedBuilding &&
      selectedFloor &&
      selectedUnit &&
      form.buyerName.trim() &&
      form.mobileNumber.trim()
    );
  }, [form.buyerName, form.mobileNumber, selectedBuilding, selectedFloor, selectedProject, selectedUnit]);

  const fetchProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const response = await fetch(`${API_BASE_URL}/profiles`);
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      Alert.alert("Connection issue", "Could not load profiles. Check API URL and server.");
    } finally {
      setLoadingProfiles(false);
    }
  };

  const fetchProfileDetail = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${id}`);
      const data = await response.json();
      setSelectedProfile(data);
      setDetailForm({
        alternateMobile: data.alternateMobile ?? "",
        address: data.address ?? "",
        governmentId: data.governmentId ?? "",
        budget: data.budget ?? "",
        source: data.source ?? "",
        notes: data.notes ?? ""
      });
    } catch (error) {
      Alert.alert("Connection issue", "Could not load profile details.");
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const resetSelectionFlow = () => {
    setSelectedProject("");
    setSelectedBuilding("");
    setSelectedFloor("");
    setSelectedUnit("");
    setForm(emptyForm);
  };

  const createProfile = async () => {
    if (!canSaveProfile || !project || !building || !floor) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.value,
          projectName: project.label,
          buildingId: building.value,
          buildingName: building.label,
          floorNumber: Number(floor.value),
          floorLabel: floor.label,
          unitNumber: selectedUnit,
          buyerName: form.buyerName.trim(),
          mobileNumber: form.mobileNumber.trim(),
          email: form.email.trim(),
          notes: form.notes.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      const data = await response.json();
      Alert.alert("Saved", "Buyer mini profile created successfully.");
      resetSelectionFlow();
      fetchProfiles();
      fetchProfileDetail(data._id);
    } catch (error) {
      Alert.alert("Save failed", "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const saveMoreDetails = async () => {
    if (!selectedProfile) {
      return;
    }

    try {
      setSavingDetails(true);
      const response = await fetch(`${API_BASE_URL}/profiles/${selectedProfile._id}/details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detailForm)
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      await fetchProfileDetail(selectedProfile._id);
      fetchProfiles();
      Alert.alert("Updated", "Profile details saved.");
    } catch (error) {
      Alert.alert("Update failed", "Could not save more details.");
    } finally {
      setSavingDetails(false);
    }
  };

  const addDocument = async () => {
    if (!selectedProfile || !documentForm.title.trim()) {
      return;
    }

    try {
      setSavingDocument(true);
      const response = await fetch(`${API_BASE_URL}/profiles/${selectedProfile._id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: documentForm.title.trim(),
          type: documentForm.type.trim(),
          url: documentForm.url.trim(),
          notes: documentForm.notes.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to add document");
      }

      setDocumentForm(emptyDocumentForm);
      await fetchProfileDetail(selectedProfile._id);
      Alert.alert("Added", "Document details added.");
    } catch (error) {
      Alert.alert("Failed", "Could not add document.");
    } finally {
      setSavingDocument(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Real Estate Inventory</Text>
          <Text style={styles.title}>Buyer profile manager</Text>
          <Text style={styles.subtitle}>
            Select inventory, save buyer info, and manage profile details with a clean minimal flow.
          </Text>
        </View>

        <SelectCard
          title="1. Select Project"
          value={selectedProject}
          options={projectOptions}
          onSelect={(value) => {
            setSelectedProject(value);
            setSelectedBuilding("");
            setSelectedFloor("");
            setSelectedUnit("");
          }}
        />

        <SelectCard
          title="2. Select Building"
          value={selectedBuilding}
          options={buildingOptions}
          onSelect={(value) => {
            setSelectedBuilding(value);
            setSelectedFloor("");
            setSelectedUnit("");
          }}
          disabled={!selectedProject}
        />

        <SelectCard
          title="3. Select Floor"
          value={selectedFloor}
          options={floorOptions}
          onSelect={(value) => {
            setSelectedFloor(value);
            setSelectedUnit("");
          }}
          disabled={!selectedBuilding}
        />

        <SelectCard
          title="4. Select Unit"
          value={selectedUnit}
          options={unitOptions}
          onSelect={setSelectedUnit}
          disabled={!selectedFloor}
        />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>5. Buyer Mini Profile</Text>
          <TextInput
            style={styles.input}
            placeholder="Buyer name"
            placeholderTextColor={colors.textSoft}
            value={form.buyerName}
            onChangeText={(value) => setForm((current) => ({ ...current, buyerName: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile number"
            placeholderTextColor={colors.textSoft}
            keyboardType="phone-pad"
            value={form.mobileNumber}
            onChangeText={(value) => setForm((current) => ({ ...current, mobileNumber: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSoft}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notes"
            placeholderTextColor={colors.textSoft}
            multiline
            value={form.notes}
            onChangeText={(value) => setForm((current) => ({ ...current, notes: value }))}
          />

          <TouchableOpacity
            style={[styles.primaryButton, (!canSaveProfile || saving) && styles.primaryButtonDisabled]}
            onPress={createProfile}
            disabled={!canSaveProfile || saving}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? "Saving..." : "Save Buyer Profile"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Saved Profiles</Text>
            <TouchableOpacity style={styles.inlineButton} onPress={fetchProfiles}>
              <Text style={styles.inlineButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {loadingProfiles ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <FlatList
              data={profiles}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.profileItem}
                  onPress={() => fetchProfileDetail(item._id)}
                >
                  <Text style={styles.profileTitle}>{item.buyerName}</Text>
                  <Text style={styles.profileMeta}>
                    {item.projectName} | {item.buildingName} | {item.unitNumber}
                  </Text>
                  <Text style={styles.profileMeta}>{item.mobileNumber}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No profiles added yet.</Text>}
            />
          )}
        </View>

        {selectedProfile ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Open Profile</Text>
            <Text style={styles.detailHeading}>{selectedProfile.buyerName}</Text>
            <Text style={styles.profileMeta}>
              {selectedProfile.projectName} | {selectedProfile.buildingName} | {selectedProfile.floorLabel} |{" "}
              {selectedProfile.unitNumber}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Alternate mobile"
              placeholderTextColor={colors.textSoft}
              value={detailForm.alternateMobile}
              onChangeText={(value) =>
                setDetailForm((current) => ({ ...current, alternateMobile: value }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor={colors.textSoft}
              value={detailForm.address}
              onChangeText={(value) => setDetailForm((current) => ({ ...current, address: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Government ID"
              placeholderTextColor={colors.textSoft}
              value={detailForm.governmentId}
              onChangeText={(value) =>
                setDetailForm((current) => ({ ...current, governmentId: value }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Budget"
              placeholderTextColor={colors.textSoft}
              value={detailForm.budget}
              onChangeText={(value) => setDetailForm((current) => ({ ...current, budget: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Lead source"
              placeholderTextColor={colors.textSoft}
              value={detailForm.source}
              onChangeText={(value) => setDetailForm((current) => ({ ...current, source: value }))}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="More notes"
              placeholderTextColor={colors.textSoft}
              multiline
              value={detailForm.notes}
              onChangeText={(value) => setDetailForm((current) => ({ ...current, notes: value }))}
            />

            <TouchableOpacity
              style={[styles.primaryButton, savingDetails && styles.primaryButtonDisabled]}
              onPress={saveMoreDetails}
              disabled={savingDetails}
            >
              <Text style={styles.primaryButtonText}>
                {savingDetails ? "Saving..." : "Save More Details"}
              </Text>
            </TouchableOpacity>

            <View style={styles.separatorLarge} />

            <Text style={styles.sectionTitle}>Add Document</Text>
            <TextInput
              style={styles.input}
              placeholder="Document title"
              placeholderTextColor={colors.textSoft}
              value={documentForm.title}
              onChangeText={(value) => setDocumentForm((current) => ({ ...current, title: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Document type"
              placeholderTextColor={colors.textSoft}
              value={documentForm.type}
              onChangeText={(value) => setDocumentForm((current) => ({ ...current, type: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Document URL"
              placeholderTextColor={colors.textSoft}
              autoCapitalize="none"
              value={documentForm.url}
              onChangeText={(value) => setDocumentForm((current) => ({ ...current, url: value }))}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Document notes"
              placeholderTextColor={colors.textSoft}
              multiline
              value={documentForm.notes}
              onChangeText={(value) => setDocumentForm((current) => ({ ...current, notes: value }))}
            />

            <TouchableOpacity
              style={[styles.primaryButton, savingDocument && styles.primaryButtonDisabled]}
              onPress={addDocument}
              disabled={savingDocument}
            >
              <Text style={styles.primaryButtonText}>
                {savingDocument ? "Adding..." : "Add Document"}
              </Text>
            </TouchableOpacity>

            <View style={styles.separatorLarge} />

            <Text style={styles.sectionTitle}>Documents</Text>
            {selectedProfile.documents.length === 0 ? (
              <Text style={styles.emptyText}>No documents added yet.</Text>
            ) : (
              selectedProfile.documents.map((document, index) => (
                <View key={`${document.title}-${index}`} style={styles.documentItem}>
                  <Text style={styles.profileTitle}>{document.title}</Text>
                  <Text style={styles.profileMeta}>
                    {[document.type, document.url].filter(Boolean).join(" | ")}
                  </Text>
                  {document.notes ? <Text style={styles.profileMeta}>{document.notes}</Text> : null}
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: 18,
    paddingBottom: 48
  },
  hero: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 24,
    padding: 22,
    marginBottom: 16
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 8
  },
  subtitle: {
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16
  },
  cardDisabled: {
    opacity: 0.55
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  optionButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  optionButtonSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  optionText: {
    color: colors.text,
    fontWeight: "600"
  },
  optionTextSelected: {
    color: colors.primary
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top"
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center"
  },
  primaryButtonDisabled: {
    opacity: 0.6
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700"
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  inlineButton: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
  },
  inlineButtonText: {
    color: colors.primary,
    fontWeight: "700"
  },
  separator: {
    height: 10
  },
  separatorLarge: {
    height: 18
  },
  profileItem: {
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: 14
  },
  profileTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16
  },
  profileMeta: {
    color: colors.textSoft,
    marginTop: 4,
    lineHeight: 20
  },
  emptyText: {
    color: colors.textSoft
  },
  detailHeading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4
  },
  documentItem: {
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10
  }
});

export default App;
