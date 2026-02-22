import React from "react";

const CompanyLogo = ({
  src,
  size = 80,
  fallback = "/images/base-logo/base-logo.jpg",
}) => {
  return (
    <img
      src={src || fallback}
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
      alt="Company Logo"
    />
  );
};

export default CompanyLogo;
