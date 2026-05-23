/** Cùng origin: dùng khi popup không còn window.opener (Chrome + _blank thường gây null opener) */
export const GOOGLE_OAUTH_BROADCAST = "cinema_google_oauth_v1";
/** Tên cửa sổ popup — tránh "_blank" để trình duyệt không tách noopener / null opener */
export const GOOGLE_OAUTH_WINDOW_NAME = "CinemaGoogleOAuth";
