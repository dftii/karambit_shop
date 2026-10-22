import React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';

interface FooterColumn {
  title: string;
  links: { to: string; label: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Tienda',
    links: [
      { to: '/shop', label: 'Catálogo' },
      { to: '/bundles', label: 'Packs coleccionista' },
      { to: '/orders', label: 'Mis pedidos' },
    ],
  },
  {
    title: 'Colección',
    links: [
      { to: '/founders-vault', label: "Founder's Vault" },
      { to: '/founders-vault', label: 'DuFiTuFi Design (CEO)' },
      { to: '/shop', label: 'StatTrak™ y NameTag' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { to: '/#faq', label: 'Preguntas frecuentes' },
      { to: '/#como-funciona', label: 'Cómo funciona' },
    ],
  },
];

const YEAR = new Date().getFullYear();

/** Pie de página común (montado en App). Rejilla con reglas de 1px y marca gigante. */
export const Footer: React.FC = () => (
  <footer className="mt-24 border-t border-paper/15 bg-ink text-paper">
    <div className="wrap">
      <div className="grid grid-cols-1 border-b border-paper/20 md:grid-cols-12">
        <div className="py-10 md:col-span-6 md:pr-10">
          <Wordmark className="text-3xl" />
          <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-paper/70">
            Réplicas de karambit inspiradas en CS2, con grabado StatTrak™ y NameTag, y la colección Founder Bespoke
            firmada por DuFiTuFi Design (CEO).
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav
            key={col.title}
            aria-label={col.title}
            className="border-t border-paper/20 py-8 md:col-span-2 md:border-l md:border-t-0 md:px-6 md:py-10"
          >
            <h2 className="eyebrow mb-4 font-mono !text-paper/50">{col.title}</h2>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={`${col.title}-${link.label}`}>
                  <Link to={link.to} className="font-body text-sm text-paper/75 transition-colors hover:text-paper hover:underline hover:decoration-pink hover:decoration-1 hover:underline-offset-4">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div aria-hidden="true" className="select-none overflow-hidden pt-6">
        <Wordmark className="block text-[clamp(4.5rem,22.5vw,19rem)] leading-[0.82]" />
      </div>

      <div className="flex flex-col gap-2 border-t border-paper/20 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="eyebrow !text-paper/50">&copy; {YEAR} KRM—GG</p>
        <p className="eyebrow !text-paper/50 sm:text-right">Pasarela simulada · Proyecto fan-made, no afiliado a Valve</p>
      </div>
    </div>
  </footer>
);

export default Footer;
