// src/layouts/DashboardLayout.jsx
import Navbar from '../components/common/Navbar';
import NotificationToast from '../components/common/NotificationToast';
import AIChatbot from '../components/ui/AIChatbot';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#060c18]">
      <Navbar />
      <main className="pt-16">{children}</main>
      <NotificationToast />
      <AIChatbot />
    </div>
  );
}
