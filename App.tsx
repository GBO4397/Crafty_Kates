
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteImagesProvider } from "@/contexts/SiteImagesContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CarShowPage from "./pages/CarShowPage";
import CarShowRegistration from "./pages/CarShowRegistration";
import OrganizerChecklist from "./pages/OrganizerChecklist";
import SponsorAdmin from "./pages/SponsorAdmin";
import ImageAdmin from "./pages/ImageAdmin";
import EventAdmin from "./pages/EventAdmin";
import GalleryBenRadatz from "./pages/GalleryBenRadatz";
import GalleryWallin from "./pages/GalleryWallin";
import ColoringBookPage from "./pages/ColoringBookPage";
import DownloadImages from "./pages/DownloadImages";
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
            <Route path="/checklist" element={<OrganizerChecklist />} />
            <Route path="/sponsor-admin" element={<SponsorAdmin />} />
            <Route path="/image-admin" element={<ImageAdmin />} />
            <Route path="/event-admin" element={<EventAdmin />} />
            <Route path="/gallery/ben-radatz" element={<GalleryBenRadatz />} />
            <Route path="/gallery/k-mikael-wallin" element={<GalleryWallin />} />
            <Route path="/coloring-book/:id" element={<ColoringBookPage />} />
            <Route path="/coloring-books" element={<ColoringBookArchive />} />
            <Route path="/download-images" element={<DownloadImages />} />
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
