// 全局变量
let serialPort = null;
let reader = null;
let writer = null;
const sendHistory = [];
let historyIndex = -1;
let repeatTimer = null;
let receivedByteCount = 0;
let partialBuffer = new Uint8Array(0);

// DOM元素
const connectBtn = document.getElementById('connectBtn');
const baudRateSelect = document.getElementById('baudRate');
const customBaudRate = document.getElementById('customBaudRate');
const dataBitsSelect = document.getElementById('dataBits');
const stopBitsSelect = document.getElementById('stopBits');
const paritySelect = document.getElementById('parity');
const receivedText = document.getElementById('receivedText');
const sendText = document.getElementById('sendText');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const clearSendBtn = document.getElementById('clearSendBtn');
const saveBtn = document.getElementById('saveBtn');
const copyBtn = document.getElementById('copyBtn');
const loadBtn = document.getElementById('loadBtn');
const testLoopback = document.getElementById('testLoopback');
const testNewlineBtn = document.getElementById('testNewlineBtn');
const hexDisplay = document.getElementById('hexDisplay');
const hexSend = document.getElementById('hexSend');
const autoNewline = document.getElementById('autoNewline');
const showTimestamp = document.getElementById('showTimestamp');
const autoScroll = document.getElementById('autoScroll');
const appendNewline = document.getElementById('appendNewline');
const newlineType = document.getElementById('newlineType');
const repeatSend = document.getElementById('repeatSend');
const repeatInterval = document.getElementById('repeatInterval');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const debugLog = document.getElementById('debugLog');
const clearDebugBtn = document.getElementById('clearDebugBtn');
const exportDebugBtn = document.getElementById('exportDebugBtn');
const byteCount = document.getElementById('byteCount');
const showControlChars = document.getElementById('showControlChars');
const presetCommands = document.getElementById('presetCommands');
const sendPresetBtn = document.getElementById('sendPresetBtn');

// 初始化函数
function init() {
    // 检查浏览器支持
    if (!('serial' in navigator)) {
        const errorMsg = '错误: 您的浏览器不支持Web Serial API，请使用Chrome/Edge 89+或Opera 76+';
        statusText.textContent = errorMsg;
        debugLogMessage(errorMsg);
        document.querySelectorAll('button').forEach(btn => {
            if (btn.id !== 'clearBtn' && btn.id !== 'clearDebugBtn' && btn.id !== 'clearSendBtn') {
                btn.disabled = true;
            }
        });
        return;
    }
    
    // 初始化事件监听
    setupEventListeners();
    
    // 检查已授权端口
    checkPreviouslyGrantedPorts();
    
    debugLogMessage('网页版串口调试助手已初始化');
}

// 设置事件监听
function setupEventListeners() {
    // 连接/断开按钮
    connectBtn.addEventListener('click', async () => {
        if (serialPort) {
            await disconnectSerial();
        } else {
            await connectSerial();
        }
    });
    
    // 波特率选择变化
    baudRateSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customBaudRate.style.display = 'inline-block';
            customBaudRate.focus();
        } else {
            customBaudRate.style.display = 'none';
        }
    });
    
    // 发送按钮
    sendBtn.addEventListener('click', async () => {
        await sendSerialData();
    });
    
    // 清空发送区
    clearSendBtn.addEventListener('click', () => {
        sendText.value = '';
        debugLogMessage('发送区已清空');
    });
    
    // 清空接收区
    clearBtn.addEventListener('click', () => {
        receivedText.value = '';
        receivedByteCount = 0;
        updateByteCount();
        debugLogMessage('接收区已清空');
    });
    
    // 保存记录
    saveBtn.addEventListener('click', saveReceivedData);
    
    // 复制内容
    copyBtn.addEventListener('click', copyReceivedData);
    
    // 加载文件
    loadBtn.addEventListener('click', loadAndSendFile);
    
    // 测试回环
    testLoopback.addEventListener('click', testLoopbackFunction);
    
    // 测试换行符
    testNewlineBtn.addEventListener('click', testNewlineFunction);
    
    // 发送预设指令
    sendPresetBtn.addEventListener('click', sendPresetCommand);
    
    // 预设指令选择变化
    presetCommands.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            const customCommand = prompt('请输入自定义AT指令:', 'AT');
            if (customCommand) {
                sendText.value = customCommand;
            }
            presetCommands.value = '';
        } else if (e.target.value) {
            sendText.value = e.target.value;
        }
    });
    
    // 定时发送切换
    repeatSend.addEventListener('change', (e) => {
        repeatInterval.disabled = !e.target.checked;
        if (e.target.checked) {
            startRepeatSend();
        } else {
            stopRepeatSend();
        }
    });
    
    // 清空调试信息
    clearDebugBtn.addEventListener('click', () => {
        debugLog.value = '';
        debugLogMessage('调试信息已清空');
    });
    
    // 导出调试日志
    exportDebugBtn.addEventListener('click', exportDebugLog);
}

