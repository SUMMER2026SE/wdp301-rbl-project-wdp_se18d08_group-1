import React from 'react';

export const SnackCard = ({
  name, price, imageUrl, quantity, onAdd, onRemove
}) => {
  return (
    <div className={`bg-[#111] border rounded-2xl p-4 flex flex-col transition-all duration-500 group ${
      quantity > 0 ? 'border-red-600/50 shadow-[0_0_20px_rgba(229,9,20,0.15)]' : 'border-white/5'
    }`}>
      
      {/* Container ảnh với hiệu ứng zoom */}
      <div className="h-32 md:h-44 rounded-xl overflow-hidden mb-4 bg-[#0a0a0a] relative group">
        <img
          alt={name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
          src={imageUrl}
        />
        {/* Badge số lượng hiển thị đè lên ảnh khi đã chọn */}
        {quantity > 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg animate-bounce">
            x{quantity}
          </div>
        )}
      </div>
      
      <div className="flex-1 mb-4">
        <h4 className="text-sm font-black uppercase tracking-tight text-gray-200 line-clamp-1 group-hover:text-white transition-colors">
          {name}
        </h4>
        <p className="text-red-600 font-black text-lg mt-1 italic">
          {price.toLocaleString()}₫
        </p>
      </div>

      {/* BỘ NÚT BẤM THIẾT KẾ MỚI */}
      <div className="flex items-center justify-between mt-auto bg-black/40 backdrop-blur-md rounded-2xl p-1.5 border border-white/5 shadow-inner">
        <button
          onClick={onRemove}
          disabled={quantity === 0}
          className={`group/btn w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
            quantity > 0 
            ? 'bg-white/5 hover:bg-red-600 text-white shadow-lg' 
            : 'bg-transparent text-gray-700 cursor-not-allowed'
          }`}
        >
          <span className="text-2xl leading-none group-hover/btn:scale-125 transition-transform">−</span>
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-black text-gray-500 tracking-tighter leading-none mb-0.5">SL</span>
          <span className={`font-mono font-black text-lg leading-none ${quantity > 0 ? 'text-white' : 'text-gray-600'}`}>
            {quantity.toString().padStart(2, '0')}
          </span>
        </div>
        
        <button
          onClick={onAdd}
          className="group/btn w-10 h-10 flex items-center justify-center bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-[0_4px_15px_rgba(229,9,20,0.3)] active:scale-90 transition-all duration-300"
        >
          <span className="text-2xl leading-none group-hover/btn:scale-125 transition-transform">+</span>
        </button>
      </div>
    </div>
  );
};