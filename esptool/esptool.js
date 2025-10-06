import { ESPLoader, ROM, Transport } from 'https://unpkg.com/esptool-js@0.5.0/bundle.js';




// // esp-tool.js
let esploader = null;
let device = null;


const connectBtn = document.getElementById('con');
const infoBtn = document.getElementById('infoBtn');
const eraseBtn = document.getElementById('eraseBtn');
const flashBtn = document.getElementById('flashBtn');
const fileInput = document.getElementById('fl');
const logDiv = document.getElementById('log');
const dropZone = document.getElementById('dropZone');
const fileName = document.getElementById('fileName');
const flashAddr = document.getElementById('flash-addr');


const model = document.getElementById('Model');
const mac = document.getElementById('MAC');
const flashSize = document.getElementById('FlashSize');
const chipId = document.getElementById('ChipID');
const features = document.getElementById('Features');
const Freq = document.getElementById('Freq');

//

//
export function addLog(message) {
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.appendChild(p);
    logDiv.scrollTop = logDiv.scrollHeight;
}
export function FileSe(file) {
    if (file && file.name.endsWith('.bin')) {
        fileName.textContent = file.name;
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        addLog(`已选择文件: ${file.name}`);
        addLog(`文件大小: ${(file.size / 1024).toFixed(2)} KB`);
    } else {
        addLog('请选择 .bin 格式的固件文件');
        fileName.textContent = '';
        const dataTransfer = new DataTransfer();
        fileInput.files = dataTransfer.files;
    }
}


dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    FileSe(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    FileSe(file);
});

function connect(connected) {
    connectBtn.innerHTML = connected ?
        '<i class="fa fa-times-circle">断开连接</i>' :
        '<i class="fa fa-connectdevelop">连接ESP设备</i>';
    infoBtn.disabled = !connected;
    eraseBtn.disabled = !connected;
    flashBtn.disabled = !connected;
}

addLog('系统就绪，等待连接设备...');

let chip = null;
// let transport;
connectBtn.addEventListener('click', async () => {
    if (device) {
        device = null;
        esploader = null;
        connect(false);
        addLog("断开连接");
        addLog('设备已断开');
        model.textContent = '-未连接-';
        mac.textContent = '-未连接-';
        flashSize.textContent = '-未连接-';
        chipId.textContent = '-未连接-';
        features.textContent = '-未连接-';
        Freq.textContent = '-未连接-';
        return;
    }
    else {
        try {
            const port = await navigator.serial.requestPort();
            device = port;
            // transport = new Transport(device, true);
            esploader = new ESPLoader({
                port: port,
                baudrate: 115200,
                debugLogging: false,
            });


            addLog('正在连接设备...');

            chip = await esploader.main();

            connect(true);
            addLog('设备连接成功');
            addLog('开始读取参数');
            addLog("Settings done for :" + chip)

            const modelinfo = await esploader.chip.getChipDescription(esploader);
            model.textContent = modelinfo;

            const macinfo = await esploader.chip.readMac(esploader);
            mac.textContent = macinfo;

            const flashinfo = await esploader.getFlashSize();
            flashSize.textContent = (flashinfo / 1024 + "MB"); // 正确转换为MB

            const Idinfo = await esploader.readFlashId();
            chipId.textContent = Idinfo.toString(16);

            const chipFeatures = await esploader.chip.getChipFeatures(esploader);
            features.textContent = chipFeatures;

            const crystalFreq = await esploader.chip.getCrystalFreq(esploader);
            Freq.textContent = crystalFreq + "MHz";

        } catch (error) {
            addLog(error);
        }
    }
});

infoBtn.addEventListener('click', async () => {
    try {
        await esploader.hardReset();
        addLog('设备已重启');
    } catch (error) {
        addLog('重启设备失败: ' + error);
    }
})

eraseBtn.addEventListener('click', async () => {
    if (!esploader) {
        addLog('请先连接设备');
        return;
    }

    if (!confirm('确定要擦除整个闪存吗？此操作不可逆！')) {
        return;
    }

    try {
        addLog('开始擦除闪存...');
        await esploader.eraseFlash();
        addLog('闪存擦除完成');
    } catch (error) {
        addLog('擦除闪存失败: ' + error);
    }
});



flashBtn.onclick = async () => {
    if (!esploader) {
        addLog('请先连接设备');
        return;
    }

    const file = fileInput.files[0];
    if (!file) {
        addLog('请选择固件文件');
        return;
    }

    try {
        let address = flashAddr.value.trim();
        if (!/^0x[0-9A-Fa-f]{4,8}$/.test(address)) {
            addLog('请输入有效的十六进制地址,例如:0x0000');
            return;
        }
        address = parseInt(address, 16);

        addLog(`开始烧录 ${file.name} 到地址 0x${address.toString(16).padStart(8, '0')}`);

        // 读取文件内容

        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                if (!e.target || !e.target.result) {
                    throw new Error('文件读取失败');
                }

                const binaryString = e.target.result;
                addLog(`文件大小: ${binaryString.length} 字节`);

                const flashOptions = {
                    fileArray: [{
                        data: binaryString,
                        address: address
                    }],
                    flashSize: "keep",
                    eraseAll: true,
                    compress: true,
                    reportProgress: (fileIndex, written, total) => {
                        const progress = (written / total * 100).toFixed(2);
                        addLog(`烧录进度: ${progress}%`);
                    }
                };

                addLog('开始擦除Flash...');
                await esploader.eraseFlash();
                addLog('Flash擦除完成');

                addLog('开始写入数据...');
                await esploader.writeFlash(flashOptions);
                addLog('烧录完成!');

                // 重启设备
                await esploader.hardReset();
                addLog('设备已重启');
            } catch (error) {
                addLog(`烧录错误: ${error.message}`);
                console.error('烧录错误:', error);
            }
        };

        reader.onerror = function () {
            addLog('文件读取失败');
        };

        // 以二进制字符串格式读取文件
        reader.readAsBinaryString(file);
    } catch (e) {
        addLog(`烧录错误: ${e.message}`);
        console.error('烧录错误:', e);
    }
};