// 调试日志函数
function debugLogMessage(message) {
    const timestamp = new Date().toLocaleTimeString();
    debugLog.value += `[${timestamp}] ${message}\n`;
    if (autoScroll.checked) {
        debugLog.scrollTop = debugLog.scrollHeight;
    }
    console.log(message);
}

// 检查之前已授权的端口
async function checkPreviouslyGrantedPorts() {
    try {
        const ports = await navigator.serial.getPorts();
        debugLogMessage(`找到 ${ports.length} 个已授权的串口设备`);
        
        if (ports.length > 0) {
            debugLogMessage('提示: 可以自动连接上次使用的设备');
        }
    } catch (error) {
        debugLogMessage(`检查已授权端口时出错: ${error.message}`);
    }
}

// 连接串口
async function connectSerial() {
    debugLogMessage('=== 开始连接串口 ===');
    statusIndicator.className = 'status-indicator connecting';
    statusText.textContent = '正在连接...';
    connectBtn.disabled = true;
    
    try {
        // 1. 请求用户选择设备
        debugLogMessage('请求用户选择串口设备...');
        serialPort = await navigator.serial.requestPort();
        debugLogMessage('用户已选择设备');
        
        // 2. 准备打开参数
        const baudRate = baudRateSelect.value === 'custom' 
            ? parseInt(customBaudRate.value) 
            : parseInt(baudRateSelect.value);
        
        if (isNaN(baudRate) || baudRate <= 0) {
            throw new Error('无效的波特率');
        }
        
        const options = {
            baudRate: baudRate,
            dataBits: parseInt(dataBitsSelect.value),
            stopBits: parseInt(stopBitsSelect.value),
            parity: paritySelect.value,
            flowControl: 'none'
        };
        
        debugLogMessage(`尝试使用参数打开: ${JSON.stringify(options)}`);
        
        // 3. 尝试打开串口
        try {
            await serialPort.open(options);
            debugLogMessage('串口已成功打开');
        } catch (openError) {
            debugLogMessage(`使用首选参数打开失败: ${openError.message}`);
            
            // 尝试常见波特率
            debugLogMessage('尝试常见波特率...');
            const commonBaudRates = [9600, 19200, 38400, 57600, 115200];
            for (const rate of commonBaudRates) {
                if (rate === options.baudRate) continue;
                
                try {
                    await serialPort.open({...options, baudRate: rate});
                    debugLogMessage(`成功使用 ${rate}bps 打开`);
                    break;
                } catch (e) {
                    debugLogMessage(`波特率 ${rate} 也失败: ${e.message}`);
                    if (rate === commonBaudRates[commonBaudRates.length - 1]) {
                        throw new Error('所有尝试的波特率都失败');
                    }
                }
            }
        }
        
        // 4. 设置读写器
        writer = serialPort.writable.getWriter();
        debugLogMessage('写入器已初始化');
        
        // 5. 更新UI状态
        connectBtn.textContent = '断开连接';
        statusIndicator.className = 'status-indicator connected';
        statusText.textContent = `已连接 (${baudRate} bps)`;
        
        // 6. 开始读取数据
        readData();
        
        // 7. 添加断开事件监听
        serialPort.addEventListener('disconnect', () => {
            debugLogMessage('设备已断开连接');
            disconnectSerial();
            alert('串口设备已断开');
        });
        
        debugLogMessage('=== 连接成功 ===');
        
    } catch (error) {
        debugLogMessage(`连接过程中出错: ${error.message}`);
        statusIndicator.className = 'status-indicator disconnected';
        
        // 特定错误处理
        let errorMessage = `连接失败: ${error.message}`;
        if (error instanceof DOMException) {
            if (error.name === 'SecurityError') {
                errorMessage = '连接失败: 请授予串口访问权限';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '连接失败: 未找到可用的串口设备';
            }
        }
        
        statusText.textContent = errorMessage;
        
        // 清理资源
        await cleanupSerialResources();
        
    } finally {
        connectBtn.disabled = false;
    }
}

