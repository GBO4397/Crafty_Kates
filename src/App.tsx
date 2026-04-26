
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteImagesProvider } from "@/contexts/SiteImagesContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CarShowPage from "./pages/CarShowPage";
import CarShowRegistration from "./pages/CarShowRegistration";
import GalleryBenRadatz from "./pages/GalleryBenRadatz";
import GalleryWallin from "./pages/GalleryWallin";
import ColoringBookPage from "./pages/ColoringBookPage";
import AdminDashboard from "./pages/AdminDashboard";
import PostsPage from "./pages/PostsPage";
import EventsPage from "./pages/EventsPage";
import LegalPage from "./pages/LegalPage";
import ColoringBookArchive from "./pages/ColoringBookArchive";

const App = () => (
  <ThemeProvider defaultTheme="light">
    <TooltipProvider>
      <SiteImagesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/car-show" element={<CarShowPage />} />
            <Route path="/register" element={<CarShowRegistration />} />
            {/* Legacy admin URLs redirect to main dashboard */}
            <Route path="/checklist" element={<Navigate to="/admin" replace />} />
            <Route path="/sponsor-admin" element={<Navigate to="/admin" replace />} />
            <Route path="/event-admin" element={<Navigate to="/admin" replace />} />
            <Route path="/download-images" element={<Navigate to="/admin" replace />} />
            <Route path="/gallery/ben-radatz" element={<GalleryBenRadatz />} />
            <Route path="/gallery/k-mikael-wallin" element={<GalleryWallin />} />
            <Route path="/coloring-book/:id" element={<ColoringBookPage />} />
            <Route path="/coloring-books" element={<ColoringBookArchive />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/legal/:type" element={<LegalPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SiteImagesProvider>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
