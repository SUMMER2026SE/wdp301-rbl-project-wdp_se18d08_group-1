import { useState, useEffect } from "react";
import { Play, Monitor } from "lucide-react";

export default function VideoPlayer({ isOpen, onClose, videoUrl, title }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => { if (isOpen) setLoading(true); }, [isOpen, videoUrl]);

  if (!isOpen) return null;

  const getEmbedUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    const u = url.trim();

    // YouTube: watch, embed, youtu.be, m.youtube, shorts, nocookie
    let m = u.match(
      /(?:youtube\.com\/watch\?[^#]*v=|youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|m\.youtube\.com\/watch\?[^#]*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;

    m = u.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;

    const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;

    return null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-600/20 flex items-center justify-center">
              <Play className="w-4 h-4 text-red-500 fill-current" />
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider">Trailer</p>
              <p className="text-white font-bold text-sm truncate max-w-[200px] sm:max-w-xs">{title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <span className="text-white text-lg leading-none">&times;</span>
          </button>
        </div>
        {/* Video */}
        <div className="relative aspect-video bg-black">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
              <div className="w-14 h-14 border-[3px] border-red-600/20 border-t-red-600 rounded-full animate-spin" />
            </div>
          )}
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setLoading(false)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
              <Monitor className="w-16 h-16 mb-3 opacity-30" />
              <p className="text-sm">Chưa có trailer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