// 断开串口
async function disconnectSerial() {
    debugLogMessage('=== 开始断开连接 ===');
    connectBtn.disabled = true;
    
    try {
        // 停止定时发送
        stopRepeatSend();
        
        // 清理资源
        await cleanupSerialResources();
        
        // 更新UI状态
        connectBtn.textContent = '连接串口';
        statusIndicator.className = 'status-indicator disconnected';
        statusText.textContent = '未连接';
        
        debugLogMessage('=== 已断开连接 ===');
        
    } catch (error) {
        debugLogMessage(`断开连接时出错: ${error.message}`);
        statusText.textContent = `断开失败: ${error.message}`;
        
    } finally {
        connectBtn.disabled = false;
    }
}

// 清理串口资源
async function cleanupSerialResources() {
    if (reader) {
        try {
            await reader.cancel();
        } catch (error) {
            debugLogMessage(`取消读取时出错: ${error.message}`);
        }
        reader = null;
    }
    
    if (writer) {
        try {
            await writer.releaseLock();
        } catch (error) {
            debugLogMessage(`释放写入器时出错: ${error.message}`);
        }
        writer = null;
    }
    
    if (serialPort) {
        try {
            await serialPort.close();
        } catch (error) {
            debugLogMessage(`关闭串口时出错: ${error.message}`);
        }
        serialPort = null;
    }
}

// 读取串口数据
async function readData() {
    debugLogMessage('启动数据读取循环');
    
    try {
        if (!serialPort.readable) {
            throw new Error('串口不可读');
        }
        
        reader = serialPort.readable.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (serialPort.readable) {
            const { value, done } = await reader.read();
            if (done) {
                debugLogMessage('读取流结束');
                break;
            }
            
            receivedByteCount += value.length;
            updateByteCount();
            
            debugLogMessage(`收到 ${value.length} 字节数据`);
            
            // 处理数据
            if (hexDisplay.checked) {
                const hexStr = Array.from(value)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ');
                appendToReceivedText(hexStr + ' ');
            } else {
                const text = decoder.decode(value);
                appendToReceivedText(processTextData(text));
            }
        }
    } catch (error) {
        debugLogMessage(`读取数据时出错: ${error.message}`);
        
        if (error.name !== 'NetworkError') {
            statusText.textContent = `读取错误: ${error.message}`;
        }
        
        if (error.name === 'NetworkError') {
            disconnectSerial();
        }
    } finally {
        if (reader) {
            reader.releaseLock();
            reader = null;
            debugLogMessage('读取器已释放');
        }
    }
}

// 处理文本数据
function processTextData(text) {
    let processed = text;
    
    // 显示控制字符
    if (showControlChars.checked) {
        processed = processed.replace(/[\x00-\x1F]/g, c => {
            return `[${c.charCodeAt(0).toString(16).padStart(2, '0')}]`;
        });
    }
    
    // 添加时间戳
    if (showTimestamp.checked) {
        const now = new Date();
        const timestamp = `[${now.toLocaleTimeString()}] `;
        processed = processed.replace(/\n/g, '\n' + timestamp);
        processed = timestamp + processed;
    }
    
    // 自动换行
    if (autoNewline.checked && !processed.endsWith('\n')) {
        processed += '\n';
    }
    
    return processed;
}

// 追加文本到接收区
function appendToReceivedText(text) {
    // 保留最大行数（防止内存溢出）
    const maxLines = 1000;
    const currentLines = receivedText.value.split('\n');
    if (currentLines.length > maxLines) {
        receivedText.value = currentLines.slice(-maxLines).join('\n');
    }
    
    // 追加新文本
    receivedText.value += text;
    
    // 自动滚动
    if (autoScroll.checked) {
        receivedText.scrollTop = receivedText.scrollHeight;
    }
}

