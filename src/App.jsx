import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserProvider, formatEther, parseEther } from "ethers";

const RECEIVER = "0x8A3F0f3De937Cf08D6A4144e945A354954F878E9";
const PRICE_PER_ITEM_ETH = "0.1";

const SEPOLIA_CHAIN_ID_DEC = 11155111n; // internal only (no UI mention)
const SEPOLIA_CHAIN_ID_HEX = "0xAA36A7"; // internal only (no UI mention)

const IMAGES = ["/images/nft1.avif", "/images/nft2.avif", "/images/nft3.avif", "/images/nft4.avif"];

const TEAM = [
  {
    name: "Evgeny",
    role: "CEO",
    img: "https://img-cdn.magiceden.dev/rs:fill:300:0:0/plain/https%3A%2F%2Fmedia.cdn.magiceden.dev%2Flaunchpad%2Fmeta_racing_pilots%2F473fd4ff-94fc-41da-86ea-458780053810",
    x: null,
  },
  {
    name: "Snowman",
    role: "CMO",
    img: "https://img-cdn.magiceden.dev/rs:fill:300:0:0/plain/https%3A%2F%2Fmedia.cdn.magiceden.dev%2Flaunchpad%2Fmeta_racing_pilots%2Faba4340f-7cf2-4f23-abf4-063ea3701012",
    x: "https://x.com/sol_snowman",
  },
  {
    name: "Myu",
    role: "Content Lead",
    img: "https://img-cdn.magiceden.dev/rs:fill:300:0:0/plain/https%3A%2F%2Fmedia.cdn.magiceden.dev%2Flaunchpad%2Fmeta_racing_pilots%2Fbc3558e2-e903-464a-bd75-3e83bb793335",
    x: "https://x.com/meta_myu",
  },
  {
    name: "Extreme",
    role: "Community Mod",
    img: "https://img-cdn.magiceden.dev/rs:fill:300:0:0/plain/https%3A%2F%2Fmedia.cdn.magiceden.dev%2Flaunchpad%2Fmeta_racing_pilots%2Fdb0f74fa-244f-491f-8891-5b0abc41a975",
    x: "https://x.com/League0fgamess",
  },
  {
    name: "OL",
    role: "Partnership Lead",
    img: "https://img-cdn.magiceden.dev/rs:fill:300:0:0/plain/https%3A%2F%2Fmedia.cdn.magiceden.dev%2Flaunchpad%2Fmeta_racing_pilots%2F82f863e6-69c6-4442-af30-9a945e990cc1",
    x: "https://x.com/ol_onx",
  },
];

const MINT_STAGES = [
  { tag: "OG", status: "Ended", mintLimit: 1, price: "0.25", currency: "SOL", minted: 32, ended: true },
  { tag: "GTD", status: "Ended", mintLimit: 1, price: "0.27", currency: "SOL", minted: 33, ended: true },
  { tag: "FCFS", status: "Ended", mintLimit: 2, price: "0.27", currency: "SOL", minted: 44, ended: true },
  { tag: "Public", status: "Ends", mintLimit: 5, price: "0.3", currency: "SOL", minted: null, ended: false },
];

const LINKS = {
  website: "https://metaracing.io/",
  x: "https://x.com/MetaRacing_io",
  discord: "https://discord.com/invite/43mwNawuT9",
  contract: "https://sepolia.etherscan.io/address/0x0000000000000000000000000000000000000000",
};

const LINKS_ME = {
  play: "https://magiceden.io/packs",
  trade:
    'https://magiceden.io/popular-collections?filters=%7B"timeWindow"%3A"1d"%2C"collectionType"%3A"all"%2C"sortColumn"%3A"volume"%2C"sortDirection"%3A"desc"%2C"hideSpamCollections"%3Atrue%7D&activeTab="TOP"',
  mint: "https://magiceden.io/launchpad/solana",
  buybacks: "https://magiceden.io/buybacks",
  rewards: "https://magiceden.io/rewards",
};

/** ===== DEPLOY TIME (IMPORTANT) =====
 * Set deploy moment (UTC). It becomes an anchor (stored once in localStorage),
 * so progress/countdown do NOT reset after reloads.
 *
 * Example: "2026-02-08T10:00:00Z"
 */
const DEPLOY_AT_ISO_UTC = "2026-02-08T10:00:00Z";
const DEPLOY_ANCHOR_KEY = "mr_pilots_deploy_anchor_v1";

/** ===== MINT UI SIMULATION CONSTANTS ===== */
const MAX_SUPPLY = 1500;
const START_MINTED = 239;
const MINTED_PER_2_MIN = 7;
const MINT_TICK_MS = 2 * 60 * 1000;

/** ===== PUBLIC MINT COUNTDOWN (UI) ===== */
const PUBLIC_MINT_DURATION_MS = (2 * 86400 + 22 * 3600 + 55 * 60 + 43) * 1000;

function getDeployAnchorTs() {
  const fallbackParsed = Date.parse(DEPLOY_AT_ISO_UTC);
  const fallback = Number.isFinite(fallbackParsed) ? fallbackParsed : Date.now();

  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(DEPLOY_ANCHOR_KEY);
    if (stored) {
      const n = Number(stored);
      if (Number.isFinite(n) && n > 0) return n;
    }
    window.localStorage.setItem(DEPLOY_ANCHOR_KEY, String(fallback));
    return fallback;
  } catch {
    return fallback;
  }
}

function calcMintedNow(anchorTs) {
  const now = Date.now();
  const base = Number.isFinite(anchorTs) ? anchorTs : now;

  const elapsed = Math.max(0, now - base);
  const ticks = Math.floor(elapsed / MINT_TICK_MS);
  const minted = START_MINTED + ticks * MINTED_PER_2_MIN;

  return Math.min(MAX_SUPPLY, Math.max(0, minted));
}

function calcPublicEndsAt(anchorTs) {
  const base = Number.isFinite(anchorTs) ? anchorTs : Date.now();
  return base + PUBLIC_MINT_DURATION_MS;
}

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
  --layer-03: #1b1624;

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
  --nav-pad-x: 18px;
  --nav-pad-x-m: 12px;

  --media-radius: 14px;
  --thumb-radius: 12px;
  --media-gap: 12px;

  --search-gap-left: 16px;
  --search-gap-right: 16px;

  --card-radius: 14px;

  --icon-on-brand: 242 242 243;
}

