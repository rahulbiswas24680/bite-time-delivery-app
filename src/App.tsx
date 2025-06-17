import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Customer Pages
import Menu from "./pages/Customer/Menu";
import Orders from "./pages/Customer/Orders";
import CustomerChat from "./pages/Customer/Chat";
import Checkout from "./pages/Customer/Checkout";

// Owner Pages
import Dashboard from "./pages/Owner/Dashboard";
import OwnerChat from "./pages/Owner/Chat";
import OwnerOrders from "./pages/Owner/Orders";
import OwnerShops from "./pages/Owner/OwnerShops";

// Shared
import NotFound from "./pages/NotFound";
import Billings from "./pages/Owner/Billings";
import MenuManagement from "./pages/Owner/MenuManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Customer Routes */}

            {/* Customer Routes with shop selection */}
            <Route path="/customer/:shopSlug/menu" element={<Menu />} />

            {/* <Route path="/customer/menu" element={<Menu />} /> */}
            <Route path="/customer/:shopSlug/orders" element={<Orders />} />
            <Route path="/customer/:shopSlug/chat" element={<CustomerChat />} />
            <Route path="/customer/:shopSlug/chat/:orderId" element={<CustomerChat />} />
            <Route path="/customer/:shopSlug/checkout" element={<Checkout />} />
            
            
            {/* Owner Routes */}
            <Route path="/owner/dashboard/:shopId" element={<Dashboard />} />
            <Route path="/owner/menus/:shopId" element={<MenuManagement />} />
            <Route path="/owner/chat/:shopId" element={<OwnerChat />} />
            <Route path="/owner/chat/:shopId/:orderId" element={<OwnerChat />} />
            <Route path="/owner/orders/:shopId" element={<OwnerOrders />} />
            <Route path="/owner/my-shops" element={<OwnerShops />} />
            <Route path="/owner/:shopId/billing" element={<Billings />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
