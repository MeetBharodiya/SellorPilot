import Sidebar from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";
import { ShopProvider } from "@/context/ShopContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <ShopProvider>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {children}
          </main>
        </div>
      </ShopProvider>
    </ToastProvider>
  );
}
