import React from 'react';
import { Heart, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { urlDeMedio, avatarPorNombre } from '../../services/medios';

/**
 * Tarjeta de una obra.
 *
 * Tres cosas que cambiaron respecto de la versión anterior y conviene no
 * deshacer sin pensarlo:
 *
 * 1. 🔑 SE PUEDE USAR CON TECLADO. Antes era un `div` con `onClick`: quien
 *    navega con Tab simplemente no podía abrir una obra. Ahora el título es un
 *    `<button>` real, y su `::after` estirado sobre toda la tarjeta hace que
 *    el resto siga siendo clicable con el mouse. El corazón va por encima con
 *    `relative z-10`, para que no se lo coma esa capa.
 *
 * 2. Los textos ya no miden 8 ni 9 píxeles. Eso no se lee en un teléfono, y en
 *    una pantalla grande tampoco: era decorativo a costa de ser legible.
 *
 * 3. La imagen ya no está en escala de grises hasta que le pasás el mouse.
 *    En un teléfono no hay mouse, así que la obra de un artesano se veía
 *    apagada y nunca se recuperaba.
 */
const ArtCard = ({ obra, onToggleFavorite, esFavorito, onClickCard }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const rutaImagen =
    obra.images?.[0] ??
    obra.post_media?.[0]?.file_path ??
    obra.media?.[0]?.file_path;

  const imageUrl = urlDeMedio(rutaImagen, avatarPorNombre(obra.title || 'Arte', 600));
  const authorName = obra.author?.name || obra.user?.name || t('cards.art.anonymous', 'Maestro Anónimo');

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg transition-colors duration-500 group-hover:border-[rgb(var(--role-accent))]/50 group-focus-within:border-[rgb(var(--role-accent))]">
        <img
          key={`${currentLang}-${obra.id}`}
          src={imageUrl}
          alt={obra.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(obra.id); }}
            aria-pressed={Boolean(esFavorito)}
            aria-label={
              esFavorito
                ? t('cards.art.unfav', 'Quitar de mi colección')
                : t('cards.art.fav', 'Guardar en mi colección')
            }
            // 44px de lado: el mínimo para que un dedo acierte sin pelear.
            className={`absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl transition-colors duration-300 ${
              esFavorito
                ? 'border-[rgb(var(--role-accent))] bg-[rgb(var(--role-accent))] text-white'
                : 'border-[var(--border-color)] bg-[var(--bg-primary)]/60 text-[var(--text-body)] hover:bg-[rgb(var(--role-accent))] hover:text-white'
            }`}
          >
            <Heart size={16} fill={esFavorito ? 'currentColor' : 'none'} strokeWidth={esFavorito ? 0 : 1.75} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1">
        <h3 className="text-base leading-tight">
          {/* El ::after cubre la tarjeta entera: un solo elemento enfocable, y
              toda la superficie sigue siendo clicable. */}
          <button
            type="button"
            onClick={() => onClickCard(obra.id)}
            className="text-left uppercase tracking-tight text-[var(--text-heading)] transition-colors after:absolute after:inset-0 after:content-[''] hover:text-[rgb(var(--role-accent))] focus-visible:text-[rgb(var(--role-accent))]"
          >
            <span className="line-clamp-2">{obra.title}</span>
          </button>
        </h3>

        <div className="mt-auto flex flex-col gap-1.5 border-t border-[var(--border-color)] pt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--role-accent))]">
              {obra.category?.name || t('cards.art.heritage', 'Patrimonio')}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-[var(--text-body)]">
              <Eye size={12} aria-hidden="true" />
              <span className="sr-only">{t('cards.art.views', 'Visualizaciones')}:</span>
              {obra.stats?.views || obra.view_count || 0}
            </span>
          </div>

          <p className="truncate text-xs uppercase tracking-wider text-[var(--text-body)]">
            {t('cards.art.master_prefix', 'Maestro')}{' '}
            <span className="font-bold text-[var(--text-heading)]">{authorName}</span>
          </p>
        </div>
      </div>
    </article>
  );
};

export default ArtCard;
