import React from 'react';
import { Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { urlDeMedio, avatarPorNombre } from '../../services/medios';

/**
 * Tarjeta de un artesano.
 *
 * Esta era la que mejor manejaba los tamaños —ya tenía breakpoints en el
 * retrato— y la peor en lo demás: un `div` con `onClick`, imposible de
 * alcanzar con teclado, y el nombre del barrio en 8 píxeles.
 *
 * Mismo patrón que [ArtCard] y [ProductCard]: el nombre es un `<button>` real
 * cuyo `::after` cubre la tarjeta entera.
 */
const ArtistCard = ({ artista, onClickCard }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const retrato = urlDeMedio(
    artista.profile_picture,
    avatarPorNombre(artista.name || t('cards.artist.default_name', 'Artista'), 600)
  );

  const lugar =
    artista.neighborhood || artista.city || t('cards.artist.master', 'Maestro Artesano');

  return (
    <article className="group relative flex flex-col items-center text-center">
      <div className="mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm transition-colors duration-500 group-hover:border-[rgb(var(--role-accent))]/70 group-focus-within:border-[rgb(var(--role-accent))] sm:mb-4 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:mb-5 lg:h-40 lg:w-40">
        <img
          key={`${currentLang}-${artista.id}`}
          src={retrato}
          alt={artista.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <h3 className="w-full px-2 text-sm leading-tight md:text-base">
        <button
          type="button"
          onClick={() => onClickCard(artista.username || artista.id)}
          className="uppercase tracking-tight text-[var(--text-heading)] transition-colors after:absolute after:inset-0 after:content-[''] hover:text-[rgb(var(--role-accent))] focus-visible:text-[rgb(var(--role-accent))]"
        >
          <span className="line-clamp-1">{artista.name}</span>
        </button>
      </h3>

      <p className="mt-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--text-body)] sm:mt-2">
        <Award size={12} className="shrink-0 text-[rgb(var(--role-accent))]" aria-hidden="true" />
        <span className="line-clamp-1">{lugar}</span>
      </p>
    </article>
  );
};

export default ArtistCard;
