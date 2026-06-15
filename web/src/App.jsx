import { useEffect, useMemo, useState } from "react";
import { cloneProjects } from "./data/projects";
import { API_BASE_URL } from "./theme/config";
import logo from "./logo.png";

const emptyForm = {
  buyerName: "",
  mobileNumber: "",
  email: "",
  aadhaarNumber: "",
  panNumber: "",
  notes: ""
};

const emptyDetailForm = {
  alternateMobile: "",
  address: "",
  governmentId: "",
  aadhaarNumber: "",
  panNumber: "",
  budget: "",
  source: "",
  notes: "",
  status: "booked"
};

const emptyDocumentForm = {
  title: "",
  type: "",
  url: "",
  notes: ""
};

const emptyInventoryForm = {
  projectName: "",
  buildingName: "",
  floorNumber: "",
  unitList: "",
  singleUnit: ""
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getFloorLabel = (floor) => {
  const number = Number(floor);
  const suffix =
    number === 1 ? "st" : number === 2 ? "nd" : number === 3 ? "rd" : "th";

  return `${number}${suffix} Floor`;
};

const createDefaultUnits = (floor) =>
  [1, 2, 3, 4].map((unit) => ({
    label: `${floor}0${unit}`,
    value: `${floor}0${unit}`
  }));

function OptionGroup({
  title,
  value,
  options,
  onSelect,
  onClear,
  onRemove,
  disabled,
  customOptionClass,
  customOptionTooltip
}) {
  return (
    <section className={`panel ${disabled ? "panel-disabled" : ""}`}>
      <div className="panel-header panel-inline panel-actions">
        <h2>
          {title.includes("Project") && (
            <svg style={{ marginRight: "8px" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M3 7v14M21 7v14M6 10h3v3H6zM15 10h3v3h-3zM9 17h6v4H9zM3 7l9-4 9 4" />
            </svg>
          )}
          {title.includes("Building") && (
            <svg style={{ marginRight: "8px" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="9" y1="22" x2="9" y2="16" />
              <line x1="15" y1="22" x2="15" y2="16" />
              <line x1="9" y1="16" x2="15" y2="16" />
              <path d="M8 6h2v2H8zm6 0h2v2h-2zm-6 5h2v2H8zm6 0h2v2h-2z" />
            </svg>
          )}
          {title.includes("Floor") && (
            <svg style={{ marginRight: "8px" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
          {title.includes("Unit") && (
            <svg style={{ marginRight: "8px" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
            </svg>
          )}
          {title}
        </h2>
        <div className="action-row">
          {value ? (
            <button type="button" className="ghost-button" onClick={onClear} disabled={disabled}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear
            </button>
          ) : null}
          {value ? (
            <button type="button" className="danger-button" onClick={onRemove} disabled={disabled}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <div className="chip-grid">
        {options.map((option) => {
          const selected = option.value === value;
          const optClass = customOptionClass ? customOptionClass(option) : "";
          const isBooked = optClass.includes("booked");
          
          const btnClass = `chip ${selected ? "chip-active" : ""} ${optClass}`;
          const tooltip = customOptionTooltip ? customOptionTooltip(option) : "";

          const buttonEl = (
            <button
              key={option.value}
              type="button"
              className={btnClass}
              onClick={() => onSelect(option.value)}
              disabled={disabled || (isBooked && !selected)}
            >
              {isBooked && (
                <svg style={{ marginRight: "4px" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
              {option.label}
            </button>
          );

          if (tooltip) {
            return (
              <div key={option.value} className="tooltip-container">
                {buttonEl}
                <span className="tooltip-text">{tooltip}</span>
              </div>
            );
          }

          return buttonEl;
        })}
      </div>
    </section>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

function AreaField({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea {...props} />
    </label>
  );
}

export default function App() {
  const [inventory, setInventory] = useState(() => {
    try {
      const savedInventory = window.localStorage.getItem("enventory-inventory");
      return savedInventory ? JSON.parse(savedInventory) : cloneProjects();
    } catch {
      return cloneProjects();
    }
  });
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [detailForm, setDetailForm] = useState(emptyDetailForm);
  const [documentForm, setDocumentForm] = useState(emptyDocumentForm);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingDocument, setSavingDocument] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [inventoryForm, setInventoryForm] = useState(emptyInventoryForm);
  const [activeTab, setActiveTab] = useState("wizard");
  const [wizardStep, setWizardStep] = useState(0);
  const [isProjectPopupOpen, setIsProjectPopupOpen] = useState(false);
  const [searchBuilding, setSearchBuilding] = useState("");
  const [searchUnit, setSearchUnit] = useState("");

  const [inventoryLoaded, setInventoryLoaded] = useState(false);

  const saveInventoryToDb = async (newInventory) => {
    try {
      await fetch(`${API_BASE_URL}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: newInventory })
      });
    } catch (error) {
      console.error("Could not save inventory to database", error);
    }
  };

  // Fetch inventory from MongoDB on mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/inventory`);
        if (!response.ok) {
          throw new Error();
        }
        const data = await response.json();
        if (data && data.length > 0) {
          setInventory(data);
        } else {
          // If empty in DB, initialize with local storage or defaults
          const localInv = window.localStorage.getItem("enventory-inventory");
          const initialData = localInv ? JSON.parse(localInv) : cloneProjects();
          setInventory(initialData);
          await saveInventoryToDb(initialData);
        }
      } catch {
        const localInv = window.localStorage.getItem("enventory-inventory");
        if (localInv) {
          setInventory(JSON.parse(localInv));
        }
      } finally {
        setInventoryLoaded(true);
      }
    };

    fetchInventory();
  }, []);

  // Save changes to localStorage and MongoDB
  useEffect(() => {
    window.localStorage.setItem("enventory-inventory", JSON.stringify(inventory));
    if (inventoryLoaded) {
      saveInventoryToDb(inventory);
    }
  }, [inventory, inventoryLoaded]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchBuilding = !searchBuilding || (p.buildingName || "").toLowerCase().includes(searchBuilding.toLowerCase());
      const matchUnit = !searchUnit || (p.unitNumber || "").toLowerCase().includes(searchUnit.toLowerCase());
      return matchBuilding && matchUnit;
    });
  }, [profiles, searchBuilding, searchUnit]);

  const projectOptions = inventory.map(({ label, value }) => ({ label, value }));
  const project = inventory.find((item) => item.value === selectedProject);
  const buildingOptions =
    project?.buildings.map(({ label, value }) => ({ label, value })) ?? [];
  const building = project?.buildings.find((item) => item.value === selectedBuilding);
  const floorOptions =
    building?.floors.map(({ label, value }) => ({ label, value })) ?? [];
  const floor = building?.floors.find((item) => item.value === selectedFloor);
  const unitOptions = floor?.units ?? [];

  const canSaveProfile = useMemo(
    () =>
      Boolean(
        selectedProject &&
          selectedBuilding &&
          selectedFloor &&
          selectedUnit &&
          form.buyerName.trim() &&
          form.mobileNumber.trim()
      ),
    [form.buyerName, form.mobileNumber, selectedBuilding, selectedFloor, selectedProject, selectedUnit]
  );

  const fetchProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const response = await fetch(`${API_BASE_URL}/profiles`);
      const data = await response.json();
      setProfiles(data);
      setStatusMessage("");
    } catch {
      setStatusMessage("Could not load profiles. Check backend server.");
    } finally {
      setLoadingProfiles(false);
    }
  };

  const fetchProfileDetail = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${id}`);
      const data = await response.json();
      setSelectedProfile(data);
      setDetailForm({
        alternateMobile: data.alternateMobile ?? "",
        address: data.address ?? "",
        governmentId: data.governmentId ?? "",
        aadhaarNumber: data.aadhaarNumber ?? "",
        panNumber: data.panNumber ?? "",
        budget: data.budget ?? "",
        source: data.source ?? "",
        notes: data.notes ?? "",
        status: data.status ?? "booked"
      });
      setStatusMessage("");
    } catch {
      setStatusMessage("Could not load profile details.");
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const clearProjectSelection = () => {
    setSelectedProject("");
    setSelectedBuilding("");
    setSelectedFloor("");
    setSelectedUnit("");
  };

  const clearBuildingSelection = () => {
    setSelectedBuilding("");
    setSelectedFloor("");
    setSelectedUnit("");
  };

  const clearFloorSelection = () => {
    setSelectedFloor("");
    setSelectedUnit("");
  };

  const clearUnitSelection = () => {
    setSelectedUnit("");
  };

  const removeSelectedProjectOption = () => {
    if (!selectedProject) {
      return;
    }

    setInventory((current) => current.filter((item) => item.value !== selectedProject));
    clearProjectSelection();
    setStatusMessage("Selected project option removed.");
  };

  const removeSelectedBuildingOption = () => {
    if (!selectedProject || !selectedBuilding) {
      return;
    }

    setInventory((current) =>
      current.map((item) =>
        item.value === selectedProject
          ? {
              ...item,
              buildings: item.buildings.filter((buildingItem) => buildingItem.value !== selectedBuilding)
            }
          : item
      )
    );
    clearBuildingSelection();
    setStatusMessage("Selected building option removed.");
  };

  const removeSelectedFloorOption = () => {
    if (!selectedProject || !selectedBuilding || !selectedFloor) {
      return;
    }

    setInventory((current) =>
      current.map((item) =>
        item.value === selectedProject
          ? {
              ...item,
              buildings: item.buildings.map((buildingItem) =>
                buildingItem.value === selectedBuilding
                  ? {
                      ...buildingItem,
                      floors: buildingItem.floors.filter((floorItem) => floorItem.value !== selectedFloor)
                    }
                  : buildingItem
              )
            }
          : item
      )
    );
    clearFloorSelection();
    setStatusMessage("Selected floor option removed.");
  };

  const removeSelectedUnitOption = () => {
    if (!selectedProject || !selectedBuilding || !selectedFloor || !selectedUnit) {
      return;
    }

    setInventory((current) =>
      current.map((item) =>
        item.value === selectedProject
          ? {
              ...item,
              buildings: item.buildings.map((buildingItem) =>
                buildingItem.value === selectedBuilding
                  ? {
                      ...buildingItem,
                      floors: buildingItem.floors.map((floorItem) =>
                        floorItem.value === selectedFloor
                          ? {
                              ...floorItem,
                              units: floorItem.units.filter((unitItem) => unitItem.value !== selectedUnit)
                            }
                          : floorItem
                      )
                    }
                  : buildingItem
              )
            }
          : item
      )
    );
    clearUnitSelection();
    setStatusMessage("Selected unit option removed.");
  };

  const resetSelectionFlow = () => {
    clearProjectSelection();
    setForm(emptyForm);
    setWizardStep(0);
  };

  const deleteProject = (projectValue) => {
    setInventory((current) => current.filter((item) => item.value !== projectValue));
    if (selectedProject === projectValue) {
      clearProjectSelection();
      setWizardStep(0);
    }
    setStatusMessage("Project deleted.");
  };

  const deleteBuilding = (projectValue, buildingValue) => {
    setInventory((current) =>
      current.map((item) =>
        item.value === projectValue
          ? {
              ...item,
              buildings: item.buildings.filter((b) => b.value !== buildingValue)
            }
          : item
      )
    );
    if (selectedBuilding === buildingValue) {
      clearBuildingSelection();
      setWizardStep(1);
    }
    setStatusMessage("Building deleted.");
  };

  const deleteFloor = (projectValue, buildingValue, floorValue) => {
    setInventory((current) =>
      current.map((item) =>
        item.value === projectValue
          ? {
              ...item,
              buildings: item.buildings.map((b) =>
                b.value === buildingValue
                  ? {
                      ...b,
                      floors: b.floors.filter((f) => f.value !== floorValue)
                    }
                  : b
              )
            }
          : item
      )
    );
    if (selectedFloor === floorValue) {
      clearFloorSelection();
      setWizardStep(2);
    }
    setStatusMessage("Floor deleted.");
  };

  const deleteUnit = (projectValue, buildingValue, floorValue, unitValue) => {
    setInventory((current) =>
      current.map((item) =>
        item.value === projectValue
          ? {
              ...item,
              buildings: item.buildings.map((b) =>
                b.value === buildingValue
                  ? {
                      ...b,
                      floors: b.floors.map((f) =>
                        f.value === floorValue
                          ? {
                              ...f,
                              units: f.units.filter((u) => u.value !== unitValue)
                            }
                          : f
                      )
                    }
                  : b
              )
            }
          : item
      )
    );
    if (selectedUnit === unitValue) {
      clearUnitSelection();
      setWizardStep(3);
    }
    setStatusMessage("Flat deleted.");
  };

  const addProjectOption = () => {
    const projectName = inventoryForm.projectName.trim();

    if (!projectName) {
      setStatusMessage("Enter a project name first.");
      return;
    }

    const projectValue = slugify(projectName);
    if (!projectValue) {
      setStatusMessage("Project name is not valid.");
      return;
    }

    if (inventory.some((item) => item.value === projectValue)) {
      setStatusMessage("A project with this name already exists.");
      return;
    }

    setInventory((current) => [
      ...current,
      {
        label: projectName,
        value: projectValue,
        buildings: []
      }
    ]);
    setInventoryForm((current) => ({ ...current, projectName: "" }));
    setStatusMessage("Project added.");
  };

  const addBuildingOption = () => {
    const buildingName = inventoryForm.buildingName.trim();

    if (!selectedProject) {
      setStatusMessage("Select a project before adding a building.");
      return;
    }

    if (!buildingName) {
      setStatusMessage("Enter a building name first.");
      return;
    }

    const buildingValue = slugify(buildingName);
    if (!buildingValue) {
      setStatusMessage("Building name is not valid.");
      return;
    }

    const exists = project?.buildings.some((item) => item.value === buildingValue);
    if (exists) {
      setStatusMessage("A building with this name already exists in this project.");
      return;
    }

    setInventory((current) =>
      current.map((item) =>
        item.value === selectedProject
          ? {
              ...item,
              buildings: [...item.buildings, { label: buildingName, value: buildingValue, floors: [] }]
            }
          : item
      )
    );
    setInventoryForm((current) => ({ ...current, buildingName: "" }));
    setStatusMessage("Building added.");
  };

  const addFloorOption = () => {
    const floorNumber = Number(inventoryForm.floorNumber);

    if (!selectedProject || !selectedBuilding) {
      setStatusMessage("Select a project and building before adding a floor.");
      return;
    }

    if (!Number.isInteger(floorNumber) || floorNumber < 1) {
      setStatusMessage("Enter a valid floor number.");
      return;
    }

    const unitListStr = inventoryForm.unitList.trim();

    setInventory((current) =>
      current.map((projectItem) => {
        if (projectItem.value !== selectedProject) {
          return projectItem;
        }

        return {
          ...projectItem,
          buildings: projectItem.buildings.map((buildingItem) => {
            if (buildingItem.value !== selectedBuilding) {
              return buildingItem;
            }

            let newFloors = [...buildingItem.floors];

            if (unitListStr) {
              // Add single floor with custom units
              const floorValue = String(floorNumber);
              const existingFloor = newFloors.some((item) => item.value === floorValue);
              if (existingFloor) {
                setStatusMessage(`Floor ${floorNumber} already exists in the selected building.`);
                return buildingItem;
              }
              const manualUnits = unitListStr
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .map((item) => ({ label: item, value: item }));

              newFloors.push({
                label: getFloorLabel(floorNumber),
                value: floorValue,
                units: manualUnits.length > 0 ? manualUnits : createDefaultUnits(floorNumber)
              });
              setStatusMessage("Floor added.");
            } else {
              // Automatically add all floors from 1 up to floorNumber
              let addedCount = 0;
              for (let f = 1; f <= floorNumber; f++) {
                const floorValue = String(f);
                if (!newFloors.some((item) => item.value === floorValue)) {
                  newFloors.push({
                    label: getFloorLabel(f),
                    value: floorValue,
                    units: createDefaultUnits(f)
                  });
                  addedCount++;
                }
              }
              if (addedCount === 0) {
                setStatusMessage(`All floors up to ${floorNumber} already exist in the selected building.`);
                return buildingItem;
              }
              setStatusMessage(`Floors up to ${floorNumber} added.`);
            }

            // Sort floors numerically
            newFloors.sort((a, b) => Number(a.value) - Number(b.value));

            return {
              ...buildingItem,
              floors: newFloors
            };
          })
        };
      })
    );

    setInventoryForm((current) => ({ ...current, floorNumber: "", unitList: "" }));
  };

  const addUnitOption = () => {
    const singleUnit = inventoryForm.singleUnit.trim();

    if (!selectedProject || !selectedBuilding || !selectedFloor) {
      setStatusMessage("Select a project, building, and floor before adding a unit.");
      return;
    }

    if (!singleUnit) {
      setStatusMessage("Enter a unit number first.");
      return;
    }

    const exists = floor?.units.some((item) => item.value === singleUnit);
    if (exists) {
      setStatusMessage("This unit already exists on the selected floor.");
      return;
    }

    setInventory((current) =>
      current.map((projectItem) =>
        projectItem.value === selectedProject
          ? {
              ...projectItem,
              buildings: projectItem.buildings.map((buildingItem) =>
                buildingItem.value === selectedBuilding
                  ? {
                      ...buildingItem,
                      floors: buildingItem.floors.map((floorItem) =>
                        floorItem.value === selectedFloor
                          ? {
                              ...floorItem,
                              units: [...floorItem.units, { label: singleUnit, value: singleUnit }]
                            }
                          : floorItem
                      )
                    }
                  : buildingItem
              )
            }
          : projectItem
      )
    );
    setInventoryForm((current) => ({ ...current, singleUnit: "" }));
    setStatusMessage("Unit added.");
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
          aadhaarNumber: form.aadhaarNumber.trim(),
          panNumber: form.panNumber.trim(),
          notes: form.notes.trim(),
          status: "booked"
        })
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      resetSelectionFlow();
      fetchProfiles();
      fetchProfileDetail(data._id);
      setStatusMessage("Buyer mini profile created.");
    } catch {
      setStatusMessage("Profile could not be saved.");
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
        throw new Error();
      }

      await fetchProfileDetail(selectedProfile._id);
      fetchProfiles();
      setStatusMessage("Profile details saved.");
    } catch {
      setStatusMessage("Could not save more details.");
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
        throw new Error();
      }

      setDocumentForm(emptyDocumentForm);
      await fetchProfileDetail(selectedProfile._id);
      setStatusMessage("Document details added.");
    } catch {
      setStatusMessage("Could not add document.");
    } finally {
      setSavingDocument(false);
    }
  };

  const uploadDocumentFromDevice = async () => {
    if (!selectedProfile || !documentFile) {
      return;
    }

    try {
      setUploadingDocument(true);
      const payload = new FormData();
      payload.append("document", documentFile);
      payload.append("title", documentForm.title.trim());
      payload.append("type", documentForm.type.trim());
      payload.append("notes", documentForm.notes.trim());

      const response = await fetch(`${API_BASE_URL}/profiles/${selectedProfile._id}/documents/upload`, {
        method: "POST",
        body: payload
      });

      if (!response.ok) {
        throw new Error();
      }

      setDocumentForm(emptyDocumentForm);
      setDocumentFile(null);
      await fetchProfileDetail(selectedProfile._id);
      setStatusMessage("Document uploaded from device.");
    } catch {
      setStatusMessage("Could not upload document from device.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const deleteProfile = async () => {
    if (!selectedProfile) {
      return;
    }

    const confirmed = window.confirm(`Delete profile for ${selectedProfile.buyerName}?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${selectedProfile._id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error();
      }

      setSelectedProfile(null);
      setDetailForm(emptyDetailForm);
      setDocumentForm(emptyDocumentForm);
      setDocumentFile(null);
      await fetchProfiles();
      setStatusMessage("Profile removed.");
    } catch {
      setStatusMessage("Could not remove profile.");
    }
  };

  const getDocumentHref = (url) => {
    if (!url) {
      return "";
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    const origin = API_BASE_URL.replace(/\/api$/, "");
    return `${origin}${url}`;
  };

  return (
    <main className="page-shell">
      <header className="app-header">
        <div className="header-logo-group">
          <img src={logo} alt="Silvassa Group Logo" className="app-logo-img" />
          <div>
            <span className="app-brand-name">Realty Desk</span>
            <span className="app-brand-sub">by Silvassa Group</span>
          </div>
        </div>
      </header>

      {/* Booking Wizard Tab */}
      {activeTab === "wizard" && (
        <div className="wizard-container">
          {/* Step 0: Selection Start */}
          {wizardStep === 0 && (
            <div className="wizard-card wizard-home">
              <div className="wizard-home-icon" style={{ background: "transparent", width: "90px", height: "90px", padding: 0, boxShadow: "none" }}>
                <img src={logo} alt="Silvassa Group Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <h3>Start Flat Booking</h3>
              <p>Allocate properties and log buyer credentials step-by-step.</p>
              
              <button
                type="button"
                className="primary-button wide-button"
                onClick={() => setIsProjectPopupOpen(true)}
                style={{ marginTop: "8px", minHeight: "44px" }}
              >
                Choose Project to Start
              </button>

              {/* Bottom Sheet Popup for Projects */}
              {isProjectPopupOpen && (
                <div className="modal-overlay" onClick={() => setIsProjectPopupOpen(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h4 className="modal-title">Select Project</h4>
                      <button
                        type="button"
                        className="modal-close-btn"
                        onClick={() => setIsProjectPopupOpen(false)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    <div className="modal-option-list">
                      {projectOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className="modal-option-btn"
                          onClick={() => {
                            setSelectedProject(opt.value);
                            clearBuildingSelection();
                            setIsProjectPopupOpen(false);
                            setWizardStep(1);
                          }}
                        >
                          <span>{opt.label}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      ))}
                      {projectOptions.length === 0 && (
                        <p className="muted" style={{ textAlign: "center", padding: "12px" }}>No projects configured yet. Go to Setup tab first.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Select Building */}
          {wizardStep === 1 && (
            <div className="wizard-card">
              <div className="wizard-header">
                <button
                  type="button"
                  className="wizard-back-btn"
                  onClick={() => {
                    setSelectedProject("");
                    setWizardStep(0);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <h3 className="wizard-title">Select Building ({project?.label})</h3>
              </div>
              <div className="chip-grid">
                {buildingOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="chip"
                    onClick={() => {
                      setSelectedBuilding(opt.value);
                      clearFloorSelection();
                      setWizardStep(2);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
                {buildingOptions.length === 0 && (
                  <p className="muted">No buildings added in this project.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Select Floor */}
          {wizardStep === 2 && (
            <div className="wizard-card">
              <div className="wizard-header">
                <button
                  type="button"
                  className="wizard-back-btn"
                  onClick={() => {
                    setSelectedBuilding("");
                    setWizardStep(1);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <h3 className="wizard-title">Select Floor ({building?.label})</h3>
              </div>
              <div className="chip-grid">
                {floorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="chip"
                    onClick={() => {
                      setSelectedFloor(opt.value);
                      clearUnitSelection();
                      setWizardStep(3);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
                {floorOptions.length === 0 && (
                  <p className="muted">No floors configured in this building.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Select Flat */}
          {wizardStep === 3 && (
            <div className="wizard-card">
              <div className="wizard-header">
                <button
                  type="button"
                  className="wizard-back-btn"
                  onClick={() => {
                    setSelectedFloor("");
                    setWizardStep(2);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <h3 className="wizard-title">Select Flat ({floor?.label})</h3>
              </div>
              <OptionGroup
                title="Available & Booked Flats"
                value={selectedUnit}
                options={unitOptions}
                onClear={clearUnitSelection}
                onRemove={removeSelectedUnitOption}
                onSelect={(value) => {
                  setSelectedUnit(value);
                  const matchedProfile = profiles.find(
                    (p) =>
                      p.projectId === selectedProject &&
                      p.buildingId === selectedBuilding &&
                      String(p.floorNumber) === String(selectedFloor) &&
                      p.unitNumber === value
                  );
                  if (matchedProfile) {
                    fetchProfileDetail(matchedProfile._id);
                    setActiveTab("profiles");
                  } else {
                    setForm(emptyForm);
                    setWizardStep(4);
                  }
                }}
                disabled={false}
                customOptionClass={(option) => {
                  const isBooked = profiles.some(
                    (p) =>
                      p.projectId === selectedProject &&
                      p.buildingId === selectedBuilding &&
                      String(p.floorNumber) === String(selectedFloor) &&
                      p.unitNumber === option.value
                  );
                  return isBooked ? "chip-unit-booked" : "";
                }}
                customOptionTooltip={(option) => {
                  const matched = profiles.find(
                    (p) =>
                      p.projectId === selectedProject &&
                      p.buildingId === selectedBuilding &&
                      String(p.floorNumber) === String(selectedFloor) &&
                      p.unitNumber === option.value
                  );
                  return matched ? `Booked by ${matched.buyerName}` : "Flat is vacant";
                }}
              />
            </div>
          )}

          {/* Step 4: Buyer Booking Form */}
          {wizardStep === 4 && (
            <div className="wizard-card">
              <div className="wizard-header">
                <button
                  type="button"
                  className="wizard-back-btn"
                  onClick={() => {
                    setSelectedUnit("");
                    setWizardStep(3);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <h3 className="wizard-title">Flat {selectedUnit} Booking</h3>
              </div>
              
              <div className="form-grid">
                <Field
                  label="Buyer Name"
                  placeholder="Enter buyer name"
                  value={form.buyerName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, buyerName: event.target.value }))
                  }
                />
                <Field
                  label="Mobile Number"
                  placeholder="Enter mobile number"
                  value={form.mobileNumber}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, mobileNumber: event.target.value }))
                  }
                />
                <Field
                  label="Email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
                <Field
                  label="Aadhaar Card No"
                  placeholder="Enter 12-digit Aadhaar"
                  value={form.aadhaarNumber}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, aadhaarNumber: event.target.value }))
                  }
                />
                <Field
                  label="PAN No"
                  placeholder="Enter 10-digit PAN"
                  value={form.panNumber}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, panNumber: event.target.value }))
                  }
                />
              </div>

              <AreaField
                label="Notes"
                placeholder="Add booking notes"
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
              />

              <button
                type="button"
                className="primary-button wide-button"
                onClick={createProfile}
                disabled={!canSaveProfile || saving}
                style={{ minHeight: "44px" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                {saving ? "Saving..." : "Confirm Booking"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profiles Tab */}
      {activeTab === "profiles" && (
        <div className="wizard-container">
          {!selectedProfile ? (
            <div className="wizard-card">
              <div className="panel-header panel-inline">
                <h2>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--color-emerald-600)", marginRight: "8px", verticalAlign: "middle" }}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Saved Profiles</span>
                </h2>
                <button type="button" className="secondary-button" onClick={fetchProfiles}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                  </svg>
                  Refresh
                </button>
              </div>

              {loadingProfiles ? <p className="muted">Loading profiles...</p> : null}

              {!loadingProfiles && profiles.length > 0 && (
                <div className="search-filters-row">
                  <input
                    type="text"
                    placeholder="Search by Building..."
                    value={searchBuilding}
                    onChange={(e) => setSearchBuilding(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Search by Flat No..."
                    value={searchUnit}
                    onChange={(e) => setSearchUnit(e.target.value)}
                  />
                </div>
              )}

              {!loadingProfiles && profiles.length === 0 ? (
                <p className="muted">No profiles added yet.</p>
              ) : null}

              {!loadingProfiles && profiles.length > 0 && filteredProfiles.length === 0 ? (
                <p className="muted">No profiles match your search criteria.</p>
              ) : null}

              <div className="profile-list">
                {filteredProfiles.map((profile) => {
                  const statusClass = (profile.status || "booked").toLowerCase().replace(/\s+/g, "-");
                  return (
                    <button
                      key={profile._id}
                      type="button"
                      className="profile-card"
                      onClick={() => fetchProfileDetail(profile._id)}
                    >
                      <div className="profile-card-header" style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                        <strong>{profile.buyerName}</strong>
                        <span className={`status-badge status-${statusClass}`}>
                          {profile.status || "booked"}
                        </span>
                      </div>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M3 21h18M3 7v14M21 7v14M6 10h3v3H6zM15 10h3v3h-3zM9 17h6v4H9zM3 7l9-4 9 4"/>
                        </svg>
                        {profile.projectName} • {profile.buildingName} • Unit {profile.unitNumber}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {profile.mobileNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="wizard-card">
              <div className="wizard-header">
                <button
                  type="button"
                  className="wizard-back-btn"
                  onClick={() => setSelectedProfile(null)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <h3 className="wizard-title">Profile Folders</h3>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.05rem" }}>{selectedProfile.buyerName}</h4>
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.8rem" }}>
                    {selectedProfile.projectName} • {selectedProfile.buildingName} • Unit {selectedProfile.unitNumber}
                  </p>
                </div>
                <span className="status-badge status-booked">Booked</span>
              </div>

              <button
                type="button"
                className="danger-button wide-button"
                onClick={deleteProfile}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete Profile
              </button>

              <div className="form-grid">
                <Field
                  label="Alternate Mobile"
                  placeholder="Alternate number"
                  value={detailForm.alternateMobile}
                  onChange={(event) =>
                    setDetailForm((current) => ({
                      ...current,
                      alternateMobile: event.target.value
                    }))
                  }
                />
                <Field
                  label="Government ID"
                  placeholder="PAN / Aadhaar"
                  value={detailForm.governmentId}
                  onChange={(event) =>
                    setDetailForm((current) => ({
                      ...current,
                      governmentId: event.target.value
                    }))
                  }
                />
                <Field
                  label="Aadhaar Card No"
                  placeholder="Aadhaar number"
                  value={detailForm.aadhaarNumber}
                  onChange={(event) =>
                    setDetailForm((current) => ({
                      ...current,
                      aadhaarNumber: event.target.value
                    }))
                  }
                />
                <Field
                  label="PAN No"
                  placeholder="PAN number"
                  value={detailForm.panNumber}
                  onChange={(event) =>
                    setDetailForm((current) => ({
                      ...current,
                      panNumber: event.target.value
                    }))
                  }
                />
                <Field
                  label="Budget"
                  placeholder="Budget capacity"
                  value={detailForm.budget}
                  onChange={(event) =>
                    setDetailForm((current) => ({ ...current, budget: event.target.value }))
                  }
                />
                <Field
                  label="Lead Source"
                  placeholder="Broker/Direct"
                  value={detailForm.source}
                  onChange={(event) =>
                    setDetailForm((current) => ({ ...current, source: event.target.value }))
                  }
                />
              </div>

              <AreaField
                label="Address"
                placeholder="Buyer address"
                value={detailForm.address}
                onChange={(event) =>
                  setDetailForm((current) => ({ ...current, address: event.target.value }))
                }
              />

              <AreaField
                label="More Notes"
                placeholder="Detailed notes"
                value={detailForm.notes}
                onChange={(event) =>
                  setDetailForm((current) => ({ ...current, notes: event.target.value }))
                }
              />

              <button
                type="button"
                className="primary-button wide-button"
                onClick={saveMoreDetails}
                disabled={savingDetails}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Details
              </button>

              <div className="divider" />

              <div className="panel-header">
                <h2>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--color-emerald-600)", marginRight: "8px", verticalAlign: "middle" }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <span style={{ verticalAlign: "middle" }}>Add Document</span>
                </h2>
              </div>
              
              <div className="form-grid">
                <Field
                  label="Document Title"
                  placeholder="Agreement copy"
                  value={documentForm.title}
                  onChange={(event) =>
                    setDocumentForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
                <Field
                  label="Document Type"
                  placeholder="PDF / Image"
                  value={documentForm.type}
                  onChange={(event) =>
                    setDocumentForm((current) => ({ ...current, type: event.target.value }))
                  }
                />
                <Field
                  label="Document URL"
                  placeholder="URL link"
                  value={documentForm.url}
                  onChange={(event) =>
                    setDocumentForm((current) => ({ ...current, url: event.target.value }))
                  }
                />
              </div>

              <div className="field">
                <span>Upload from device</span>
                <div className="file-upload-wrapper">
                  <svg className="file-upload-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="file-upload-text">
                    <strong>Click to select file</strong>
                  </div>
                  <input
                    type="file"
                    onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
                  />
                  {documentFile ? (
                    <div className="file-upload-selected">{documentFile.name}</div>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                className="secondary-button wide-button"
                onClick={addDocument}
                disabled={savingDocument}
                style={{ marginBottom: "8px" }}
              >
                Add Document Link
              </button>

              <button
                type="button"
                className="primary-button wide-button"
                onClick={uploadDocumentFromDevice}
                disabled={uploadingDocument || !documentFile}
              >
                Upload File
              </button>

              <div className="divider" />

              <div className="panel-header">
                <h2>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--color-emerald-600)", marginRight: "8px", verticalAlign: "middle" }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span style={{ verticalAlign: "middle" }}>Documents</span>
                </h2>
              </div>
              
              <div className="document-list">
                {selectedProfile.documents.length === 0 ? (
                  <p className="muted">No documents added yet.</p>
                ) : (
                  selectedProfile.documents.map((doc, idx) => (
                    <article key={idx} className="document-card">
                      <strong>{doc.title}</strong>
                      <span style={{ fontSize: "0.78rem" }}>{[doc.type, doc.url ? "Link" : "Uploaded"].filter(Boolean).join(" • ")}</span>
                      {doc.url ? (
                        <a
                          className="document-link"
                          href={getDocumentHref(doc.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Document
                        </a>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Property Setup Manager Tab */}
      {activeTab === "setup" && (
        <div className="wizard-card setup-container">
          <div className="setup-section-header">
            <h2>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--color-emerald-600)", marginRight: "8px", verticalAlign: "middle" }}>
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span style={{ verticalAlign: "middle" }}>Property Inventory Setup</span>
            </h2>
            <p className="muted">Construct or delete your real estate catalog nodes.</p>
          </div>

          {/* Tier 1: Projects */}
          <div className="tree-node">
            <div className="tree-node-header">
              <span className="tree-node-title">1. Projects</span>
            </div>
            <div className="tree-node-content">
              <div className="setup-creator-card">
                <span className="setup-creator-title">Add New Project</span>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <Field
                      label="Project Name"
                      placeholder="e.g. Palm Residency"
                      value={inventoryForm.projectName}
                      onChange={(event) =>
                        setInventoryForm((current) => ({ ...current, projectName: event.target.value }))
                      }
                    />
                  </div>
                  <button type="button" className="primary-button" onClick={addProjectOption} style={{ height: "46px", marginBottom: "8px" }}>
                    Add
                  </button>
                </div>
              </div>
              <div className="tree-list">
                {inventory.map((proj) => (
                  <div key={proj.value} className="tree-item">
                    <span className="tree-item-name" style={{ color: selectedProject === proj.value ? "var(--color-emerald-700)" : "" }}>
                      {proj.label} {selectedProject === proj.value ? "• (Active Selection)" : ""}
                    </span>
                    <div className="tree-node-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setSelectedProject(proj.value);
                          clearBuildingSelection();
                        }}
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                      >
                        Manage
                      </button>
                      <button
                        type="button"
                        className="tree-item-delete-btn"
                        onClick={() => deleteProject(proj.value)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tier 2: Buildings */}
          {selectedProject && (
            <div className="tree-node">
              <div className="tree-node-header">
                <span className="tree-node-title">2. Buildings in {project?.label}</span>
              </div>
              <div className="tree-node-content">
                <div className="setup-creator-card">
                  <span className="setup-creator-title">Add New Building</span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <Field
                        label="Building/Wing Name"
                        placeholder="e.g. A Wing"
                        value={inventoryForm.buildingName}
                        onChange={(event) =>
                          setInventoryForm((current) => ({ ...current, buildingName: event.target.value }))
                        }
                      />
                    </div>
                    <button type="button" className="primary-button" onClick={addBuildingOption} style={{ height: "46px", marginBottom: "8px" }}>
                      Add
                    </button>
                  </div>
                </div>
                <div className="tree-list">
                  {buildingOptions.map((bld) => (
                    <div key={bld.value} className="tree-item">
                      <span className="tree-item-name" style={{ color: selectedBuilding === bld.value ? "var(--color-emerald-700)" : "" }}>
                        {bld.label} {selectedBuilding === bld.value ? "• (Active Selection)" : ""}
                      </span>
                      <div className="tree-node-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            setSelectedBuilding(bld.value);
                            clearFloorSelection();
                          }}
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          className="tree-item-delete-btn"
                          onClick={() => deleteBuilding(selectedProject, bld.value)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tier 3: Floors */}
          {selectedBuilding && (
            <div className="tree-node">
              <div className="tree-node-header">
                <span className="tree-node-title">3. Floors in {building?.label}</span>
              </div>
              <div className="tree-node-content">
                <div className="setup-creator-card">
                  <span className="setup-creator-title">Add New Floor</span>
                  <div className="form-grid">
                    <Field
                      label="Floor Number"
                      placeholder="e.g. 5"
                      value={inventoryForm.floorNumber}
                      onChange={(event) =>
                        setInventoryForm((current) => ({ ...current, floorNumber: event.target.value }))
                      }
                    />
                    <Field
                      label="Flats List (comma separated, optional)"
                      placeholder="e.g. 501, 502, 503"
                      value={inventoryForm.unitList}
                      onChange={(event) =>
                        setInventoryForm((current) => ({ ...current, unitList: event.target.value }))
                      }
                    />
                  </div>
                  <button type="button" className="primary-button wide-button" onClick={addFloorOption} style={{ marginTop: "12px" }}>
                    Add Floor Node
                  </button>
                </div>
                <div className="tree-list">
                  {floorOptions.map((flr) => (
                    <div key={flr.value} className="tree-item">
                      <span className="tree-item-name" style={{ color: selectedFloor === flr.value ? "var(--color-emerald-700)" : "" }}>
                        {flr.label} {selectedFloor === flr.value ? "• (Active Selection)" : ""}
                      </span>
                      <div className="tree-node-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            setSelectedFloor(flr.value);
                            clearUnitSelection();
                          }}
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          className="tree-item-delete-btn"
                          onClick={() => deleteFloor(selectedProject, selectedBuilding, flr.value)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tier 4: Flats */}
          {selectedFloor && (
            <div className="tree-node">
              <div className="tree-node-header">
                <span className="tree-node-title">4. Flats/Plots on {floor?.label}</span>
              </div>
              <div className="tree-node-content">
                <div className="setup-creator-card">
                  <span className="setup-creator-title">Add Single Flat</span>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <Field
                        label="Flat/Plot Number"
                        placeholder="e.g. 505"
                        value={inventoryForm.singleUnit}
                        onChange={(event) =>
                          setInventoryForm((current) => ({ ...current, singleUnit: event.target.value }))
                        }
                      />
                    </div>
                    <button type="button" className="primary-button" onClick={addUnitOption} style={{ height: "46px", marginBottom: "8px" }}>
                      Add
                    </button>
                  </div>
                </div>
                <div className="tree-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "8px" }}>
                  {unitOptions.map((unt) => (
                    <div key={unt.value} className="tree-item" style={{ padding: "6px 10px" }}>
                      <span className="tree-item-name">{unt.label}</span>
                      <button
                        type="button"
                        className="tree-item-delete-btn"
                        onClick={() => deleteUnit(selectedProject, selectedBuilding, selectedFloor, unt.value)}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Mobile Tab Bar */}
      <nav className="bottom-nav">
        <button
          type="button"
          className={`nav-item ${activeTab === "wizard" ? "active" : ""}`}
          onClick={() => setActiveTab("wizard")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
          <span className="nav-item-label">Booking</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === "profiles" ? "active" : ""}`}
          onClick={() => setActiveTab("profiles")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="nav-item-label">Profiles</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === "setup" ? "active" : ""}`}
          onClick={() => setActiveTab("setup")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="nav-item-label">Setup</span>
        </button>
      </nav>
    </main>
  );
}
