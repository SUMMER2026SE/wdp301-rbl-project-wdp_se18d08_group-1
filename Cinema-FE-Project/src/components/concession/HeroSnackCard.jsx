import React from 'react';

export const HeroSnackCard = ({
  name, description, price, imageUrl, quantity, onAdd, onRemove
}) => {
  return (
    <div className="md:col-span-8 group relative overflow-hidden rounded-xl bg-surface-container-low cinematic-glow transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
      <img
        alt={name}
        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
        src={imageUrl}
      />
      <div className="absolute bottom-0 left-0 p-8 z-20 w-full flex justify-between items-end">
        <div>
          <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-tighter mb-2 inline-block">
            Best Seller
          </span>
          <h3 className="text-3xl font-headline font-extrabold mb-1">{name}</h3>
          {description && (
            <p className="text-on-surface-variant max-w-md text-sm">{description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-4">
          <span className="text-2xl font-headline font-bold text-primary-container">
            ${price.toFixed(2)}
          </span>
          <div className="flex items-center bg-surface-container-highest rounded-lg p-1">
            <button
              onClick={onRemove}
              className="w-8 h-8 flex items-center justify-center hover:bg-surface-bright rounded transition-colors"
            >
              <span className="material-symbols-outlined text-sm">remove</span>
            </button>
            <span className="px-4 font-bold">{quantity}</span>
            <button
              onClick={onAdd}
              className="w-8 h-8 flex items-center justify-center bg-primary-container text-on-primary-container rounded shadow-lg transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};