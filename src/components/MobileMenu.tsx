import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface NavItem {
  readonly href: string;
  readonly label: string;
}

interface MobileMenuProps {
  readonly items: readonly NavItem[];
  readonly ctaHref: string;
  readonly ctaLabel: string;
}

const BODY_MENU_OPEN = "is-mobile-menu-open";

export function MobileMenu({
  items,
  ctaHref,
  ctaLabel,
}: MobileMenuProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [layerRoot, setLayerRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setLayerRoot(document.body);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add(BODY_MENU_OPEN);
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove(BODY_MENU_OPEN);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove(BODY_MENU_OPEN);
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const overlay = (
    <>
      {isOpen && (
        <div
          className="p-mobile-menu__backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className={`p-mobile-menu__panel${isOpen ? " is-open" : ""}`}
        aria-label="モバイルメニュー"
        inert={!isOpen}
      >
        <ul className="p-mobile-menu__list">
          {items.map((item) => (
            <li key={item.href}>
              <a
                className="p-mobile-menu__link has-s-font-size"
                data-layout="-fluid-typography"
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="p-mobile-menu__cta">
          <a
            className="c-btn c-btn--pink has-s-font-size"
            data-layout="-fluid-typography"
            href={ctaHref}
          >
            {ctaLabel}
          </a>
        </div>
      </nav>
    </>
  );

  return (
    <>
      <button
        type="button"
        className={`p-mobile-menu__trigger${isOpen ? " is-active" : ""}`}
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="p-mobile-menu__bar" />
        <span className="p-mobile-menu__bar" />
        <span className="p-mobile-menu__bar" />
      </button>
      {layerRoot && createPortal(overlay, layerRoot)}
    </>
  );
}