*{ box-sizing:border-box; }
html, body, #root { height: auto !important; min-height: 100%; }
html { overflow-x:hidden; }
body{
  margin:0;
  overflow-x:hidden;
  overflow-y:auto !important;
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
.page{
  min-height:100vh;
  width:100%;
  overflow: visible !important;
  padding-top: var(--nav-h);
}
button, input { outline: none; }
button:focus, button:focus-visible { outline: none; box-shadow: none; }
input:focus, input:focus-visible { outline: none; box-shadow: none; }

/* ===== NAVBAR ===== */
.header{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
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
  justify-content: space-between;
  gap: 12px;
  padding: 0 var(--nav-pad-x);
  min-width: 0;
  flex-wrap: nowrap;
}
.navLeft{
  display:flex;
  align-items:center;
  gap: 18px;
  height:100%;
  flex: 0 0 auto;
  min-width: 0;
}
.logoWrap{
  display:flex;
  align-items:center;
  gap: 10px;
  height:100%;
  flex: 0 0 auto;
}
.meLogoSvg{
  height: 18px;
  width: 190px;
  display:block;
}

.navLinks{
  display:flex;
  align-items:center;
  gap: 30px;
  height:100%;
}
.navLink{
  font-weight: 800;
  font-size: 13px;
  opacity: .95;
  cursor: pointer;
  transition: opacity .15s ease;
  white-space: nowrap;
}
.navLink:hover{ opacity: .78; }

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
.searchRight{
  height: 40px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex: 0 0 auto;
  padding-right: 12px;
}
.kbd{ display:flex; align-items:center; justify-content:center; gap: 6px; transform: translateY(.5px); }
.kbdKey{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height: 24px;
  padding: 0 8px;
  border-radius: 8px;
  border: none;
  background: rgba(255,255,255,.06);
  color: rgb(var(--textColor-secondary));
  font-weight: 800;
  font-size: 12px;
  line-height: 1;
}

.navRight{
  display:flex;
  align-items:center;
  gap: 10px;
  flex: 0 0 auto;
  min-width: 0;
  flex-wrap: nowrap;
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
  gap: 8px;
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
  white-space: nowrap;
}
.btnPrimary:hover{ background: rgb(var(--button-primary-hover)); }
.btnPrimary:active{ background: rgb(var(--button-primary-active)); }
.btnPrimary:disabled{ background: rgb(var(--button-primary-disabled)); cursor:not-allowed; }

.btnPrimaryMobile{
  height: 36px;
  min-width: 92px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 8px;
}

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
  flex: 0 0 auto;
}
.iconBtn:hover{ background: rgb(var(--button-secondary-hover)); }
.iconBtn:active{ background: rgb(var(--button-secondary-active)); }

.iconBtnSmall{
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

/* dropdown menu */
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

/* search row (mobile toggle) */
.mobileSearchRow{
  width: 100%;
  background: rgb(21 17 29 / 1);
  border-bottom: 1px solid rgb(var(--borderColor-primary));
  padding: 10px var(--nav-pad-x-m) 12px;
}
.mobileSearchWrap{
  width: 100%;
  height: 40px;
  display:flex;
  align-items:center;
  border-radius: 10px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgb(var(--borderColor-interactive));
  overflow:hidden;
}
.mobileSearchInput{
  flex: 1;
  height: 40px;
  border: none;
  background: transparent;
  color: rgb(var(--textColor-primary));
  font-size: 13px;
  padding: 0 12px;
}

/* ===== Page Layout ===== */
.shell{
  max-width: 1240px;
  margin: 0 auto;
  padding: 28px 18px 44px;
}

.iconGhost{
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgb(var(--textColor-primary));
  flex: 0 0 auto;
}
.iconGhost:hover{ background: rgba(255,255,255,.06); }
.iconGhost:active{ background: rgba(255,255,255,.10); }

.heroRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.heroLeft{
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
  max-width: 100%;
}
.heroRight{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  flex: 1;
  min-width: 260px;
}

/* social */
.socialLinks{
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
}
.socialLink{
  width: fit-content;
  padding: 8px;
  display:flex;
  align-items:center;
  gap: 8px;
  transition: background .12s ease;
  border-radius: 8px;
  background: rgb(var(--button-secondary));
  color: rgb(var(--textColor-primary));
  border: none;
}
.socialLink:hover{ background: rgb(var(--button-secondary-hover)); }
.socialLink:active{ background: rgb(var(--button-secondary-active)); }
.socialLink svg{ display:block; }

/* grid */
.mainGrid{
  margin-top: 16px;
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 22px;
  align-items:start;
  width: 100%;
  min-width: 0;
}

/* media */
.mediaCard{ background: transparent; border: none; box-shadow: none; border-radius: 0; overflow: visible; min-width:0; }
.mediaWrap{
  width: 100%;
  max-width: 580px;
  margin: 0 auto;
}
.mediaMain{
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  display:flex;
  align-items:center;
  justify-content:center;
}
.mainImg{
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  background: transparent;
  border: none;
  border-radius: var(--media-radius);
}

/* ✅ open image icon button */
.fullscreenBtn{
  position:absolute;
  right: 14px;
  top: 14px;
  width: 44px;
  height: 44px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.22);
  background: rgba(0,0,0,.42);
  color: rgba(242,242,243,.96);
  cursor:pointer;
  transition: background .12s ease, opacity .12s ease, transform .12s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 14px 40px rgba(0,0,0,.35);
  line-height: 0;
  padding: 0;
}

.fullscreenBtn svg{
  display: block;
  width: 28px;
  height: 28px;
}

.fullscreenBtn:hover{ background: rgba(0,0,0,.55); transform: translateY(-1px); }
.fullscreenBtn:active{ opacity: .92; transform: translateY(0); }

.contractBtn{
  border-radius: 6px !important;
  height: 44px;
}

