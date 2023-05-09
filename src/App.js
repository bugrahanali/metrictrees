import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  // State değişkenlerini tanımla
  const contractAddress = "0x0f2D719407FdBeFF09D87557AbB7232601FD9F29";
  const apiKey = "9JHC1C7QSPWYDVTD28FGT2V8EWPBHQKPSJ";
  const [startBlock, setStartBlock] = useState(13308178);
  const [allTransactions, setAllTransactions] = useState([]);

  // Son işlemleri Etherscan API'sinden al
  const getLatestTransactions = async (contractAddress, apiKey, startBlock) => {
    try {
      const response = await axios.get(
        `http://api-cn.etherscan.com/api?module=account&action=tokentx&contractaddress=${contractAddress}&apikey=${apiKey}&startBlock=${startBlock}`
      );

      if (response.status === 200) {
        return response.data;
      } else {
        console.error(`Error: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

  // İşlemleri bir dosyaya kaydet ve indir
  const saveTransactionsToFile = (transactions) => {
    const fileName = "transactions.txt";
    const fileContent = JSON.stringify(transactions, null, 2);

    const fileBlob = new Blob([fileContent], {
      type: "text/plain;charset=utf-8",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(fileBlob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // İşlemleri güncelle ve tüm işlemler listesine ekle
  const updateTransactions = async () => {
    const latestTransactions = await getLatestTransactions(
      contractAddress,
      apiKey,
      startBlock
    );

    if (latestTransactions && latestTransactions.result.length > 0) {
      const timestamp = new Date();
      console.log(
        `${timestamp.toLocaleTimeString()} - Yeni grup işlem oluşturuldu ve dosyaya yazdırıldı:`,
        latestTransactions.result
      );

      // Tüm işlemleri güncelleyin
      setAllTransactions((prevTransactions) => [
        ...prevTransactions,
        ...latestTransactions.result,
      ]);

      // En büyük blok numarasını güncelleyin, böylece bir sonraki istekte yeni işlemleri alırsınız
      const latestBlock = Math.max(
        ...latestTransactions.result.map((tx) => parseInt(tx.blockNumber))
      );
      setStartBlock(latestBlock + 1);
    }
  };

  // Zamanlayıcıyı kullanarak dakikada bir işlemleri güncelle
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateTransactions();
    }, 60000); // 1 dakikada bir güncelle

    // Bileşen temizlendiğinde zamanlayıcıyı temizle
    return () => clearInterval(intervalId);
  }, [startBlock]);

  // İşlemleri indirmek için bir düğme içeren bileşeni döndür

  return (
    <div>
      <button onClick={() => saveTransactionsToFile(allTransactions)}>
        İşlemleri İndir
      </button>
    </div>
  );
};

export default App;
