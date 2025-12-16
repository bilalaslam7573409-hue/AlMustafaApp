// PrimaryButton.js
import React from "react";
import Button from "@mui/material/Button";

export default function PrimaryButton({ children, onClick, variant = "contained", sx = {}, ...rest }) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      sx={{
        borderRadius: 12,
        px: 3,
        py: 1,
        boxShadow: "none",
        fontWeight: 700,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}
