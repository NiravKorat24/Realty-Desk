export type UnitOption = {
  label: string;
  value: string;
};

export type FloorOption = {
  label: string;
  value: string;
  units: UnitOption[];
};

export type BuildingOption = {
  label: string;
  value: string;
  floors: FloorOption[];
};

export type ProjectOption = {
  label: string;
  value: string;
  buildings: BuildingOption[];
};

const createUnits = (floor: number): UnitOption[] =>
  [1, 2, 3, 4].map((unit) => ({
    label: `${floor}0${unit}`,
    value: `${floor}0${unit}`
  }));

const createFloors = (count: number): FloorOption[] =>
  Array.from({ length: count }, (_, index) => {
    const floor = index + 1;
    return {
      label: `${floor}${floor === 1 ? "st" : floor === 2 ? "nd" : floor === 3 ? "rd" : "th"} Floor`,
      value: String(floor),
      units: createUnits(floor)
    };
  });

export const projects: ProjectOption[] = [
  {
    label: "Palm Residency",
    value: "palm-residency",
    buildings: [
      { label: "A Wing", value: "a-wing", floors: createFloors(10) },
      { label: "B Wing", value: "b-wing", floors: createFloors(10) }
    ]
  },
  {
    label: "Skyline Heights",
    value: "skyline-heights",
    buildings: [
      { label: "Tower 1", value: "tower-1", floors: createFloors(12) },
      { label: "Tower 2", value: "tower-2", floors: createFloors(12) }
    ]
  }
];
