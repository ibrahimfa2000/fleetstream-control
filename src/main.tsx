import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";

// Set initial RTL direction based on saved language
const savedLanguage = localStorage.getItem('language') || 'en';
document.documentElement.dir = savedLanguage === 'ar' || savedLanguage === 'he' ? 'rtl' : 'ltr';

createRoot(document.getElementById("root")!).render(<App />);
