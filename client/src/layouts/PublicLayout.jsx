// src/layouts/PublicLayout.jsx
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import NotificationToast from '../components/common/NotificationToast';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#060c18] flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <NotificationToast />
    </div>
  );
}
