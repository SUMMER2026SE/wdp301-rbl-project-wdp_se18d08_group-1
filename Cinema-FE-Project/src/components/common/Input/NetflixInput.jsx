import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function NetflixInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  showEye = false,
  showPassword,
  setShowPassword
}) {
  return (
    <div className="relative group w-full">
      <input
        required
        name={name}
        type={type === "password" && showPassword ? "text" : type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full px-5 pt-6 pb-2 rounded bg-[#333] border-b-2 border-transparent text-white focus:bg-[#454545] focus:border-[#E50914] outline-none transition-all"
      />

      <label
        className="absolute left-5 top-4 text-gray-400 text-sm transition-all pointer-events-none
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
        peer-focus:top-1 peer-focus:text-[11px] peer-focus:font-bold
        peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-bold"
      >
        {label}
      </label>

      {showEye && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white pt-2"
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
}