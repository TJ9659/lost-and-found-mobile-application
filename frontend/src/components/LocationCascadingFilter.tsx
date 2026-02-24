import React from "react";
import DropdownFilter from "./DropdownFilter";

type Props = {
  buildings: string[];
  floorsMap: Record<string, string[]>;
  roomsMap: Record<string, string[]>;
  selectedBuilding: string | null;
  selectedFloor: string | null;
  selectedRoom: string | null;
  onChange: (building: string | null, floor: string | null, room: string | null) => void;
};

export default function LocationCascadingFilter({
  buildings, floorsMap, roomsMap,
  selectedBuilding, selectedFloor, selectedRoom,
  onChange
}: Props) {
  return (
    <>
      {/* Building */}
      <DropdownFilter
        options={buildings}
        selected={selectedBuilding}
        placeholder="Building"
        onSelect={(b) => onChange(selectedBuilding === b ? null : b, null, null)}
      />
      {/* Floor */}
      {selectedBuilding && (
        <DropdownFilter
          options={floorsMap[selectedBuilding]}
          selected={selectedFloor}
          placeholder="Floor"
          onSelect={(f) => onChange(selectedBuilding, selectedFloor === f ? null : f, null)}
        />
      )}
      {/* Room */}
      {selectedBuilding && selectedFloor && (
        <DropdownFilter
          options={roomsMap[`${selectedBuilding}-${selectedFloor}`]}
          selected={selectedRoom}
          placeholder="Room"
          onSelect={(r) => onChange(selectedBuilding, selectedFloor, selectedRoom === r ? null : r)}
        />
      )}
    </>
  );
}
