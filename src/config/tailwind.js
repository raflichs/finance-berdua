    if (location.protocol !== "file:") {
      document.getElementById("app-manifest")?.setAttribute("href", "manifest.json");
    }

    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "on-secondary-fixed": "#1a1b1f",
            "tertiary-container": "#00a73e",
            "on-tertiary-fixed-variant": "#00531a",
            "background": "#0C0C0E",
            "on-secondary": "#2f3034",
            "on-background": "#e0e2ed",
            "error-container": "#93000a",
            "primary": "#aac7ff",
            "primary-fixed-dim": "#aac7ff",
            "surface-bright": "#363941",
            "on-primary": "#003064",
            "outline": "#8b91a0",
            "on-surface": "#e0e2ed",
            "tertiary-fixed": "#6cff82",
            "inverse-surface": "#e0e2ed",
            "on-tertiary-fixed": "#002106",
            "on-error-container": "#ffdad6",
            "surface-tint": "#aac7ff",
            "tertiary-fixed-dim": "#47e266",
            "on-surface-variant": "#c0c6d6",
            "surface-variant": "#31353d",
            "inverse-on-surface": "#2d3038",
            "on-primary-container": "#002957",
            "surface-dim": "#10131b",
            "secondary-fixed-dim": "#c6c6cb",
            "error": "#ffb4ab",
            "secondary-container": "#46464b",
            "inverse-primary": "#005db8",
            "surface": "#10131b",
            "surface-container-highest": "#31353d",
            "on-error": "#690005",
            "on-tertiary-container": "#00320d",
            "on-primary-fixed-variant": "#00468d",
            "tertiary": "#47e266",
            "secondary-fixed": "#e3e2e7",
            "surface-container-lowest": "#0b0e15",
            "on-secondary-container": "#b5b4ba",
            "secondary": "#c6c6cb",
            "surface-container-low": "#181c23",
            "outline-variant": "#414754",
            "primary-fixed": "#d6e3ff",
            "on-tertiary": "#003910",
            "surface-container-high": "#262a32",
            "on-primary-fixed": "#001b3e",
            "on-secondary-fixed-variant": "#46464b",
            "primary-container": "#3e90ff",
            "surface-container": "#1c2027"
          },
          borderRadius: {
            DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", "2xl": "1.5rem", full: "9999px"
          },
          spacing: {
            "margin-mobile": "16px", md: "16px", base: "4px", sm: "12px", xs: "8px",
            "margin-desktop": "48px", lg: "24px", gutter: "16px", xl: "32px"
          },
          fontFamily: {
            "display-currency": ["Inter", "sans-serif"],
            "label-caps": ["Inter", "sans-serif"],
            "body-lg": ["Inter", "sans-serif"],
            "display-currency-mobile": ["Inter", "sans-serif"],
            "headline-md": ["Inter", "sans-serif"],
            "headline-lg": ["Inter", "sans-serif"],
            "body-sm": ["Inter", "sans-serif"],
            "headline-md-mobile": ["Inter", "sans-serif"],
            "headline-lg-mobile": ["Inter", "sans-serif"]
          },
          fontSize: {
            "display-currency": ["34px", {lineHeight: "41px", letterSpacing: "-0.5px", fontWeight: "700"}],
            "label-caps": ["12px", {lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "600"}],
            "body-lg": ["17px", {lineHeight: "22px", fontWeight: "400"}],
            "display-currency-mobile": ["28px", {lineHeight: "34px", fontWeight: "700"}],
            "headline-md": ["22px", {lineHeight: "28px", fontWeight: "600"}],
            "headline-lg": ["28px", {lineHeight: "34px", fontWeight: "700"}],
            "body-sm": ["15px", {lineHeight: "20px", fontWeight: "400"}],
            "headline-md-mobile": ["20px", {lineHeight: "26px", fontWeight: "600"}],
            "headline-lg-mobile": ["24px", {lineHeight: "30px", fontWeight: "700"}]
          }
        },
      },
    }