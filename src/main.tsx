import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "@/App";
import "flag-icons/css/flag-icons.min.css";
import "./index.css";

export const createRoot = ViteReactSSG({ routes });
