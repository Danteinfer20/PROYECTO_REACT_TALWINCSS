import React from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { urlDeMedio, avatarPorNombre } from '../../services/medios';

/** El precio, en pesos colombianos y sin centavos. */
const formatoCOP = (valor) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor ?? 0);

/**
 * Tarjeta de un producto de la tienda.
 *
 * Mismo criterio que [ArtCard]: el título es un `<button>` real cuyo `::after`
 * cubre la tarjeta, así se puede abrir con teclado y seguir siendo clicable
 * entera con el mouse. Antes era un `div` con `onClick` — o sea, imposible de
 * alcanzar con Tab.
 *
 * También se fue el texto de 7 y 8 píxeles, y la escala de grises que dejaba
 * la foto del producto apagada hasta un hover que en un teléfono no existe.
 */
const ProductCard = ({ producto, onClickCard }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const galeria = producto.gallery_urls || producto.images;
  const imageUrl = urlDeMedio(
    galeria?.[0] ?? producto.main_image,
    avatarPorNombre(producto.name || t('cards.product.store', 'Tienda'), 600)
  );

  const autor =
    producto.author?.name ||
    producto.artisan?.name ||
    t('cards.product.default_author', 'Popayán Cultural');

  return (
    <article className="group relative flex h-full w-full flex-col">
      <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm transition-colors duration-500 group-hover:border-[rgb(var(--role-accent))]/50 group-focus-within:border-[rgb(var(--role-accent))]">
        <img
          key={`${currentLang}-${producto.id}`}
          src={imageUrl}
          alt={producto.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {producto.is_featured && (
          <span className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-[rgb(var(--role-accent))] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-white">
            <Star size={10} fill="currentColor" aria-hidden="true" />
            {t('cards.product.featured', 'Destacado')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1">
        <h3 className="mb-1 text-base leading-tight">
          <button
            type="button"
            onClick={() => onClickCard(producto.id)}
            className="text-left uppercase tracking-tight text-[var(--text-heading)] transition-colors after:absolute after:inset-0 after:content-[''] hover:text-[rgb(var(--role-accent))] focus-visible:text-[rgb(var(--role-accent))]"
          >
            <span className="line-clamp-2">{producto.name}</span>
          </button>
        </h3>

        <p className="mb-3 text-sm font-bold tracking-wide text-[rgb(var(--role-accent))]">
          {formatoCOP(producto.price)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--border-color)] pt-3">
          <span className="truncate text-xs uppercase tracking-wider text-[var(--text-body)]">
            {autor}
          </span>
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--text-heading)]/5 text-[var(--text-body)] transition-colors duration-300 group-hover:bg-[rgb(var(--role-accent))] group-hover:text-white"
          >
            <ShoppingBag size={12} />
          </span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
