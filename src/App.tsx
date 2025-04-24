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

// Owner Pages
import Dashboard from "./pages/Owner/Dashboard";
import OwnerChat from "./pages/Owner/Chat";
import OwnerOrders from "./pages/Owner/Orders";

// Shared
import NotFound from "./pages/NotFound";

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
            <Route path="/customer/menu" element={<Menu />} />
            <Route path="/customer/orders" element={<Orders />} />
            <Route path="/customer/chat" element={<CustomerChat />} />
            <Route path="/customer/chat/:orderId" element={<CustomerChat />} />
            
            {/* Owner Routes */}
            <Route path="/owner/dashboard" element={<Dashboard />} />
            <Route path="/owner/chat" element={<OwnerChat />} />
            <Route path="/owner/chat/:orderId" element={<OwnerChat />} />
            <Route path="/owner/orders" element={<OwnerOrders />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
