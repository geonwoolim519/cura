import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ExhibitionCreate } from "@/pages/ExhibitionCreate";
import { Home } from "@/pages/Home";
import { ExhibitionProvider } from "@/store/ExhibitionContext";

export default function App() {
  return (
    <ExhibitionProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<ExhibitionCreate />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ExhibitionProvider>
  );
}
