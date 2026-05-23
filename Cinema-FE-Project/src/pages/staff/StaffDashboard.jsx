// StaffDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../../context/AuthContext"; // Import useAuth từ context của bạn
import { LogOut, User, Search, Ticket } from "lucide-react"; // Thêm icon cho đẹp
import ProfileTab from "./tabs/ProfileTab";
import CustomerTab from "./tabs/CustomerTab";
import OrderTab from "./tabs/OrderTab";

const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "customer", label: "Lookup Customer", icon: Search },
    { id: "order", label: "Lookup Order", icon: Ticket },
];

export default function StaffDashboard() {
    const [activeTab, setActiveTab] = useState("profile");
    const { logout } = useAuth(); // Lấy hàm logout từ context
    const navigate = useNavigate();

    const handleSignOut = () => {
        logout(); // Gọi hàm xóa token/user trong context
        navigate("/"); // Điều hướng về trang chủ
    };

    return (
        <div className="flex h-screen bg-[#141414] text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-black border-r border-gray-800 p-6 flex flex-col">
                {/* Logo Style Netflix */}
                <div
                    className="cursor-pointer mb-10"
                    onClick={() => navigate("/")}
                >
                    <h2 className="text-2xl font-black text-[#E50914] tracking-tighter uppercase">
                        FCINEMA <span className="text-white font-light text-xs block tracking-normal normal-case opacity-70">Staff Portal</span>
                    </h2>
                </div>

                <nav className="flex flex-col gap-4 flex-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`flex items-center gap-3 text-left text-sm transition-all duration-300 ease-in-out hover:text-white ${activeTab === tab.id
                                        ? "text-white font-bold border-l-4 border-[#E50914] pl-3"
                                        : "text-gray-400 pl-4 hover:pl-5"
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom Section: Sign Out */}
                <div className="mt-auto pt-6 border-t border-gray-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full text-gray-400 text-sm hover:text-[#E50914] transition-colors duration-200 pl-4"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 p-10 overflow-auto bg-gradient-to-b from-[#181818] to-[#141414]">
                <div className="max-w-5xl mx-auto animate-fadeIn">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h1>
                    </header>

                    {/* Tab Container */}
                    <div className="bg-[#181818] rounded-md p-8 shadow-2xl ring-1 ring-white/5 min-h-[500px]">
                        {activeTab === "profile" && <ProfileTab />}
                        {activeTab === "customer" && <CustomerTab />}
                        {activeTab === "order" && <OrderTab />}
                    </div>
                </div>
            </main>
        </div>
    );
}