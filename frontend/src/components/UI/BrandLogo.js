// BrandLogo.js
import React from "react";

export default function BrandLogo({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Al Mustafa Logo">
      <rect width="64" height="64" rx="12" fill="#0b3d0b"/>
      <path d="M32 12 L40 28 L24 28 Z" fill="#d4af37"/>
      <circle cx="32" cy="40" r="8" fill="#d4af37"/>
    </svg>
  );
}
