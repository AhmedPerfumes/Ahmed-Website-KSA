"use client";

import Image from "next/image";
import { useEffect, useRef, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import Link from "next/link";

const css = `
.nlp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 8, 5, 0.72);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 9990;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.38s ease;
}
.nlp-overlay.nlp-visible { opacity: 1; pointer-events: auto; }
.nlp-card {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 860px;
  min-height: 480px;
  background: #faf8f4;
  border-radius: 4px;
  overflow: hidden;
  transform: translateY(28px) scale(0.97);
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 32px 96px rgba(0,0,0,0.38);
}
.nlp-overlay.nlp-visible .nlp-card { transform: translateY(0) scale(1); }
.nlp-close {
  position: absolute; top: 14px; right: 14px; z-index: 10;
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.88);
  border: none; border-radius: 50%; cursor: pointer;
  color: #1a1a1a; font-size: 1rem;
  transition: background 0.18s, transform 0.18s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.14);
}
.nlp-close:hover { background: #fff; transform: rotate(90deg); }
.nlp-img-panel {
  flex: 0 0 52%;
  position: relative;
  min-height: 380px;
  overflow: hidden;
}
.nlp-img-panel::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(to right, transparent 60%, #faf8f4 100%);
  pointer-events: none;
}
.nlp-img-panel img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 6s ease; }
.nlp-overlay.nlp-visible .nlp-img-panel img { transform: scale(1.04); }
.nlp-content {
  flex: 1;
  display: flex; flex-direction: column; justify-content: center;
  padding: 44px 36px 44px 28px;
  background: #faf8f4;
}
.nlp-eyebrow {
  display: inline-block;
  font-size: 0.62rem; font-weight: 700;
  letter-spacing: 0.25em; text-transform: uppercase;
  color: #b8973e; margin-bottom: 12px;
}
.nlp-rule {
  width: 40px; height: 1.5px;
  background: linear-gradient(90deg, #b8973e, #d4b86a, #b8973e);
  margin-bottom: 18px;
}
.nlp-title {
  font-size: clamp(1.3rem, 2.5vw, 1.7rem);
  font-weight: 300; letter-spacing: 0.04em;
  color: #1a1a1a; line-height: 1.3; margin: 0 0 12px;
}
.nlp-title em { font-style: italic; color: #b8973e; }
.nlp-body { font-size: 0.88rem; line-height: 1.65; color: #5a5550; margin: 0 0 28px; }
.nlp-cta {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 13px 28px;
  background: #1a1a1a; color: #d4b86a;
  font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.2em; text-transform: uppercase;
  text-decoration: none;
  border: 1.5px solid #1a1a1a; border-radius: 2px;
  transition: background 0.22s, color 0.22s, border-color 0.22s;
  align-self: flex-start;
}
.nlp-cta:hover { background: transparent; color: #1a1a1a; border-color: #b8973e; }
.nlp-cta svg { flex-shrink: 0; transition: transform 0.22s; }
.nlp-cta:hover svg { transform: translateX(4px); }
.nlp-skip {
  margin-top: 16px; font-size: 0.72rem; color: #aaa;
  background: none; border: none; cursor: pointer;
  padding: 0; text-decoration: underline; transition: color 0.18s;
}
.nlp-skip:hover { color: #666; }
@media (max-width: 640px) {
  .nlp-card { flex-direction: column; min-height: 0; max-width: 100%; max-height: 90svh; overflow-y: auto; }
  .nlp-img-panel { flex: 0 0 200px; min-height: 200px; width: 100%; }
  .nlp-img-panel::after { background: linear-gradient(to bottom, transparent 60%, #faf8f4 100%); }
  .nlp-content { padding: 28px 24px 32px; }
  .nlp-cta { align-self: stretch; justify-content: center; }
}
`;

export default function NewsLetter() {
  const locale = useLocale();
  const t      = useTranslations();
  const { popUp } = useMenu();

  const overlayRef          = useRef(null);
  const hasShownThisSession = useRef(false);
  const STORAGE_KEY         = "newsletterPopupLastShown";
  const COOLDOWN            = 30 * 60 * 1000;

  const openPopup  = useCallback(() => overlayRef.current?.classList.add("nlp-visible"),    []);
  const closePopup = useCallback(() => overlayRef.current?.classList.remove("nlp-visible"), []);

  useEffect(() => {
    const last = localStorage.getItem(STORAGE_KEY);
    if (last && Date.now() - parseInt(last, 10) < COOLDOWN) return;

    const handleScroll = () => {
      if (window.scrollY > 2000 && !hasShownThisSession.current) {
        hasShownThisSession.current = true;
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        openPopup();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [openPopup]);

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) closePopup(); };

  if (!popUp?.length) return null;

  return (
    <>
      <style>{css}</style>
      <div
        className="nlp-overlay"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nlp-title"
        onClick={handleOverlayClick}
      >
        {popUp.slice(0, 1).map((elm, i) => (
          <div className="nlp-card" key={i} onClick={(e) => e.stopPropagation()}>
            <button className="nlp-close" onClick={closePopup} aria-label="Close" type="button">&#x2715;</button>

            <div className="nlp-img-panel">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 52vw"
                style={{ objectFit: "cover" }}
              />
            </div>

            <div className="nlp-content">
              <span className="nlp-eyebrow">Exclusive Offer</span>
              <div className="nlp-rule" aria-hidden="true" />
              <h2 className="nlp-title" id="nlp-title">
                {elm.name ? t(elm.name) : "Discover the Finest Arabic Fragrances"}
              </h2>
              <div
                className="nlp-body"
                dangerouslySetInnerHTML={{
                  __html: elm.content?.replace(/<\/?p>/g, "") || t(elm.description) || "",
                }}
              />
              <Link href={`/${locale}/shop`} className="nlp-cta" onClick={closePopup}>
                {t("Shop Now")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <button className="nlp-skip" onClick={closePopup} type="button">
                No thanks, continue browsing
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}