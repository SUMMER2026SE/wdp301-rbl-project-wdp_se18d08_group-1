import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GOOGLE_OAUTH_BROADCAST } from "../constants/googleOAuth";

/**
 * Gửi kết quả về cửa sổ đăng nhập.
 * @returns {"opener" | "broadcast"} opener = đã postMessage + đóng popup; broadcast = đã BroadcastChannel + thử đóng (tab chính xử lý)
 */
function deliverResultToOpener(type, payload) {
  const origin = window.location.origin;
  const message =
    type === "GOOGLE_AUTH_SUCCESS"
      ? { type: "GOOGLE_AUTH_SUCCESS", token: payload }
      : { type: "GOOGLE_AUTH_ERROR", error: payload };

  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(message, origin);
    window.close();
    return "opener";
  }

  try {
    const ch = new BroadcastChannel(GOOGLE_OAUTH_BROADCAST);
    ch.postMessage(message);
    ch.close();
  } catch (_) {
    /* ignore */
  }
  window.close();
  return "broadcast";
}

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      handledRef.current = true;
      const mode = deliverResultToOpener("GOOGLE_AUTH_ERROR", error);
      if (mode === "broadcast") {
        // Tab chính đã nhận BroadcastChannel và hiện Swal; chỉ xử lý khi đây là tab thường (close thất bại)
        window.setTimeout(() => {
          if (window.closed) return;
          navigate("/");
        }, 400);
      }
      return;
    }

    if (token) {
      handledRef.current = true;
      const mode = deliverResultToOpener("GOOGLE_AUTH_SUCCESS", token);
      if (mode === "broadcast") {
        window.setTimeout(() => {
          if (window.closed) return;
          // Tab chính đã đăng nhập + Swal; fallback chỉ khi không đóng được popup
          login(token);
          navigate("/", { replace: true, state: { focusMovies: true } });
        }, 400);
      }
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-white text-xl">Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  );
}
