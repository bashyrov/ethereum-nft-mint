import { useMemo, useState } from "react";
import { BrowserProvider, formatEther, parseEther } from "ethers";

const RECEIVER = "0x8A3F0f3De937Cf08D6A4144e945A354954F878E9";
const PRICE_PER_ITEM_ETH = "0.1"; // цена за 1 товар

export default function App() {
  const [account, setAccount] = useState(null);
  const [qty, setQty] = useState(1);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  // totalEth = 0.1 * qty без ошибок float (делаем через строковую арифметику)
  const totalEth = useMemo(() => {
    const q = Number(qty);
    if (!Number.isFinite(q) || q <= 0) return "0";
    const total = (q / 10).toString(); // т.к. 0.1 * q = q/10
    return total;
  }, [qty]);

  const totalWei = useMemo(() => {
    try {
      return parseEther(totalEth);
    } catch {
      return null;
    }
  }, [totalEth]);

  const connect = async () => {
    try {
      setError(null);
      setTxHash(null);

      if (!window.ethereum) {
        throw new Error("MetaMask не найден. Установи расширение MetaMask.");
      }

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
    } catch (e) {
      setError(e?.message ?? String(e));
    }
  };

  const checkReceiver = async () => {
    try {
      setError(null);

      if (!window.ethereum) {
        throw new Error("MetaMask не найден. Установи расширение MetaMask.");
      }

      const provider = new BrowserProvider(window.ethereum);
      const code = await provider.getCode(RECEIVER);

      alert(
        code === "0x"
          ? "Receiver is EOA (обычный кошелёк)"
          : "Receiver is CONTRACT (может не принимать ETH)"
      );
    } catch (e) {
      setError(e?.message ?? String(e));
    }
  };
  const switchToSepolia = async () => {
    try {
      setError(null);

      if (!window.ethereum) throw new Error("MetaMask не найден.");

      // Sepolia chainId = 11155111 = 0xAA36A7
      const sepoliaChainId = "0xAA36A7";

      try {
        // 1) пробуем просто переключить сеть
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: sepoliaChainId }],
        });
      } catch (switchError) {
        // 2) если сети нет — добавляем
        if (switchError?.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: sepoliaChainId,
                chainName: "Sepolia",
                nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    } catch (e) {
      setError(e?.message ?? String(e));
    }
  };

  const buy = async () => {
    try {
      setError(null);
      setTxHash(null);

      if (!window.ethereum) throw new Error("MetaMask не найден.");
      if (!account) throw new Error("Сначала нажми Connect wallet.");
      if (!totalWei) throw new Error("Некорректная сумма.");

      const q = Number(qty);
      if (!Number.isInteger(q) || q < 1 || q > 100) {
        throw new Error("Количество должно быть целым числом от 1 до 100.");
      }

      const provider = new BrowserProvider(window.ethereum);

      // ✅ проверка сети
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        throw new Error("Переключись в MetaMask на сеть Sepolia (тест).");
      }

      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: RECEIVER,
        value: totalWei,
        gasLimit: 21000n, // ✅ фиксируем газ для обычного перевода
      });

      setTxHash(tx.hash);
      await tx.wait();
    } catch (e) {
      setError(e?.shortMessage ?? e?.message ?? String(e));
  }
  };


  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2>Shop (Single item)</h2>

      <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <p>
          <b>Receiver:</b>{" "}
          <code>{RECEIVER.slice(0, 8)}…{RECEIVER.slice(-6)}</code>
        </p>

        <p>
          <b>Price per item:</b> {PRICE_PER_ITEM_ETH} ETH
        </p>

        {!account ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={connect}>Connect wallet</button>
            <button onClick={checkReceiver} style={{ marginLeft: 10 }}>
              Check receiver
            </button>
          </div>
        ) : (
            <div>
              <p>
                Connected: <b>{account.slice(0, 6)}…{account.slice(-4)}</b>
              </p>
              <button onClick={checkReceiver}>Check receiver</button>
              <button onClick={switchToSepolia} style={{marginLeft: 10}}>
                Switch to Sepolia
              </button>
            </div>
        )}

        <label style={{display: "block", marginTop: 12}}>
          Quantity:
          <input
            type="number"
            min={1}
            max={100}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            style={{ marginLeft: 10, width: 120 }}
          />
        </label>

        <p style={{ marginTop: 12 }}>
          <b>Total:</b> {totalWei ? `${formatEther(totalWei)} ETH` : "—"}
        </p>

        <button
          onClick={buy}
          disabled={!account || !totalWei}
          style={{ marginTop: 10 }}
        >
          Buy
        </button>

        {txHash && (
          <p style={{ marginTop: 12 }}>
            Tx hash: <code>{txHash}</code>
          </p>
        )}

        {error && (
          <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: 14, opacity: 0.8 }}>
        Для теста переключись в MetaMask на сеть <b>Sepolia</b> и пополни тестовый
        ETH через faucet.
      </p>
    </div>
  );
}
