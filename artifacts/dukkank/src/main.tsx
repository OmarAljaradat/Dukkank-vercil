import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Auto reload seamlessly when a new version is deployed and old chunks are requested
window.addEventListener("vite:preloadError", () => {
    window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
