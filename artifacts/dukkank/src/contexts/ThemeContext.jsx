import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext({
    theme: "light",
    isDark: false,
    setTheme: () => {},
    toggle: () => {},
});

export function ThemeProvider({ children }) {
    useEffect(() => {
        // Enforce clean light mode completely across the site
        const root = document.documentElement;
        root.classList.remove("dark");
        root.style.colorScheme = "light";
        try {
            localStorage.removeItem("dukkank_theme");
        } catch (_) {}
    }, []);

    return (
        <ThemeContext.Provider value={{ theme: "light", isDark: false, setTheme: () => {}, toggle: () => {} }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
