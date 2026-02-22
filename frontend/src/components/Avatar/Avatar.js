import React from "react";
import stringToHslColor from "./../../utils/stringToHslColor"

const Avatar = ({ name, src, size = 40 }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    );
  }

  const firstLetter = name?.charAt(0)?.toUpperCase() || "?";
  const bgColor = stringToHslColor(name || "user");

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "bold",
        fontSize: size / 2,
        zIndex : 999
      }}
    >
      {firstLetter}
    </div>
  );
};
 export default Avatar