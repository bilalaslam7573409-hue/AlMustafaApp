// Card.js
import React from "react";

export default function Card({ children, className = "", sx = {} }) {
  return (
    <div className={`card ${className}`} style={{ padding: 14, ...sx }}>
      {children}
    </div>
  );
}