// 发送串口数据（支持多行）
async function sendSerialData() {
    if (!serialPort || !writer) {
        alert('请先连接串口');
        return;
    }
    
    let data = sendText.value.trim();
    if (!data) return;
    
    try {
        const newlineChar = newlineType.value;
        const isHexMode = hexSend.checked;
        const shouldAppendNewline = appendNewline.checked;
        
        // 处理多行数据
        const lines = data.split('\n');
        let lastLineIndex = lines.length - 1;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;
            
            // 是否为AT指令（不区分大小写）
            const isATCommand = line.toUpperCase().startsWith('AT');
            
            // 自动添加换行符
            if (shouldAppendNewline) {
                // 对于AT指令，强制使用\r\n
                if (isATCommand && !line.endsWith('\r') && !line.endsWith('\n')) {
                    line += '\r\n';
                } 
                // 对于其他指令，使用选择的换行符
                else if (!isATCommand && !line.endsWith('\r') && !line.endsWith('\n')) {
                    line += newlineChar;
                }
            }
            
            if (isHexMode) {
                // 十六进制发送模式
                const hexArray = line.split(/\s+/).filter(x => x);
                const byteArray = new Uint8Array(hexArray.map(h => {
                    // 处理特殊转义字符
                    if (h === '\\n') return 0x0A;
                    if (h === '\\r') return 0x0D;
                    if (h === '\\t') return 0x09;
                    return parseInt(h, 16);
                }));
                
                await writer.write(byteArray);
                appendToReceivedText(`[发送] ${hexArray.join(' ')}\n`);
            } else {
                // 文本模式发送
                await writer.write(new TextEncoder().encode(line));
                
                // 格式化显示发送的数据
                let displayText = line;
                if (showControlChars.checked) {
                    displayText = displayText.replace(/\r/g, '\\r')
                                           .replace(/\n/g, '\\n\n')
                                           .replace(/\t/g, '\\t');
                }
                appendToReceivedText(`[发送] ${displayText}`);
            }
            
            // 如果不是最后一行，或者最后一行不是空行，添加延迟
            if (i < lastLineIndex || (i === lastLineIndex && lines[i].trim())) {
                await new Promise(resolve => setTimeout(resolve, 10)); // 10ms延迟
            }
        }
        
        // 添加到历史记录（不包含自动添加的换行）
        if (data && !sendHistory.includes(data.replace(/\r?\n$/, ''))) {
            sendHistory.unshift(data.replace(/\r?\n$/, ''));
            if (sendHistory.length > 10) {
                sendHistory.pop();
            }
        }
        historyIndex = -1;
        
        sendText.value = '';
        
    } catch (error) {
        debugLogMessage(`发送失败: ${error.message}`);
        statusText.textContent = '发送失败';
        alert(`发送失败: ${error.message}`);
    }
}

// 开始定时发送
function startRepeatSend() {
    if (repeatTimer) return;
    
    const interval = parseInt(repeatInterval.value) || 1000;
    if (interval < 100) {
        alert('发送间隔不能小于100ms');
        repeatSend.checked = false;
        repeatInterval.disabled = true;
        return;
    }
    
    debugLogMessage(`启动定时发送，间隔 ${interval}ms`);
    repeatTimer = setInterval(async () => {
        if (sendText.value.trim()) {
            await sendSerialData();
        }
    }, interval);
}

// 停止定时发送
function stopRepeatSend() {
    if (repeatTimer) {
        clearInterval(repeatTimer);
        repeatTimer = null;
        debugLogMessage('已停止定时发送');
    }
}

