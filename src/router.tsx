import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Home } from "./home";
import NotFoundPage from "./NotFoundPage";
// import AppDemo from "./AppDemo";
import AnimationsTab from "./pages/3d-animations";
import LightingTab from "./pages/lighting";
import MaterialTab from "./pages/material";
import WebGPUTab from "./pages/webgpu";


export const router = createBrowserRouter([{
  path: "/",
  element: <App />,
  children: [
      { index: true, element: <Home />, errorElement: <NotFoundPage /> },
      { path: "animations", element: <AnimationsTab />, errorElement: <NotFoundPage /> },
      { path: "lighting", element: <LightingTab />, errorElement: <NotFoundPage /> },
      { path: "material", element: <MaterialTab />, errorElement: <NotFoundPage /> },
      { path: "webgpu", element: <WebGPUTab />, errorElement: <NotFoundPage /> },
      
  ]
}]);