/* thumbs */
.thumbRow{
  width: 100%;
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--media-gap);
  margin-top: var(--media-gap);
  padding: 0;
}
.thumbBtn{
  width: 100%;
  aspect-ratio: 1 / 1;
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

/* description */
.descWrap{
  width: 100%;
  max-width: 580px;
  margin: 18px auto 0;
  display:flex;
  flex-direction:column;
  gap: 14px;
}
.layerBox{
  background: rgb(21 17 29 / 1);
  border: 1px solid rgb(var(--borderColor-primary));
  border-radius: 14px;
  box-shadow: 0 10px 40px rgb(0 0 0 / .28);
  overflow:hidden;
}
.layerBoxInner{ padding: 14px; }

.sectionTitle{
  font-size: 18px;
  font-weight: 900;
  letter-spacing: .2px;
  margin: 4px 0 10px;
}
.divider{
  height: 1px;
  background: rgb(var(--borderColor-primary));
  margin: 12px 0 14px;
}

.p{
  font-size: 13px;
  line-height: 1.55;
  margin: 0 0 12px 0;
  color: rgba(242,242,243,.82);
}
.p:last-child{ margin-bottom: 0; }
.brandStrong{ color: rgb(var(--brand)); font-weight: 900; }

.list{ margin: 8px 0 12px 18px; padding: 0; }
.li{ font-size: 13px; line-height: 1.55; margin: 6px 0; color: rgba(242,242,243,.80); }

.h3{ margin: 10px 0 8px; font-size: 16px; font-weight: 900; color: rgba(242,242,243,.92); }

/* team */
.teamGrid{
  display:grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 560px){
  .teamGrid{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 640px){
  .heroRight{
    width: 100%;
    flex: 1 1 100%;
    flex-wrap: nowrap;
  }
}

@media (min-width: 1051px){
  .shell{ padding-top: 36px; }
}

.teamCard{
  background: rgb(21 17 29 / 1);
  border: 1px solid rgb(var(--borderColor-primary));
  border-radius: 12px;
  overflow:hidden;
}
.teamImgWrap{ width: 100%; aspect-ratio: 1 / 1; background: rgba(255,255,255,.04); }
.teamImg{ width: 100%; height: 100%; object-fit: cover; display:block; }
.teamBody{
  padding: 10px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:space-between;
  gap: 8px;
  min-height: 84px;
}
.teamName{ font-weight: 900; font-size: 13px; color: rgba(242,242,243,.92); text-align:center; }
.teamRole{ font-weight: 700; font-size: 11px; color: rgba(133,127,148,.95); text-align:center; }
.teamLinks{ height: 18px; display:flex; align-items:center; justify-content:center; }
.xLink{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgb(var(--borderColor-interactive));
  transition: opacity .12s ease, background .12s ease;
}
.xLink:hover{ opacity: .85; background: rgba(255,255,255,.07); }

/* mint panel */
.panel{
  background: var(--panel);
  border: 1px solid rgb(var(--borderColor-primary));
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow:hidden;
  position: sticky;
  top: calc(var(--nav-h) + 16px);
}
.panelInner{ padding: 18px; }

.mintDesktop{ display:block; }
.mintMobile{ display:none; margin-top: 18px; max-width: 580px; margin-left:auto; margin-right:auto; }
.panelMobile{ position: static; top: auto; }

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
.eligLockIcon{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  opacity: .92;
}

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
.mintedTop{ font-size: 12px; color: rgba(133,127,148,.90); font-weight: 600; }
.mintedNums{ font-size: 12px; color: rgba(242,242,243,.86); font-weight: 900; white-space: nowrap; }
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
.priceBlock .label{ font-size: 14px; color: rgba(242,242,243,.76); font-weight: 900; }
.priceBlock .priceLine{ display:flex; align-items:baseline; gap: 10px; margin-top: 6px; }
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
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
}
.primaryCta:hover{ background: rgb(var(--button-primary-hover)); }
.primaryCta:disabled{opacity:.55; cursor:not-allowed}
.primaryCta.notBold{ font-weight: 800; }

.pinkSpinner{
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid rgba(255,255,255,.22);
  border-top-color: rgb(var(--brand));
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

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

/* responsive layout */
@media (max-width: 1050px){
  .mainGrid{ grid-template-columns: 1fr; }
  .panel{ position: static; top: auto; }
  .mintedBox{ min-width: 0; }
  .mintDesktop{ display:none; }
  .mintMobile{ display:block; }
}

/* tablet sizing */
@media (max-width: 1024px){
  :root{ --nav-h: 56px; }
  .page{ padding-top: var(--nav-h); }
  .headerBar{ height: var(--nav-h); min-height: var(--nav-h); }
  .meLogoSvg{ width: 160px; }
  .btnSecondary{ height: 38px; padding: 0 12px; }
  .btnPrimary{ height: 38px; min-width: 110px; padding: 0 12px; font-size: 12px; }
  .iconBtn{ width: 38px; height: 38px; }
}

/* phone sizing */
@media (max-width: 640px){
  :root{ --nav-h: 48px; }
  .page{ padding-top: var(--nav-h); }
  .headerBar{ height: var(--nav-h); min-height: var(--nav-h); }
  .nav{ padding: 0 var(--nav-pad-x-m); gap: 8px; }
  .meLogoSvg{ width: 145px; }
}

/* ===== Right stack ===== */
.rightStack{
  display:flex;
  flex-direction:column;
  gap: 14px;
}

/* ===== stages ===== */
.stagesWrap{
  padding: 14px;
  border-radius: 14px;
  background: rgb(21 17 29 / 1);
  border: 1px solid rgb(var(--borderColor-primary));
}
.stagesList{ display:flex; flex-direction:column; gap: 12px; }

.stageCard{
  position: relative;
  border-radius: 12px;
  border: 1px solid rgb(var(--borderColor-primary));
  background: rgba(255,255,255,.03);
  padding: 12px;
  overflow: hidden;
}
.stageCard.active{
  background: rgb(27 22 36 / 1);
  border-color: rgb(var(--borderColor-interactive-hover));
}
.stageOverlay{
  position:absolute;
  inset: 0;
  background: rgb(21 17 29 / .72);
  border-radius: 12px;
  z-index: 2;
}
.stageTop{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
}
.stageLeft{ display:flex; align-items:center; gap: 10px; min-width: 0; }
.stageTag{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgb(var(--borderColor-interactive));
  font-weight: 900;
  font-size: 12px;
  color: rgba(242,242,243,.92);
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stageRight{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap: 10px;
  flex-wrap: nowrap;
  text-transform: uppercase;
  font-weight: 900;
  font-size: 12px;
}
.stageEnded{ color: rgba(133,127,148,.95); font-size: 11px; }
.stageEnds{ color: rgba(242,242,243,.90); font-size: 11px; }

/* active header: Eligible + Public + timer in one row */
.stageTopActive{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
}
.stageTopActiveLeft{
  display:flex;
  align-items:center;
  gap: 12px;
  min-width: 0;
}
.eligMini{
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
.publicMini{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  color: rgba(242,242,243,.72);
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
}
.publicMiniDot{
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgb(var(--textColor-positive));
  box-shadow: 0 0 10px rgb(var(--textColor-positive) / .18);
}
.stageCountdown{
  display:flex;
  align-items:center;
  gap: 6px;
}
.stageChip{
  width: 42px;
  height: 32px;
  border-radius: 10px;
  background: rgba(0,0,0,.22);
  border: 1px solid rgb(var(--borderColor-primary));
  display:flex;
  align-items:center;
  justify-content:center;
  font-family: var(--mono);
  font-weight: 900;
  font-size: 12px;
}

/* stats */
.stageStats{
  margin-top: 10px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: 10px;
  font-size: 12px;
  color: rgba(242,242,243,.70);
}
.stageStatsLeft{
  display:flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items:center;
}
.statRow{
  display:flex;
  gap: 6px;
  align-items:center;
}
.statKey{ color: rgba(133,127,148,.95); font-weight: 800; }
.statVal{ color: rgba(242,242,243,.88); font-weight: 900; }

/* ===== TOASTS ===== */
.toastHost{
  position: fixed;
  left: 0;
  right: 0;
  bottom: 16px;
  z-index: 20000;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  pointer-events: none;
  padding: 0 16px;
}
.toastStack{
  width: 100%;
  max-width: 520px;
  display:flex;
  flex-direction:column;
  gap: 10px;
}
.toast{
  pointer-events: auto;
  background: rgba(15, 13, 26, .82);
  border: 1px solid rgba(234, 65, 65, .35);
  box-shadow: 0 18px 60px rgba(0,0,0,.55);
  border-radius: 14px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transform: translateY(14px);
  opacity: 0;
  animation: toastIn .22s ease forwards;
}
@keyframes toastIn{
  to { transform: translateY(0); opacity: 1; }
}
.toast.closing{
  animation: toastOut .22s ease forwards;
}
@keyframes toastOut{
  to { transform: translateY(14px); opacity: 0; }
}
.toastInner{
  padding: 12px 12px;
  display:flex;
  gap: 10px;
  align-items:flex-start;
}
.toastDot{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgb(var(--textColor-negative));
  box-shadow: 0 0 18px rgba(234, 65, 65, .18);
  margin-top: 4px;
  flex: 0 0 auto;
}
.toastText{
  flex: 1;
  font-size: 13px;
  line-height: 1.45;
  color: rgba(242,242,243,.90);
  padding-right: 6px;
}
.toastTitle{
  font-weight: 900;
  margin-bottom: 4px;
}
.toastMsg{
  color: rgba(242,242,243,.78);
}
.toastClose{
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgb(var(--borderColor-interactive));
  background: rgba(255,255,255,.05);
  color: rgba(242,242,243,.85);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition: background .12s ease, opacity .12s ease;
}
.toastClose:hover{ background: rgba(255,255,255,.08); }
.toastClose:active{ opacity: .9; }

/* ===== LIGHTBOX ===== */
.lightbox{
  position: fixed;
  inset: 0;
  z-index: 30000;
  background: rgba(0,0,0,.22);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 18px;
  animation: lbIn .18s ease forwards;
}
@keyframes lbIn{ from{ opacity:0 } to{ opacity:1 } }

/* ✅ делаем контейнер "по контенту", а не огромный блок */
.lightboxInner{
  position: relative;
  width: auto;
  height: auto;
  max-width: min(1040px, 100%);
  max-height: min(92vh, 980px);
  display:flex;
  align-items:center;
  justify-content:center;
}

/* ✅ картинка не перекрывает элементы, просто картинка */
.lightboxImg{
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display:block;
  background: transparent;
  filter: drop-shadow(0 22px 80px rgba(0,0,0,.55));
}

/* ✅ КНОПКА ЗАКРЫТИЯ ПОВЕРХ ВСЕГО (исправляет "перекрывает фото") */
.lbClose{
  position: fixed;
  right: 18px;
  top: 18px;
  z-index: 30010;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.22);
  background: rgba(0,0,0,.35);
  color: rgba(242,242,243,.95);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* reduce motion */
@media (prefers-reduced-motion: reduce){
  .toast, .toast.closing, .lightbox{ animation: none !important; transform: none !important; opacity: 1 !important; }
  .pinkSpinner{ animation: none !important; }
}

/* ===== FOOTER ===== */
.footerWrap{
  max-width: 1240px;
  margin: 26px auto 0;
  padding: 0 18px 44px;
}
.footerInner{
  padding-top: 18px;
}
.footerHr{
  height: 1px;
  width: 100%;
  background: rgb(var(--borderColor-primary));
  border: none;
  margin: 0;
}
.footerText{
  padding-top: 18px;
  padding-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 12px;
  line-height: 1.55;
  color: rgb(var(--textColor-secondary) / .92);
}
.footerText p{ margin: 0; }

/* ===== GLOBAL TOOLBAR (bottom) ===== */
.bottomToolbar{
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  z-index: 12000;
  background: rgb(21 17 29 / 1);
  border-top: 1px solid rgb(var(--borderColor-primary));
}

@media (max-width: 767px){
  .bottomToolbar{ display: none; }
}

.toolbarInner{
  height: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toolbarLeft,
.toolbarRight{
  height: 100%;
  display: flex;
  align-items: center;
  gap: 0;
}

.toolbarGroup{
  height: 100%;
  display: flex;
  align-items: center;
}

.toolbarDivider{
  height: 100%;
  width: 1px;
  background: rgb(var(--borderColor-primary));
  opacity: 1;
  margin: 0 12px;
}

.toolbarPrice{
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;
  padding: 0 10px;
}

.toolbarPriceText{
  font-size: 12px;
  font-weight: 800;
  color: rgba(242,242,243,.92);
  white-space: nowrap;
}

.tbIconBtn{
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: rgb(var(--button-secondary));
  color: rgba(242,242,243,.92);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity .12s ease, background .12s ease;
}

.tbIconBtn:hover{ opacity: .86; background: rgb(var(--button-secondary-hover)); }

.tbIconBtn.active{
  background: rgb(var(--button-secondary));
  border-color: rgb(var(--borderColor-interactive));
}

.tbIconBtn svg{ display:block; }

.tbSupport{
  height: 100%;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: rgb(var(--textColor-secondary));
  transition: background .12s ease, opacity .12s ease;
  border-radius: 10px;
}

.tbSupport:hover{
  background: rgba(255,255,255,.04);
  opacity: .9;
}

.tbSupport span{
  font-size: 12px;
  font-weight: 800;
  color: rgba(242,242,243,.75);
  white-space: nowrap;
}
`;

function shortAddr(a) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatCountdownParts(ms) {
  const clamped = Math.max(0, ms);
  const totalSec = Math.floor(clamped / 1000);

  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  return [`${pad2(d)}d`, `${pad2(h)}h`, `${pad2(m)}m`, `${pad2(s)}s`];
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
      <path d="M18.2002 17.5L14.5752 13.875" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockSvg16() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path stroke="none" d="M0 0h24v24H0z"></path>
      <rect width="14" height="10" x="5" y="11" rx="2"></rect>
      <circle cx="12" cy="16" r="1"></circle>
      <path d="M8 11V7a4 4 0 018 0v4"></path>
    </svg>
  );
}

/**
 * ✅ НОВАЯ ИКОНКА "ОТКРЫТЬ ИЗОБРАЖЕНИЕ"
 * - квадратная (не "широкая")
 * - понятная: мини-картинка + стрелка "вылетает"
 */
function OpenImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 17V7h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 7l10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}



function GlobeIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ExternalLinkIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" color="currentColor" width={size} height={size} aria-hidden="true">
      <path
        d="M13.5 6.5L13.4994 2.50062L9.5 2.5M8.5 7.5L13.5 2.5M11.5 8.5V13C11.5 13.1326 11.4473 13.2598 11.3536 13.3536C11.2598 13.4473 11.1326 13.5 11 13.5H3C2.86739 13.5 2.74021 13.4473 2.64645 13.3536C2.55268 13.2598 2.5 13.1326 2.5 13V5C2.5 4.86739 2.55268 4.74021 2.64645 4.64645C2.74021 4.55268 2.86739 4.5 3 4.5H7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}

function XIcon({ size = 20 }) {
  return (
    <svg viewBox="0 0 20 21" fill="none" width={size} height={size} aria-hidden="true">
      <path
        d="M11.3032 9.42806L16.4029 3.5H15.1945L10.7663 8.64725L7.2296 3.5H3.15039L8.49863 11.2836L3.15039 17.5H4.35894L9.03516 12.0644L12.7702 17.5H16.8494L11.3029 9.42806H11.3032ZM9.6479 11.3521L9.10601 10.5771L4.7944 4.40978H6.65066L10.1302 9.38698L10.6721 10.162L15.195 16.6316H13.3388L9.6479 11.3524V11.3521Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" width="20" height="20" aria-hidden="true">
      <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,a1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,a1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137,a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0,a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16,a1.884,1.884,0,0,1-.162,3.126,a301.407,301.407,0,0,1-45.89,21.83,a1.875,1.875,0,0,0-1,2.611,a391.055,391.055,0,0,0,30.014,48.815,a1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729,a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
    </svg>
  );
}

function MagicEdenLogo() {
  return (
    <svg viewBox="0 0 176 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="meLogoSvg" aria-label="Magic Eden" role="img">
      <path
        d="M23.5949 5.09192L25.5453 7.38358C25.7686 7.64098 25.9666 7.85271 26.0467 7.97311C26.63 8.55281 26.957 9.33628 26.9566 10.1527C26.9018 11.1158 26.2741 11.7718 25.6928 12.4734L24.3279 14.0759L23.616 14.9062C23.5904 14.9349 23.574 14.9702 23.5686 15.008C23.5632 15.0458 23.5692 15.0842 23.5858 15.1187C23.6024 15.1531 23.6288 15.182 23.6619 15.2018C23.695 15.2216 23.7332 15.2314 23.7718 15.2301H30.887C31.9738 15.2301 33.3429 16.1434 33.2629 17.53C33.2607 18.1603 33.0056 18.7641 32.5534 19.2097C32.1012 19.6554 31.4885 19.9067 30.849 19.9089H19.7067C18.9737 19.9089 17.0021 19.9878 16.4503 18.3064C16.3329 17.955 16.3169 17.5785 16.404 17.2187C16.5644 16.6866 16.8181 16.1864 17.1538 15.7407C17.7141 14.9104 18.3207 14.0801 18.9189 13.2747C19.6898 12.2202 20.4818 11.1989 21.2611 10.1236C21.2888 10.0886 21.3038 10.0455 21.3038 10.0011C21.3038 9.95678 21.2888 9.91368 21.2611 9.87868L18.4302 6.55742C18.4118 6.53334 18.3879 6.51381 18.3605 6.50037C18.3331 6.48692 18.3029 6.47992 18.2723 6.47992C18.2416 6.47992 18.2114 6.48692 18.184 6.50037C18.1566 6.51381 18.1327 6.53334 18.1143 6.55742C17.356 7.56625 14.0365 12.0333 13.3287 12.9384C12.621 13.8434 10.877 13.8932 9.9123 12.9384L5.48484 8.55848C5.45655 8.53051 5.42048 8.51145 5.38119 8.50372C5.3419 8.49599 5.30117 8.49994 5.26416 8.51506C5.22715 8.53019 5.19553 8.5558 5.17332 8.58866C5.15111 8.62152 5.1393 8.66015 5.1394 8.69963V17.1232C5.14982 17.7209 4.97021 18.3069 4.62573 18.799C4.28125 19.2911 3.78917 19.6647 3.21844 19.8674C2.85377 19.9924 2.46403 20.0298 2.08173 19.9763C1.69943 19.9228 1.33565 19.78 1.02071 19.5598C0.70578 19.3396 0.448823 19.0484 0.271268 18.7105C0.0937132 18.3726 0.000705322 17.9977 0 17.6172V2.47228C0.0253814 1.92649 0.224654 1.40247 0.569503 0.974675C0.914352 0.546881 1.38723 0.237072 1.92096 0.0892728C2.37877 -0.0309286 2.8607 -0.0297259 3.31789 0.0927586C3.77508 0.215243 4.1913 0.454656 4.52436 0.786737L11.332 7.50398C11.3523 7.52438 11.377 7.54012 11.4042 7.55008C11.4315 7.56003 11.4606 7.56396 11.4895 7.56158C11.5185 7.55921 11.5465 7.55058 11.5717 7.53632C11.5969 7.52206 11.6186 7.50252 11.6353 7.47907L16.4714 0.882224C16.6948 0.614417 16.975 0.397995 17.2923 0.248114C17.6096 0.0982325 17.9562 0.0185155 18.3081 0.0145452H30.887C31.2312 0.0151045 31.5714 0.0880957 31.8847 0.228638C32.198 0.369181 32.4773 0.574035 32.7038 0.829499C32.9303 1.08496 33.0988 1.38515 33.1982 1.70998C33.2975 2.03481 33.3253 2.37679 33.2797 2.71307C33.1911 3.2964 32.8908 3.82825 32.4345 4.20997C31.9782 4.59169 31.3969 4.79737 30.7985 4.78885H23.755C23.7196 4.7897 23.6851 4.79989 23.655 4.81835C23.625 4.83681 23.6005 4.86287 23.5842 4.89382C23.5678 4.92477 23.5602 4.95947 23.5621 4.99431C23.564 5.02915 23.5753 5.06286 23.5949 5.09192Z"
        fill="rgb(var(--brand))"
      />
      <text x="40" y="14" fill="rgb(var(--textColor-primary))" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="12" letterSpacing=".2">
        MAGIC EDEN
      </text>
    </svg>
  );
}

function SocialLinks() {
  return (
    <div className="socialLinks" aria-label="Social links">
      <a className="socialLink" href={LINKS.website} target="_blank" rel="noreferrer noopener" title="Website">
        <GlobeIcon />
      </a>
      <a className="socialLink" href={LINKS.x} target="_blank" rel="noreferrer noopener" title="X">
        <XIcon size={20} />
      </a>
      <a className="socialLink" href={LINKS.discord} target="_blank" rel="noreferrer noopener" title="Discord">
        <DiscordIcon />
      </a>
    </div>
  );
}

function ensureViewportMeta() {
  const content = "width=device-width, initial-scale=1, viewport-fit=cover";
  let meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "viewport");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

export default function App() {
  // Anchor time (stored once; does not reset on reload)
  const deployAnchorTs = useMemo(() => getDeployAnchorTs(), []);

  const [account, setAccount] = useState(null);
  const [qty, setQty] = useState(1);
  const [txHash, setTxHash] = useState(null);

  const [status, setStatus] = useState("idle"); // idle | sending | success
  const [chainId, setChainId] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchRowOpen, setSearchRowOpen] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef(new Map());

  const pushToast = (message, title = "Error") => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [{ id, title, message, closing: false }, ...prev].slice(0, 3));

    const t = window.setTimeout(() => closeToast(id), 5000);
    toastTimers.current.set(id, t);
  };

  const closeToast = (id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, closing: true } : t)));
    const existing = toastTimers.current.get(id);
    if (existing) window.clearTimeout(existing);
    toastTimers.current.delete(id);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 240);
  };

  useEffect(() => {
    ensureViewportMeta();
  }, []);

  /** ===== Minted progress (dynamic, from deploy anchor) ===== */
  const [mintedNow, setMintedNow] = useState(() => calcMintedNow(deployAnchorTs));

  useEffect(() => {
    const t = window.setInterval(() => setMintedNow(calcMintedNow(deployAnchorTs)), 1000);
    return () => window.clearInterval(t);
  }, [deployAnchorTs]);

  const mintedPercent = useMemo(() => {
    if (!MAX_SUPPLY) return 0;
    const pct = (mintedNow / MAX_SUPPLY) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [mintedNow]);

  /** ===== Countdown: from deploy anchor ===== */
  const publicEndsAt = useMemo(() => calcPublicEndsAt(deployAnchorTs), [deployAnchorTs]);
  const [countdownParts, setCountdownParts] = useState(() => formatCountdownParts(publicEndsAt - Date.now()));

  useEffect(() => {
    const t = setInterval(() => setCountdownParts(formatCountdownParts(publicEndsAt - Date.now())), 250);
    return () => clearInterval(t);
  }, [publicEndsAt]);

  // Breakpoints
  const [mode, setMode] = useState(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    if (w <= 640) return "mobile";
    if (w <= 1024) return "tablet";
    return "desktop";
  });

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const next = w <= 640 ? "mobile" : w <= 1024 ? "tablet" : "desktop";
      setMode(next);
      setMenuOpen(false);
      setSearchRowOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = mode === "mobile";
  const isTablet = mode === "tablet";
  const isDesktop = mode === "desktop";

  const itemWei = useMemo(() => parseEther(PRICE_PER_ITEM_ETH), []);
  const totalWei = useMemo(() => itemWei * BigInt(qty), [itemWei, qty]);

  const eligible = !!account;
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID_DEC; // internal check

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
      setTxHash(null);

      if (!window.ethereum) {
        pushToast("Wallet not found. Open this site in a browser with MetaMask installed.");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());

      const net = await provider.getNetwork();
      setChainId(net.chainId);
    } catch (e) {
      pushToast(e?.message ?? String(e));
    }
  };

  const switchNetwork = async () => {
    try {
      if (!window.ethereum) {
        pushToast("Wallet not found. Please install MetaMask.");
        return;
      }

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
                chainName: "Test Network",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
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
      pushToast(e?.message ?? String(e));
    }
  };

  const buy = async () => {
    try {
      setTxHash(null);

      if (!window.ethereum) throw new Error("Wallet not found.");
      if (!account) throw new Error("Please connect your wallet first.");
      if (!accepted) throw new Error("Please accept the Terms to continue.");

      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setChainId(network.chainId);

      if (network.chainId !== SEPOLIA_CHAIN_ID_DEC) {
        throw new Error("Wrong network. Please switch network in your wallet.");
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
      pushToast(e?.shortMessage ?? e?.message ?? String(e));
    }
  };

  const mintFeeEth = useMemo(() => (0.003 * (Number(qty) || 0)).toFixed(3), [qty]);
  const protocolFeeEth = useMemo(() => (0.0014 * (Number(qty) || 0)).toFixed(4), [qty]);

  const canMint = !!account && isCorrectNetwork && accepted && status !== "sending";

  const MintPanel = ({ mobile = false }) => (
    <div className={`panel ${mobile ? "panelMobile" : ""}`}>
      <div className="panelInner">
        <div className="metaRow">
          <div className="metaLeft">
            <div className="metaLine">
              <div className="eligPill">
                {!eligible && (
                  <span className="eligLockIcon" aria-hidden="true">
                    <LockSvg16 />
                  </span>
                )}
                <span>{eligible ? "Eligible" : "Not eligible"}</span>
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
                {mintedPercent.toFixed(1)}%&nbsp;&nbsp; {mintedNow} / {MAX_SUPPLY}
              </div>
            </div>

            <div className="mintedBar" aria-label="minted progress" style={{ ["--pct"]: `${mintedPercent}%` }}>
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
            <button type="button" className="stepBtn" onClick={() => setQty((v) => Math.max(1, Number(v) - 1))} disabled={qty <= 1}>
              −
            </button>
            <div className="stepVal">{qty}</div>
            <button type="button" className="stepBtn" onClick={() => setQty((v) => Math.min(20, Number(v) + 1))} disabled={qty >= 20}>
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

          <div style={{ marginTop: 6, color: "rgb(var(--textColor-secondary) / .85)" }}>Subtotal</div>
          <div style={{ marginTop: 6 }} className="r">
            {formatEther(totalWei)} ETH
          </div>
        </div>

        <div className="terms">
          <input className="cb" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <div>
            By clicking “Mint”, you agree to the Terms of Service.
          </div>
        </div>

        <button
          type="button"
          className={`primaryCta ${account ? "" : "notBold"}`}
          onClick={account ? buy : connect}
          disabled={account ? !canMint : status === "sending"}
        >
          {status === "sending" && <span className="pinkSpinner" aria-hidden="true" />}
          {account ? (status === "sending" ? "Confirming…" : "Mint") : "Connect wallet to mint"}
        </button>


        {txHash && (
          <div className="txBox">
            <div>
              Tx: <span style={{ fontFamily: "var(--mono)" }}>{shortAddr(txHash)}</span>
            </div>
            <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
              View on explorer →
            </a>
          </div>
        )}
      </div>
    </div>
  );

  const MintStages = () => (
    <div className="stagesWrap">
      <div className="stagesList">
        {MINT_STAGES.map((s) => {
          const isActive = !s.ended && s.tag === "Public";
          return (
            <div key={s.tag} className={`stageCard ${!s.ended ? "active" : ""}`}>
              {s.ended && <div className="stageOverlay" />}

              {isActive ? (
                <div className="stageTopActive">
                  <div className="stageTopActiveLeft">
                    <div className="eligMini">
                      {!eligible && (
                        <span style={{ display: "inline-flex", alignItems: "center", opacity: 0.92 }} aria-hidden="true">
                          <LockSvg16 />
                        </span>
                      )}
                      <span>{eligible ? "Eligible" : "Not eligible"}</span>
                    </div>

                    <div className="publicMini">
                      <span className="publicMiniDot" />
                      <span>Public</span>
                    </div>
                  </div>

                  <div className="stageRight">
                    <span className="stageEnds">Ends</span>
                    <div className="stageCountdown">
                      {countdownParts.map((t) => (
                        <span key={t} className="stageChip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="stageTop">
                  <div className="stageLeft">
                    <div className="stageTag">
                      <span>{s.tag}</span>
                    </div>
                  </div>

                  <div className="stageRight">{s.ended ? <span className="stageEnded">Ended</span> : <span className="stageEnds">Ends</span>}</div>
                </div>
              )}

              <div className="stageStats">
                <div className="stageStatsLeft">
                  <div className="statRow">
                    <span className="statKey">Mint limit:</span>
                    <span className="statVal">{s.mintLimit}</span>
                  </div>

                  <div className="statRow">
                    <span className="statKey">Price:</span>
                    <span className="statVal">
                      {s.price} <span style={{ color: "rgba(133,127,148,.95)", fontWeight: 800 }}>{s.currency}</span>
                    </span>
                  </div>

                  {typeof s.minted === "number" && (
                    <div className="statRow">
                      <span className="statKey">Minted:</span>
                      <span className="statVal">{s.minted}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Navbar
  const renderDesktop = () => (
    <>
      <div className="navLinks" aria-label="Primary navigation">
        <a className="navLink" href={LINKS_ME.play} target="_blank" rel="noreferrer noopener">
          Play
        </a>
        <a className="navLink" href={LINKS_ME.trade} target="_blank" rel="noreferrer noopener">
          Trade
        </a>
        <a className="navLink" href={LINKS_ME.mint} target="_blank" rel="noreferrer noopener">
          Mint
        </a>
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
        <a className="btnSecondary" href={LINKS_ME.buybacks} target="_blank" rel="noreferrer noopener">
          Buybacks
        </a>

        <a className="btnSecondary" href={LINKS_ME.rewards} target="_blank" rel="noreferrer noopener">
          Rewards
        </a>

        <button type="button" className="btnPrimary" onClick={connect}>
          {account ? shortAddr(account) : "Log in"}
        </button>
      </div>
    </>
  );

  const renderTablet = () => (
    <>
      <div className="navSearch" style={{ paddingLeft: 12, paddingRight: 12 }}>
        <div className="searchWrap" role="search">
          <div className="searchLeft" aria-hidden="true">
            <SearchIcon />
          </div>
          <input className="searchInput" placeholder="Search collections" />
          <div className="searchRight" aria-hidden="true" style={{ paddingRight: 10, opacity: 0.0 }} />
        </div>
      </div>

      <div className="navRight">
        <button type="button" className="btnSecondary">
          Buybacks
        </button>
        <button type="button" className="btnSecondary">
          Rewards
        </button>
        <button type="button" className="btnPrimary" onClick={connect}>
          {account ? shortAddr(account) : "Log in"}
        </button>
        <button type="button" className="iconBtn" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" title="Menu">
          ☰
        </button>
      </div>
    </>
  );

  const renderMobile = () => (
    <>
      <div className="navRight">
        <button type="button" className="iconGhost" aria-label="Search" title="Search" onClick={() => setSearchRowOpen((v) => !v)}>
          <SearchIcon />
        </button>

        <button type="button" className={`btnPrimary btnPrimaryMobile`} onClick={connect}>
          {account ? shortAddr(account) : "Log in"}
        </button>

        <button type="button" className="iconBtn iconBtnSmall" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" title="Menu">
          ☰
        </button>
      </div>
    </>
  );

  // Lightbox close via ESC
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

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
            </div>

            {isDesktop && renderDesktop()}
            {isTablet && renderTablet()}
            {isMobile && renderMobile()}
          </nav>
        </header>

        {isMobile && searchRowOpen && (
          <div className="mobileSearchRow">
            <div className="mobileSearchWrap">
              <input className="mobileSearchInput" placeholder="Search collections (UI only)" />
            </div>
          </div>
        )}

        {menuOpen && (isTablet || isMobile) && (
          <div className="mobileMenu">
            <a className="mobileItem" href={LINKS_ME.play} target="_blank" rel="noreferrer noopener">
              Play
            </a>
            <a className="mobileItem" href={LINKS_ME.trade} target="_blank" rel="noreferrer noopener">
              Trade
            </a>
            <a className="mobileItem" href={LINKS_ME.mint} target="_blank" rel="noreferrer noopener">
              Mint
            </a>

            {isMobile && (
              <>
                <a className="mobileItem" href={LINKS_ME.buybacks} target="_blank" rel="noreferrer noopener">
                  Buybacks
                </a>
                <a className="mobileItem" href={LINKS_ME.rewards} target="_blank" rel="noreferrer noopener">
                  Rewards
                </a>
              </>
            )}
          </div>
        )}
      </div>

      <div className="shell">
        <div className="heroRow">
          <div className="heroLeft">
            <div className="chainBadge">ETH</div>
            <div className="title">Meta Racing Pilots</div>
          </div>

          <div className="heroRight">
            <a className="btnSecondary contractBtn" href={LINKS.contract} target="_blank" rel="noreferrer noopener" title="Contract">
              <span>Contract</span>
              <ExternalLinkIcon size={20} />
            </a>

            <SocialLinks />
          </div>
        </div>

        <div className="mainGrid">
          {/* LEFT */}
          <div className="mediaCard">
            <div className="mediaWrap">
              <div className="mediaMain">
                <img src={IMAGES[activeThumb]} alt="Preview" className="mainImg" />

                <button
                  type="button"
                  className="fullscreenBtn"
                  title="Open image"
                  aria-label="Open image"
                  onClick={() => setLightboxOpen(true)}
                >
                  <OpenImageIcon />
                </button>
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

            {/* MOBILE: mint + stages under it */}
            <div className="mintMobile">
              <div className="rightStack">
                <MintPanel mobile />
                <MintStages />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="descWrap">
              <div className="layerBox">
                <div className="layerBoxInner">
                  <div className="sectionTitle">Overview</div>

                  <p className="p">
                    Meta Racing Pilots is a playable PFP NFT collection where each Pilot defines race strategy and enhances car performance. A Pilot is a necessary asset for entering races and plays a key role in determining the outcome of every competition.
                  </p>

                  <p className="p">
                    <span className="brandStrong">The Role of Pilots in Gameplay</span>
                  </p>

                  <p className="p">In Meta Racing, the Pilot acts as the strategic core of each race:</p>
                  <ol className="list">
                    <li className="li">Determines strategic buffs and performance boosts during races</li>
                    <li className="li">Significantly influences the car’s overall performance</li>
                    <li className="li">Required to participate in any race</li>
                  </ol>

                  <p className="p">Without a Pilot, cars cannot enter the track, making each Pilot essential to gameplay.</p>

                  <p className="p">
                    <span className="brandStrong">RPG Progression &amp; Custom Builds</span>
                  </p>

                  <p className="p">Every Pilot is unique and develops through an RPG-style progression system:</p>
                  <ol className="list">
                    <li className="li">Free allocation of skill points to create custom builds</li>
                    <li className="li">Multiple strategic paths depending on playstyle</li>
                    <li className="li">Progression through races or a dedicated in-game academy</li>
                  </ol>

                  <p className="p">Pilot rarity defines starting attributes and the maximum progression cap, giving each Pilot a distinct long-term gameplay role.</p>

                  <p className="p">
                    <span className="brandStrong">Flexible Usage &amp; Team Play</span>
                  </p>

                  <p className="p">Pilots can be used in multiple ways within the Meta Racing ecosystem:</p>
                  <ol className="list">
                    <li className="li">Actively race and develop Pilots through gameplay</li>
                    <li className="li">Build balanced teams for different race formats</li>
                    <li className="li">Make Pilots available to other players when not in use</li>
                  </ol>

                  <p className="p">This flexibility supports a dynamic and evolving in-game environment.</p>

                  <p className="p">
                    <span className="brandStrong">The Meta Racing Ecosystem</span>
                  </p>

                  <p className="p">
                    The Meta Racing Pilots collection is built on The chain Solana and is available on an NFT marketplace, enabling fast transactions and easy access. Minting a Pilot is the first step toward shaping your racing strategy, developing your team, and progressing in the competitive world of Meta Racing.
                  </p>

                  <div className="h3">Utility</div>
                  <ol className="list">
                    <li className="li">
                      <span className="brandStrong">Necessary Gameplay Asset:</span> A Pilot is required to enter any race in Meta Racing and earn in races and tournaments
                    </li>
                    <li className="li">
                      <span className="brandStrong">Performance Boosts:</span> Pilots provide in-race buffs and attribute modifiers that directly affect car performance and races outcomes.
                    </li>
                    <li className="li">
                      <span className="brandStrong">RPG-Style Progression System:</span> Each Pilot can be upgraded with players freely allocating skill points to create custom builds and strategies.
                    </li>
                    <li className="li">
                      <span className="brandStrong">Rarity-Based Progression Depth:</span> Pilot rarity defines starting attributes and the maximum progression cap
                    </li>
                    <li className="li">
                      <span className="brandStrong">Team &amp; Roster Building:</span> Players can assemble balanced teams of Pilots optimized for different tracks, race formats, and strategic scenarios.
                    </li>
                    <li className="li">
                      <span className="brandStrong">Passive Utility via Rental:</span> When not actively racing, Pilots can be made available for use by other players, allowing owners to receive in-game token rewards.
                    </li>
                    <li className="li">
                      <span className="brandStrong">3+ NFT Pilots Holders:</span> 3+ NFT Pilots Holders will receive a free Car NFT on the game release.
                    </li>
                    <li className="li">
                      <span className="brandStrong">PFP:</span> Pilots are cool pfp and community NFT
                    </li>
                  </ol>

                  <div className="divider" />

                  <div className="sectionTitle">Meet the team</div>
                  <div className="teamGrid">
                    {TEAM.map((m) => (
                      <div key={m.name} className="teamCard">
                        <div className="teamImgWrap">
                          <img className="teamImg" src={m.img} alt={`${m.name} image`} />
                        </div>
                        <div className="teamBody">
                          <div>
                            <div className="teamName">{m.name}</div>
                            <div className="teamRole">{m.role}</div>
                          </div>
                          <div className="teamLinks">
                            {m.x ? (
                              <a className="xLink" href={m.x} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on X`} title="X">
                                <XIcon size={16} />
                              </a>
                            ) : (
                              <span style={{ height: 18 }} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* RIGHT (desktop mint + stages) */}
          <div className="rightCol mintDesktop">
            <div className="rightStack">
              <MintPanel />
              <MintStages />
            </div>
          </div>
        </div>
      </div>

      {/* TOASTS */}
      {toasts.length > 0 && (
        <div className="toastHost" aria-live="polite" aria-relevant="additions removals">
          <div className="toastStack">
            {toasts.map((t) => (
              <div key={t.id} className={`toast ${t.closing ? "closing" : ""}`}>
                <div className="toastInner">
                  <div className="toastDot" />
                  <div className="toastText">
                    <div className="toastTitle">{t.title}</div>
                    <div className="toastMsg">{t.message}</div>
                  </div>
                  <button type="button" className="toastClose" onClick={() => closeToast(t.id)} aria-label="Close">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightboxOpen(false)}>
          {/* ✅ close button FIXED + z-index выше — никогда не перекроется картинкой */}
          <button type="button" className="lbClose" onClick={() => setLightboxOpen(false)} aria-label="Close" title="Close">
            ✕
          </button>

          <div className="lightboxInner" onClick={(e) => e.stopPropagation()}>
            <img className="lightboxImg" src={IMAGES[activeThumb]} alt="Expanded preview" />
          </div>
        </div>
      )}


      {/* FOOTER */}
      <footer className="footerWrap" aria-label="Disclaimer">
        <div className="footerInner">
          <hr className="footerHr" />
          <div className="footerText">
            <p>
              Certain information has been prepared by third parties, including the Creator using Launchpad. Magic Eden is not affiliated with such third parties or the Creator, and is not responsible for the information provided on Launchpad. Such information is provided for informational purposes only and is in no way investment advice. Magic Eden is not liable for any errors, changes or amendments to such information, including any actions taken in reliance on such information. Magic Eden makes no representation on the accuracy, suitability, or validity of any information provided in relation to any NFT project that chooses to use Launchpad.
            </p>
            <p>
              By clicking “Mint”, I acknowledge that I am choosing to mint the NFT with the understanding that it may be worth significantly less than the mint price, and may end up being worth nothing at all.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