// 保存接收到的数据
function saveReceivedData() {
    if (!receivedText.value) {
        alert('没有数据可保存');
        return;
    }
    
    try {
        const blob = new Blob([receivedText.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `serial_log_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
        debugLogMessage('数据已保存为文件');
    } catch (error) {
        debugLogMessage(`保存数据失败: ${error.message}`);
        alert('保存失败，请查看调试信息');
    }
}

// 复制接收到的数据
function copyReceivedData() {
    if (!receivedText.value) {
        alert('没有数据可复制');
        return;
    }
    
    try {
        receivedText.select();
        document.execCommand('copy');
        debugLogMessage('数据已复制到剪贴板');
        alert('数据已复制到剪贴板');
    } catch (error) {
        debugLogMessage(`复制数据失败: ${error.message}`);
        alert('复制失败，请查看调试信息');
    }
}

// 加载并发送文件
async function loadAndSendFile() {
    if (!serialPort || !writer) {
        alert('请先连接串口');
        return;
    }
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            sendText.value = text;
            debugLogMessage(`已加载文件: ${file.name} (${file.size} 字节)`);
        } catch (error) {
            debugLogMessage(`加载文件失败: ${error.message}`);
            alert('加载文件失败');
        }
    });
    
    fileInput.click();
}

// 测试回环功能
async function testLoopbackFunction() {
    if (!serialPort || !writer) {
        alert('请先连接串口');
        return;
    }
    
    try {
        debugLogMessage('开始回环测试...');
        const testMessage = 'LOOPBACK_TEST_' + Date.now() + '\r\n';
        
        // 发送测试消息
        await writer.write(new TextEncoder().encode(testMessage));
        debugLogMessage(`已发送测试消息: ${testMessage.trim()}`);
        
        // 设置超时
        const timeout = setTimeout(() => {
            debugLogMessage('回环测试超时，未收到响应');
            alert('回环测试失败：未收到响应');
        }, 2000);
        
        // 临时监听响应
        const tempReader = serialPort.readable.getReader();
        try {
            while (true) {
                const { value, done } = await tempReader.read();
                if (done) break;
                
                const text = new TextDecoder().decode(value);
                if (text.includes(testMessage.trim())) {
                    clearTimeout(timeout);
                    debugLogMessage('回环测试成功！');
                    alert('回环测试成功！串口工作正常');
                    break;
                }
            }
        } finally {
            tempReader.releaseLock();
        }
    } catch (error) {
        debugLogMessage(`回环测试失败: ${error.message}`);
        alert(`回环测试失败: ${error.message}`);
    }
}

// 测试换行符功能
async function testNewlineFunction() {
    if (!serialPort || !writer) {
        alert('请先连接串口');
        return;
    }
    
    try {
        debugLogMessage('=== 开始换行符测试 ===');
        
        const tests = [
            { name: "无换行符", data: "TEST_NO_NEWLINE" },
            { name: "LF结尾 (\\n)", data: "TEST_LF\n" },
            { name: "CR结尾 (\\r)", data: "TEST_CR\r" },
            { name: "CR+LF结尾 (\\r\\n)", data: "TEST_CRLF\r\n" },
            { name: "多行测试", data: "LINE1\nLINE2\r\nLINE3\rLINE4" }
        ];
        
        for (const test of tests) {
            try {
                await writer.write(new TextEncoder().encode(test.data));
                debugLogMessage(`已发送: ${test.name}`);
                appendToReceivedText(`[测试] ${test.name}: ${formatSentDataForDisplay(test.data)}\n`);
                await new Promise(resolve => setTimeout(resolve, 500)); // 延迟500ms
            } catch (error) {
                debugLogMessage(`发送测试失败: ${test.name} - ${error.message}`);
            }
        }
        
        debugLogMessage('=== 换行符测试完成 ===');
        
    } catch (error) {
        debugLogMessage(`换行符测试失败: ${error.message}`);
        alert(`换行符测试失败: ${error.message}`);
    }
}

// 发送预设指令
async function sendPresetCommand() {
    const command = presetCommands.value;
    if (!command) return;
    
    if (command === 'custom') {
        const customCommand = prompt('请输入自定义AT指令:', 'AT');
        if (customCommand) {
            sendText.value = customCommand;
            presetCommands.value = '';
        }
        return;
    }
    
    sendText.value = command;
    await sendSerialData();
}

// 格式化发送数据显示
function formatSentDataForDisplay(data) {
    let display = data;
    
    // 显示控制字符
    if (showControlChars.checked) {
        display = display.replace(/\r/g, '\\r')
                       .replace(/\n/g, '\\n\n')
                       .replace(/\t/g, '\\t');
    }
    
    return display;
}

// 更新字节计数
function updateByteCount() {
    byteCount.textContent = `${receivedByteCount} 字节`;
}

// 导出调试日志
function exportDebugLog() {
    if (!debugLog.value) {
        alert('没有调试信息可导出');
        return;
    }
    
    try {
        const blob = new Blob([debugLog.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `serial_debug_${new Date().toISOString().slice(0, 10)}.log`;
        a.click();
        
        URL.revokeObjectURL(url);
        debugLogMessage('调试日志已导出');
    } catch (error) {
        debugLogMessage(`导出调试日志失败: ${error.message}`);
        alert('导出失败，请查看调试信息');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);