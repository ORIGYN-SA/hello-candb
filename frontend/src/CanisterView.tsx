import * as React from "react";

export default function CanisterView(partitionKey: string, isSelected: boolean) {
  const selectedStyles = isSelected ? "selected-frame" : ""
  return (
    <div className={selectedStyles}>
      <div>{partitionKey}</div>

    </div>
  )
}