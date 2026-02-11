const contractAddress = "0x7Bbc1F9E0F8B7e0F3d9B4aF1F6d0C6e3b8c7D2eA";

const contractABI = [
    "function getSeason() view returns (string)",
    "function setSeason(string memory _season)",
    "function updateCount() view returns (uint256)",
    "function lastUpdatedBy() view returns (address)",
    "function getLastSeasons() view returns (string[5], address[5])",
    "event SeasonUpdated(string newSeason, address indexed updatedBy)"
];

let provider, signer, contract;

async function connectWallet() {
    if (!window.ethereum) {
        alert("❌ MetaMask غير مثبت! قم بتثبيته أولاً.");
        return;
    }
    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        const address = await signer.getAddress();
        document.getElementById("walletAddress").innerText = `✅ المحفظة المتصلة: ${address}`;

        contract.on("SeasonUpdated", (newSeason, updatedBy) => {
            document.getElementById("status").innerHTML = `🔄 تم تحديث الفصل إلى "${newSeason}" بواسطة ${updatedBy.slice(0,6)}...${updatedBy.slice(-4)}`;
            getSeason();
        });

        getSeason();
    } catch (error) {
        console.error(error);
        document.getElementById("status").innerText = "⚠️ فشل الاتصال بالمحفظة";
    }
}

async function getSeason() {
    if (!contract) {
        alert("يرجى الاتصال بالمحفظة أولاً.");
        return;
    }
    try {
        const season = await contract.getSeason();
        const count = await contract.updateCount();
        const lastAddr = await contract.lastUpdatedBy();
        document.getElementById("showSeason").innerText = `🍂 الفصل الحالي: ${season || "غير محدد بعد"}`;
        document.getElementById("updateCount").innerText = `📊 عدد مرات التحديث: ${count.toString()}`;
        document.getElementById("lastUpdatedBy").innerText = `👤 آخر تحديث بواسطة: ${lastAddr === "0x0000000000000000000000000000000000000000" ? "لا يوجد" : lastAddr}`;

        const [lastSeasons, lastUpdaters] = await contract.getLastSeasons();
        const ul = document.getElementById("lastFive");
        ul.innerHTML = "";
        for(let i=0; i<5; i++){
            if(lastSeasons[i] && lastSeasons[i] !== ""){
                const li = document.createElement("li");
                li.innerText = `${lastSeasons[i]} ( بواسطة ${lastUpdaters[i].slice(0,6)}...${lastUpdaters[i].slice(-4)} )`;
                ul.appendChild(li);
            }
        }

    } catch (err) {
        console.error(err);
    }
}

async function setSeason() {
    if (!contract) {
        alert("اتصل بالمحفظة أولاً.");
        return;
    }

    const seasonValue = document.getElementById("season").value.trim();
    if (!seasonValue) {
        alert("الرجاء إدخال فصل صحيح.");
        return;
    }
    if(seasonValue.length > 30){
        alert("الرجاء إدخال أقل من 30 حرفاً.");
        return;
    }

    const statusEl = document.getElementById("status");
    statusEl.innerHTML = "⏳ جاري تنفيذ المعاملة...";

    try {
        const tx = await contract.setSeason(seasonValue);
        await tx.wait();
        statusEl.innerHTML = "✅ تم حفظ الفصل بنجاح!";
        document.getElementById("season").value = "";
        getSeason();
    } catch (error) {
        console.error(error);
        statusEl.innerHTML = "❌ فشلت المعاملة: " + (error.reason || error.message || "خطأ غير معروف");
    }
}

window.addEventListener("load", () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWallet();
    }
});
