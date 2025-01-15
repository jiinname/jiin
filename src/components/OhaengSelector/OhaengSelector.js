import React from "react";
import "./OhaengSelector.css";

const OhaengSelector = ({ selectedOhaeng, onSelectionChange }) => {
  const ohaengItems = [
    { id: "木", label: "목(木)", color: "#007bff" },
    { id: "火", label: "화(火)", color: "#ff4d4d" },
    { id: "土", label: "토(土)", color: "#ffa500" },
    { id: "金", label: "금(金)", color: "#d3d3d3" },
    { id: "水", label: "수(水)", color: "#000000" },
  ];

  const handleSelect = (id) => {
    const newSelection = selectedOhaeng.includes(id)
      ? selectedOhaeng.filter((item) => item !== id)
      : [...selectedOhaeng, id];

    onSelectionChange(newSelection);
  };

  return (
    <div className="ohaeng-container">
      <h3>부족한 오행 선택</h3>
      <div className="ohaeng-cards">
        {ohaengItems.map((item) => (
          <div
            key={item.id}
            className={`ohaeng-card ${
              selectedOhaeng.includes(item.id) ? "selected" : ""
            }`}
            onClick={() => handleSelect(item.id)}
            style={{
              backgroundColor: selectedOhaeng.includes(item.id)
                ? item.color
                : "#ffffff",
              color: selectedOhaeng.includes(item.id) ? "#ffffff" : "#000000",
              borderColor: item.color,
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OhaengSelector;
