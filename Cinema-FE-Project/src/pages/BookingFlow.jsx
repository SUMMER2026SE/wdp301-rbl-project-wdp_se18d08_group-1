import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import SeatSelection from "./SeatSelection";
import ConcessionPage from "./customer/concessionPage/concessionPage";
import Swal from "sweetalert2";
import { SOCKET_URL } from "../config/api";
import { seatService } from "../services/seatService";
import { paymentService } from "../services/paymentService";
import { jwtDecode } from "jwt-decode";

export default function BookingFlow() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();
    const [decodedUser, setDecodedUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const decoded = jwtDecode(token);

                // check expire luôn cho chắc
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem("token");
                    setDecodedUser(null);
                    return;
                }

                setDecodedUser(decoded);
            } catch (err) {
                console.error("Token decode failed");
                setDecodedUser(null);
            }
        }
    }, []);


    useEffect(() => {
        if (!isLoading && !user) {
            Swal.fire({
                icon: "warning",
                title: "Bạn cần đăng nhập",
                text: "Vui lòng đăng nhập để có thể chọn ghế và đặt vé.",
                confirmButtonColor: "#E50914",
            }).then(() => navigate("/", { replace: true }));
        }
    }, [user, isLoading, navigate]);

    // Quản lý flow: 1 = Chọn ghế, 2 = Bắp nước
    const [step, setStep] = useState(1);

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seatData, setSeatData] = useState(null);
    const [socket, setSocket] = useState(null);

    // 1️⃣ Khởi tạo Socket
    useEffect(() => {
        if (!uuid) return;
        const newSocket = io(SOCKET_URL);

        newSocket.on("connect", () => {
            console.log("🟢 Socket connected:", newSocket.id);
            newSocket.emit("join-showtime", uuid);
        });

        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, [uuid]);

    // 2️⃣ Khi user xác nhận ghế
    const handleSeatsConfirmed = (bookingData) => {
        setSeatData(bookingData);
        setStep(2);
    };

    // 3️⃣ Quay lại trang chọn ghế
    const handleBackToSeats = () => {
        setStep(1);
    };

    const handleConcessionNext = async (finalOrder) => {
        try {
            // 🔥 1. Lấy checkoutToken trước
            const previewData = await seatService.checkoutPreview({
                showtimeUUID: finalOrder?.showtime?.UUID,
                seatUUIDs: finalOrder?.selectedSeats || [],
                concessions: (finalOrder?.snacks || [])
                    .filter((s) => s.quantity > 0)
                    .map((s) => ({ concessionUUID: s.UUID, quantity: s.quantity })),
                voucherUUID: null,
                voucherCode: finalOrder?.voucherCode || null,
            });

            const checkoutToken = previewData.checkoutToken;

            // 🔥 2. STAFF → confirm luôn
            if (decodedUser?.role === "staff") {
                const res = await fetch("https://cinema-ticket-booking-system-3.onrender.com/api/seat/staffConfirm", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({ checkoutToken }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                await Swal.fire({
                    icon: "success",
                    title: "Đặt vé thành công!",
                    text: `Mã đơn: ${data.data.orderUUID}`,
                    confirmButtonColor: "#E50914",
                });

                navigate("/", { replace: true });
                return;
            }

            // 🔥 3. USER → đi payment như cũ
            const payWindow = window.open("", "_blank");

            if (payWindow) {
                payWindow.document.write("<p>Dang chuyen den PayOS...</p>");
                payWindow.document.close();
            }

            const paymentData = await paymentService.createPayOSLink(checkoutToken);

            const checkoutUrl = paymentData?.checkoutUrl;
            const orderCode = paymentData?.orderCode;

            if (!checkoutUrl || !orderCode) {
                throw new Error("Khong nhan duoc checkoutUrl/orderCode");
            }

            if (payWindow && !payWindow.closed) {
                payWindow.location.replace(checkoutUrl);
            } else {
                window.open(checkoutUrl, "_blank");
            }

            navigate(`/payment/result?orderCode=${encodeURIComponent(orderCode)}`, { replace: true });

        } catch (err) {
            console.error("Payment flow error:", err);
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: err.message || "Không thể xử lý",
            });
        }
    };

    // 4️⃣ Tạo object bookingData an toàn
    const bookingDataSafe = seatData
        ? {
            details: seatData.seats?.filter((s) =>
                selectedSeats.includes(s.UUID)
            ) || [],
            totalPrice: selectedSeats.reduce((total, seatUUID) => {
                const seat = seatData?.seats?.find((s) => s.UUID === seatUUID);
                if (!seat) return total;
                return total + (seatData?.pricing?.[seat.type] || 0);
            }, 0),
            showtime: seatData.showtime || null,
            movie: seatData.movie || null,
            holdExpiresAt: seatData.holdExpiresAt || null,
        }
        : null;

    return (
        <div className="min-h-screen bg-[#050505]">
            {step === 1 && user && (
                <SeatSelection
                    socket={socket}
                    onNext={handleSeatsConfirmed}
                    savedSeats={selectedSeats}
                />
            )}

            {step === 2 && (
                <>
                    {console.log("📝 bookingData chuẩn bị gửi sang ConcessionPage:", {
                        selectedSeats,
                        seatData
                    })}
                    <ConcessionPage
                        bookingData={seatData} // đã bao gồm details, totalPrice, holdExpiresAt...
                        onBack={handleBackToSeats}
                        onNext={handleConcessionNext}
                    />
                </>
            )
            }
        </div >
    );
}
