// // // 全局变量
// let serialPort = null;
// let reader = null;
// let writer = null;
// const sendHistory = [];
// let historyIndex = -1;
// let repeatTimer = null;
// let receivedByteCount = 0;
// let partialBuffer = new Uint8Array(0);

// // // DOM元素
// const connectBtn = document.getElementById('connectBtn');
// const baudRateSelect = document.getElementById('baudRate');
// const customBaudRate = document.getElementById('customBaudRate');
// const dataBitsSelect = document.getElementById('dataBits');
// const stopBitsSelect = document.getElementById('stopBits');
// const paritySelect = document.getElementById('parity');
// const receivedText = document.getElementById('receivedText');
// const sendText = document.getElementById('sendText');
// const sendBtn = document.getElementById('sendBtn');
// const clearBtn = document.getElementById('clearBtn');
// const clearSendBtn = document.getElementById('clearSendBtn');
// const saveBtn = document.getElementById('saveBtn');
// const copyBtn = document.getElementById('copyBtn');
// const loadBtn = document.getElementById('loadBtn');
// const testLoopback = document.getElementById('testLoopback');
// const testNewlineBtn = document.getElementById('testNewlineBtn');
// const hexDisplay = document.getElementById('hexDisplay');
// const hexSend = document.getElementById('hexSend');
// const autoNewline = document.getElementById('autoNewline');
// const showTimestamp = document.getElementById('showTimestamp');
// const autoScroll = document.getElementById('autoScroll');
// const appendNewline = document.getElementById('appendNewline');
// const newlineType = document.getElementById('newlineType');
// const repeatSend = document.getElementById('repeatSend');
// const repeatInterval = document.getElementById('repeatInterval');
// const statusIndicator = document.getElementById('statusIndicator');
// const statusText = document.getElementById('statusText');
// const debugLog = document.getElementById('debugLog');
// const clearDebugBtn = document.getElementById('clearDebugBtn');
// const exportDebugBtn = document.getElementById('exportDebugBtn');
// const byteCount = document.getElementById('byteCount');
// const showControlChars = document.getElementById('showControlChars');
// const presetCommands = document.getElementById('presetCommands');
// const sendPresetBtn = document.getElementById('sendPresetBtn');

// // 初始化函数
// function init() {
//     // 检查浏览器支持
//     if (!('serial' in navigator)) {
//         const errorMsg = '错误: 您的浏览器不支持Web Serial API，请使用Chrome/Edge 89+或Opera 76+';
//         statusText.textContent = errorMsg;
//         debugLogMessage(errorMsg);
//         document.querySelectorAll('button').forEach(btn => {
//             if (btn.id !== 'clearBtn' && btn.id !== 'clearDebugBtn' && btn.id !== 'clearSendBtn') {
//                 btn.disabled = true;
//             }
//         });
//         return;
//     }
    
//     // 初始化事件监听
//     setupEventListeners();
    
//     // 检查已授权端口
//     checkPreviouslyGrantedPorts();
    
//     debugLogMessage('网页版串口调试助手已初始化');
// }

// // 设置事件监听
// function setupEventListeners() {
//     // 连接/断开按钮
//     connectBtn.addEventListener('click', async () => {
//         if (serialPort) {
//             await disconnectSerial();
//         } else {
//             await connectSerial();
//         }
//     });
    
//     // 波特率选择变化
//     baudRateSelect.addEventListener('change', (e) => {
//         if (e.target.value === 'custom') {
//             customBaudRate.style.display = 'inline-block';
//             customBaudRate.focus();
//         } else {
//             customBaudRate.style.display = 'none';
//         }
//     });
    
//     // 发送按钮
//     sendBtn.addEventListener('click', async () => {
//         await sendSerialData();
//     });
    
//     // 清空发送区
//     clearSendBtn.addEventListener('click', () => {
//         sendText.value = '';
//         debugLogMessage('发送区已清空');
//     });
    
//     // 清空接收区
//     clearBtn.addEventListener('click', () => {
//         receivedText.value = '';
//         receivedByteCount = 0;
//         updateByteCount();
//         debugLogMessage('接收区已清空');
//     });
    
//     // 保存记录
//     saveBtn.addEventListener('click', saveReceivedData);
    
//     // 复制内容
//     copyBtn.addEventListener('click', copyReceivedData);
    
//     // 加载文件
//     loadBtn.addEventListener('click', loadAndSendFile);
    
//     // 测试回环
//     testLoopback.addEventListener('click', testLoopbackFunction);
    
//     // 测试换行符
//     testNewlineBtn.addEventListener('click', testNewlineFunction);
    
//     // 发送预设指令
//     sendPresetBtn.addEventListener('click', sendPresetCommand);
    
//     // 预设指令选择变化
//     presetCommands.addEventListener('change', (e) => {
//         if (e.target.value === 'custom') {
//             const customCommand = prompt('请输入自定义AT指令:', 'AT');
//             if (customCommand) {
//                 sendText.value = customCommand;
//             }
//             presetCommands.value = '';
//         } else if (e.target.value) {
//             sendText.value = e.target.value;
//         }
//     });
    
//     // 定时发送切换
//     repeatSend.addEventListener('change', (e) => {
//         repeatInterval.disabled = !e.target.checked;
//         if (e.target.checked) {
//             startRepeatSend();
//         } else {
//             stopRepeatSend();
//         }
//     });
    
//     // 清空调试信息
//     clearDebugBtn.addEventListener('click', () => {
//         debugLog.value = '';
//         debugLogMessage('调试信息已清空');
//     });
    
//     // 导出调试日志
//     exportDebugBtn.addEventListener('click', exportDebugLog);
// }

// // 调试日志函数
// function debugLogMessage(message) {
//     const timestamp = new Date().toLocaleTimeString();
//     debugLog.value += `[${timestamp}] ${message}\n`;
//     if (autoScroll.checked) {
//         debugLog.scrollTop = debugLog.scrollHeight;
//     }
//     console.log(message);
// }

// // 检查之前已授权的端口
// async function checkPreviouslyGrantedPorts() {
//     try {
//         const ports = await navigator.serial.getPorts();
//         debugLogMessage(`找到 ${ports.length} 个已授权的串口设备`);
        
//         if (ports.length > 0) {
//             debugLogMessage('提示: 可以自动连接上次使用的设备');
//         }
//     } catch (error) {
//         debugLogMessage(`检查已授权端口时出错: ${error.message}`);
//     }
// }

// // // 连接串口
// async function connectSerial() {
//     debugLogMessage('=== 开始连接串口 ===');
//     statusIndicator.className = 'status-indicator connecting';
//     statusText.textContent = '正在连接...';
//     connectBtn.disabled = true;
    
//     try {
//         // 1. 请求用户选择设备
//         debugLogMessage('请求用户选择串口设备...');
//         serialPort = await navigator.serial.requestPort();
//         debugLogMessage('用户已选择设备');
        
//         // 2. 准备打开参数
//         const baudRate = baudRateSelect.value === 'custom' 
//             ? parseInt(customBaudRate.value) 
//             : parseInt(baudRateSelect.value);
        
//         if (isNaN(baudRate) || baudRate <= 0) {
//             throw new Error('无效的波特率');
//         }
        
//         const options = {
//             baudRate: baudRate,
//             dataBits: parseInt(dataBitsSelect.value),
//             stopBits: parseInt(stopBitsSelect.value),
//             parity: paritySelect.value,
//             flowControl: 'none'
//         };
        
//         debugLogMessage(`尝试使用参数打开: ${JSON.stringify(options)}`);
        
//         // 3. 尝试打开串口
//         try {
//             await serialPort.open(options);
//             debugLogMessage('串口已成功打开');
//         } catch (openError) {
//             debugLogMessage(`使用首选参数打开失败: ${openError.message}`);
            
//             // 尝试常见波特率
//             debugLogMessage('尝试常见波特率...');
//             const commonBaudRates = [9600, 19200, 38400, 57600, 115200];
//             for (const rate of commonBaudRates) {
//                 if (rate === options.baudRate) continue;
                
//                 try {
//                     await serialPort.open({...options, baudRate: rate});
//                     debugLogMessage(`成功使用 ${rate}bps 打开`);
//                     break;
//                 } catch (e) {
//                     debugLogMessage(`波特率 ${rate} 也失败: ${e.message}`);
//                     if (rate === commonBaudRates[commonBaudRates.length - 1]) {
//                         throw new Error('所有尝试的波特率都失败');
//                     }
//                 }
//             }
//         }
        
//         // 4. 设置读写器
//         writer = serialPort.writable.getWriter();
//         debugLogMessage('写入器已初始化');
        
//         // 5. 更新UI状态
//         connectBtn.textContent = '断开连接';
//         statusIndicator.className = 'status-indicator connected';
//         statusText.textContent = `已连接 (${baudRate} bps)`;
        
//         // 6. 开始读取数据
//         readData();
        
//         // 7. 添加断开事件监听
//         serialPort.addEventListener('disconnect', () => {
//             debugLogMessage('设备已断开连接');
//             disconnectSerial();
//             alert('串口设备已断开');
//         });
        
//         debugLogMessage('=== 连接成功 ===');
        
//     } catch (error) {
//         debugLogMessage(`连接过程中出错: ${error.message}`);
//         statusIndicator.className = 'status-indicator disconnected';
        
//         // 特定错误处理
//         let errorMessage = `连接失败: ${error.message}`;
//         if (error instanceof DOMException) {
//             if (error.name === 'SecurityError') {
//                 errorMessage = '连接失败: 请授予串口访问权限';
//             } else if (error.name === 'NotFoundError') {
//                 errorMessage = '连接失败: 未找到可用的串口设备';
//             }
//         }
        
//         statusText.textContent = errorMessage;
        
//         // 清理资源
//         await cleanupSerialResources();
        
//     } finally {
//         connectBtn.disabled = false;
//     }
// }

// // 断开串口
// async function disconnectSerial() {
//     debugLogMessage('=== 开始断开连接 ===');
//     connectBtn.disabled = true;
    
//     try {
//        // 停止定时发送
//         stopRepeatSend();
        
//         //清理资源
//         await cleanupSerialResources();
        
//         //更新UI状态
//         connectBtn.textContent = '连接串口';
//         statusIndicator.className = 'status-indicator disconnected';
//         statusText.textContent = '未连接';
        
//         // debugLogMessage('=== 已断开连接 ===');
        
//     } catch (error) {
//         // debugLogMessage(`断开连接时出错: ${error.message}`);
//         statusText.textContent = `断开失败: ${error.message}`;
        
//     } finally {
//         connectBtn.disabled = false;
//     }
// }

// // 清理串口资源
// async function cleanupSerialResources() {
//     if (reader) {
//         try {
//             await reader.cancel();
//         } catch (error) {
//             debugLogMessage(`取消读取时出错: ${error.message}`);
//         }
//         reader = null;
//     }
    
//     if (writer) {
//         try {
//             await writer.releaseLock();
//         } catch (error) {
//             debugLogMessage(`释放写入器时出错: ${error.message}`);
//         }
//         writer = null;
//     }
    
//     if (serialPort) {
//         try {
//             await serialPort.close();
//         } catch (error) {
//             debugLogMessage(`关闭串口时出错: ${error.message}`);
//         }
//         serialPort = null;
//     }
// }

// //读取串口数据
// async function readData() {
//     debugLogMessage('启动数据读取循环');
    
//     try {
//         if (!serialPort.readable) {
//             throw new Error('串口不可读');
//         }
        
//         reader = serialPort.readable.getReader();
//         const decoder = new TextDecoder();
//         let buffer = '';
        
//         while (serialPort.readable) {
//             const { value, done } = await reader.read();
//             if (done) {
//                 debugLogMessage('读取流结束');
//                 break;
//             }
            
//             receivedByteCount += value.length;
//             updateByteCount();
            
//             debugLogMessage(`收到 ${value.length} 字节数据`);
            
//             // 处理数据
//             if (hexDisplay.checked) {
//                 const hexStr = Array.from(value)
//                     .map(b => b.toString(16).padStart(2, '0'))
//                     .join(' ');
//                 appendToReceivedText(hexStr + ' ');
//             } else {
//                 const text = decoder.decode(value);
//                 appendToReceivedText(processTextData(text));
//             }
//         }
//     } catch (error) {
//         debugLogMessage(`读取数据时出错: ${error.message}`);
        
//         if (error.name !== 'NetworkError') {
//             statusText.textContent = `读取错误: ${error.message}`;
//         }
        
//         if (error.name === 'NetworkError') {
//             disconnectSerial();
//         }
//     } finally {
//         if (reader) {
//             reader.releaseLock();
//             reader = null;
//             debugLogMessage('读取器已释放');
//         }
//     }
// }

// // 处理文本数据
// function processTextData(text) {
//     let processed = text;
    
//     // 显示控制字符
//     if (showControlChars.checked) {
//         processed = processed.replace(/[\x00-\x1F]/g, c => {
//             return `[${c.charCodeAt(0).toString(16).padStart(2, '0')}]`;
//         });
//     }
    
//     // 添加时间戳
//     if (showTimestamp.checked) {
//         const now = new Date();
//         const timestamp = `[${now.toLocaleTimeString()}] `;
//         processed = processed.replace(/\n/g, '\n' + timestamp);
//         processed = timestamp + processed;
//     }
    
//     // 自动换行
//     if (autoNewline.checked && !processed.endsWith('\n')) {
//         processed += '\n';
//     }
    
//     return processed;
// }

// // 追加文本到接收区
// function appendToReceivedText(text) {
//     // 保留最大行数（防止内存溢出）
//     const maxLines = 1000;
//     const currentLines = receivedText.value.split('\n');
//     if (currentLines.length > maxLines) {
//         receivedText.value = currentLines.slice(-maxLines).join('\n');
//     }
    
//     // 追加新文本
//     receivedText.value += text;
    
//     // 自动滚动
//     if (autoScroll.checked) {
//         receivedText.scrollTop = receivedText.scrollHeight;
//     }
// }

// // // 发送串口数据（支持多行）
// async function sendSerialData() {
//     if (!serialPort || !writer) {
//         alert('请先连接串口');
//         return;
//     }
    
//     let data = sendText.value.trim();
//     if (!data) return;
    
//     try {
//         const newlineChar = newlineType.value;
//         const isHexMode = hexSend.checked;
//         const shouldAppendNewline = appendNewline.checked;
        
//         // 处理多行数据
//         const lines = data.split('\n');
//         let lastLineIndex = lines.length - 1;
        
//         for (let i = 0; i < lines.length; i++) {
//             let line = lines[i].trim();
//             if (!line) continue;
            
//             // 是否为AT指令（不区分大小写）
//             const isATCommand = line.toUpperCase().startsWith('AT');
            
//             // 自动添加换行符
//             if (shouldAppendNewline) {
//                 // 对于AT指令，强制使用\r\n
//                 if (isATCommand && !line.endsWith('\r') && !line.endsWith('\n')) {
//                     line += '\r\n';
//                 } 
//                 // 对于其他指令，使用选择的换行符
//                 else if (!isATCommand && !line.endsWith('\r') && !line.endsWith('\n')) {
//                     line += newlineChar;
//                 }
//             }
            
//             if (isHexMode) {
//                 // 十六进制发送模式
//                 const hexArray = line.split(/\s+/).filter(x => x);
//                 const byteArray = new Uint8Array(hexArray.map(h => {
//                     // 处理特殊转义字符
//                     if (h === '\\n') return 0x0A;
//                     if (h === '\\r') return 0x0D;
//                     if (h === '\\t') return 0x09;
//                     return parseInt(h, 16);
//                 }));
                
//                 await writer.write(byteArray);
//                 appendToReceivedText(`[发送] ${hexArray.join(' ')}\n`);
//             } else {
//                 // 文本模式发送
//                 await writer.write(new TextEncoder().encode(line));
                
//                 // 格式化显示发送的数据
//                 let displayText = line;
//                 if (showControlChars.checked) {
//                     displayText = displayText.replace(/\r/g, '\\r')
//                                            .replace(/\n/g, '\\n\n')
//                                            .replace(/\t/g, '\\t');
//                 }
//                 appendToReceivedText(`[发送] ${displayText}`);
//             }
            
//             // 如果不是最后一行，或者最后一行不是空行，添加延迟
//             if (i < lastLineIndex || (i === lastLineIndex && lines[i].trim())) {
//                 await new Promise(resolve => setTimeout(resolve, 10)); // 10ms延迟
//             }
//         }
        
//         // 添加到历史记录（不包含自动添加的换行）
//         if (data && !sendHistory.includes(data.replace(/\r?\n$/, ''))) {
//             sendHistory.unshift(data.replace(/\r?\n$/, ''));
//             if (sendHistory.length > 10) {
//                 sendHistory.pop();
//             }
//         }
//         historyIndex = -1;
        
//         sendText.value = '';
        
//     } catch (error) {
//         debugLogMessage(`发送失败: ${error.message}`);
//         statusText.textContent = '发送失败';
//         alert(`发送失败: ${error.message}`);
//     }
// }

// // 开始定时发送
// function startRepeatSend() {
//     if (repeatTimer) return;
    
//     const interval = parseInt(repeatInterval.value) || 1000;
//     if (interval < 100) {
//         alert('发送间隔不能小于100ms');
//         repeatSend.checked = false;
//         repeatInterval.disabled = true;
//         return;
//     }
    
//     debugLogMessage(`启动定时发送，间隔 ${interval}ms`);
//     repeatTimer = setInterval(async () => {
//         if (sendText.value.trim()) {
//             await sendSerialData();
//         }
//     }, interval);
// }

// // 停止定时发送
// function stopRepeatSend() {
//     if (repeatTimer) {
//         clearInterval(repeatTimer);
//         repeatTimer = null;
//         debugLogMessage('已停止定时发送');
//     }
// }

// // 保存接收到的数据
// function saveReceivedData() {
//     if (!receivedText.value) {
//         alert('没有数据可保存');
//         return;
//     }
    
//     try {
//         const blob = new Blob([receivedText.value], { type: 'text/plain' });
//         const url = URL.createObjectURL(blob);
        
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `serial_log_${new Date().toISOString().slice(0, 10)}.txt`;
//         a.click();
        
//         URL.revokeObjectURL(url);
//         debugLogMessage('数据已保存为文件');
//     } catch (error) {
//         debugLogMessage(`保存数据失败: ${error.message}`);
//         alert('保存失败，请查看调试信息');
//     }
// }

// //复制接收到的数据
// function copyReceivedData() {
//     if (!receivedText.value) {
//         alert('没有数据可复制');
//         return;
//     }
    
//     try {
//         receivedText.select();
//         document.execCommand('copy');
//         debugLogMessage('数据已复制到剪贴板');
//         alert('数据已复制到剪贴板');
//     } catch (error) {
//         debugLogMessage(`复制数据失败: ${error.message}`);
//         alert('复制失败，请查看调试信息');
//     }
// }

// // 加载并发送文件
// async function loadAndSendFile() {
//     if (!serialPort || !writer) {
//         alert('请先连接串口');
//         return;
//     }
    
//     const fileInput = document.createElement('input');
//     fileInput.type = 'file';
    
//     fileInput.addEventListener('change', async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;
        
//         try {
//             const text = await file.text();
//             sendText.value = text;
//             debugLogMessage(`已加载文件: ${file.name} (${file.size} 字节)`);
//         } catch (error) {
//             debugLogMessage(`加载文件失败: ${error.message}`);
//             alert('加载文件失败');
//         }
//     });
    
//     fileInput.click();
// }

// // 测试回环功能
// async function testLoopbackFunction() {
//     if (!serialPort || !writer) {
//         alert('请先连接串口');
//         return;
//     }
    
//     try {
//         debugLogMessage('开始回环测试...');
//         const testMessage = 'LOOPBACK_TEST_' + Date.now() + '\r\n';
        
//         // 发送测试消息
//         await writer.write(new TextEncoder().encode(testMessage));
//         debugLogMessage(`已发送测试消息: ${testMessage.trim()}`);
        
//         // 设置超时
//         const timeout = setTimeout(() => {
//             debugLogMessage('回环测试超时，未收到响应');
//             alert('回环测试失败：未收到响应');
//         }, 2000);
        
//         // 临时监听响应
//         const tempReader = serialPort.readable.getReader();
//         try {
//             while (true) {
//                 const { value, done } = await tempReader.read();
//                 if (done) break;
                
//                 const text = new TextDecoder().decode(value);
//                 if (text.includes(testMessage.trim())) {
//                     clearTimeout(timeout);
//                     debugLogMessage('回环测试成功！');
//                     alert('回环测试成功！串口工作正常');
//                     break;
//                 }
//             }
//         } finally {
//             tempReader.releaseLock();
//         }
//     } catch (error) {
//         debugLogMessage(`回环测试失败: ${error.message}`);
//         alert(`回环测试失败: ${error.message}`);
//     }
// }

// // 测试换行符功能
// async function testNewlineFunction() {
//     if (!serialPort || !writer) {
//         alert('请先连接串口');
//         return;
//     }
    
//     try {
//         debugLogMessage('=== 开始换行符测试 ===');
        
//         const tests = [
//             { name: "无换行符", data: "TEST_NO_NEWLINE" },
//             { name: "LF结尾 (\\n)", data: "TEST_LF\n" },
//             { name: "CR结尾 (\\r)", data: "TEST_CR\r" },
//             { name: "CR+LF结尾 (\\r\\n)", data: "TEST_CRLF\r\n" },
//             { name: "多行测试", data: "LINE1\nLINE2\r\nLINE3\rLINE4" }
//         ];
        
//         for (const test of tests) {
//             try {
//                 await writer.write(new TextEncoder().encode(test.data));
//                 debugLogMessage(`已发送: ${test.name}`);
//                 appendToReceivedText(`[测试] ${test.name}: ${formatSentDataForDisplay(test.data)}\n`);
//                 await new Promise(resolve => setTimeout(resolve, 500)); // 延迟500ms
//             } catch (error) {
//                 debugLogMessage(`发送测试失败: ${test.name} - ${error.message}`);
//             }
//         }
        
//         debugLogMessage('=== 换行符测试完成 ===');
        
//     } catch (error) {
//         debugLogMessage(`换行符测试失败: ${error.message}`);
//         alert(`换行符测试失败: ${error.message}`);
//     }
// }

// // 发送预设指令
// async function sendPresetCommand() {
//     const command = presetCommands.value;
//     if (!command) return;
    
//     if (command === 'custom') {
//         const customCommand = prompt('请输入自定义AT指令:', 'AT');
//         if (customCommand) {
//             sendText.value = customCommand;
//             presetCommands.value = '';
//         }
//         return;
//     }
    
//     sendText.value = command;
//     await sendSerialData();
// }

// // 格式化发送数据显示
// function formatSentDataForDisplay(data) {
//     let display = data;
    
//     // 显示控制字符
//     if (showControlChars.checked) {
//         display = display.replace(/\r/g, '\\r')
//                        .replace(/\n/g, '\\n\n')
//                        .replace(/\t/g, '\\t');
//     }
    
//     return display;
// }

// // // 更新字节计数
// function updateByteCount() {
//     byteCount.textContent = `${receivedByteCount} 字节`;
// }

// // // 导出调试日志
// function exportDebugLog() {
//     if (!debugLog.value) {
//         alert('没有调试信息可导出');
//         return;
//     }
    
//     try {
//         const blob = new Blob([debugLog.value], { type: 'text/plain' });
//         const url = URL.createObjectURL(blob);
        
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `serial_debug_${new Date().toISOString().slice(0, 10)}.log`;
//         a.click();
        
//         URL.revokeObjectURL(url);
//         debugLogMessage('调试日志已导出');
//     } catch (error) {
//         debugLogMessage(`导出调试日志失败: ${error.message}`);
//         alert('导出失败，请查看调试信息');
//     }
// }

// // 初始化应用
// document.addEventListener('DOMContentLoaded', init);



;(function () {
	if (!('serial' in navigator)) {
		alert('当前浏览器不支持串口操作,请更换Edge或Chrome浏览器')
	}
	let serialPort = null
	navigator.serial.getPorts().then((ports) => {
		if (ports.length > 0) {
			serialPort = ports[0]
			serialStatuChange(true)
		}
	})
	let reader
	//串口目前是打开状态
	let serialOpen = false
	//串口目前是手动关闭状态
	let serialClose = true
	//串口分包合并时钟
	let serialTimer = null
	//串口循环发送时钟
	let serialloopSendTimer = null
	//串口缓存数据
	let serialData = []
	//文本解码
	let textdecoder = new TextDecoder()
	let currQuickSend = []
	//快捷发送列表
	let quickSendList = [
		{
			name: 'ESP32 AT指令',
			list: [
				{
					name: '测试 AT 启动',
					content: 'AT',
					hex: false,
				},
				{
					name: '重启模块',
					content: 'AT+RST',
					hex: false,
				},
				{
					name: '查看版本信息',
					content: 'AT+GMR',
					hex: false,
				},
				{
					name: '查询当前固件支持的所有命令及命令类型',
					content: 'AT+CMD?',
					hex: false,
				},
				{
					name: '进⼊ Deep-sleep 模式 1分钟',
					content: 'AT+GSLP=60000',
					hex: false,
				},
				{
					name: '开启AT回显功能',
					content: 'ATE1',
					hex: false,
				},
				{
					name: '关闭AT回显功能',
					content: 'ATE0',
					hex: false,
				},
				{
					name: '恢复出厂设置',
					content: 'AT+RESTORE',
					hex: false,
				},
				{
					name: '查询 UART 当前临时配置',
					content: 'AT+UART_CUR?',
					hex: false,
				},
				{
					name: '设置 UART 115200 保存flash',
					content: 'AT+UART_DEF=115200,8,1,0,3',
					hex: false,
				},
				{
					name: '查询 sleep 模式',
					content: 'AT+SLEEP?',
					hex: false,
				},
				{
					name: '查询当前剩余堆空间和最小堆空间',
					content: 'AT+SYSRAM?',
					hex: false,
				},
				{
					name: '查询系统提示信息',
					content: 'AT+SYSMSG?',
					hex: false,
				},
				{
					name: '查询 flash 用户分区',
					content: 'AT+SYSFLASH?',
					hex: false,
				},
				{
					name: '查询本地时间戳',
					content: 'AT+SYSTIMESTAMP?',
					hex: false,
				},
				{
					name: '查询 AT 错误代码提示',
					content: 'AT+SYSLOG?',
					hex: false,
				},
				{
					name: '设置/查询系统参数存储模式',
					content: 'AT+SYSPARA?',
					hex: false,
				},
			],
		},
	]
	let worker = null
	//工具配置
	let toolOptions = {
		//自动滚动
		autoScroll: true,
		//显示时间 界面未开放
		showTime: true,
		//日志类型
		logType: 'hex&text',
		//分包合并时间
		timeOut: 50,
		//末尾加回车换行
		addCRLF: false,
		//HEX发送
		hexSend: false,
		//循环发送
		loopSend: false,
		//循环发送时间
		loopSendTime: 1000,
		//输入的发送内容
		sendContent: '',
		//快捷发送选中索引
		quickSendIndex: 0,
	}

	//生成快捷发送列表
	let quickSend = document.getElementById('serial-quick-send')
	let sendList = localStorage.getItem('quickSendList')
	if (sendList) {
		quickSendList = JSON.parse(sendList)
	}
	quickSendList.forEach((item, index) => {
		let option = document.createElement('option')
		option.innerText = item.name
		option.value = index
		quickSend.appendChild(option)
	})

	//快捷发送列表被单击
	document.getElementById('serial-quick-send-content').addEventListener('click', (e) => {
		let curr = e.target
		if (curr.tagName != 'BUTTON') {
			curr = curr.parentNode
		}
		if (curr.tagName != 'BUTTON') {
			return
		}
		const index = Array.from(curr.parentNode.parentNode.children).indexOf(curr.parentNode)
		if (curr.classList.contains('quick-remove')) {
			currQuickSend.list.splice(index, 1)
			curr.parentNode.remove()
			saveQuickList()
			return
		}
		if (curr.classList.contains('quick-send')) {
			let item = currQuickSend.list[index]
			if (item.hex) {
				sendHex(item.content)
				return
			}
			sendText(item.content)
		}
	})
	//快捷列表双击改名
	document.getElementById('serial-quick-send-content').addEventListener('dblclick', (e) => {
		let curr = e.target
		if (curr.tagName != 'INPUT' || curr.type != 'text') {
			return
		}
		const index = Array.from(curr.parentNode.parentNode.children).indexOf(curr.parentNode)
		changeName((name) => {
			currQuickSend.list[index].name = name
			curr.parentNode.outerHTML = getQuickItemHtml(currQuickSend.list[index])
			saveQuickList()
		}, currQuickSend.list[index].name)
	})
	//快捷发送列表被改变
	document.getElementById('serial-quick-send-content').addEventListener('change', (e) => {
		let curr = e.target
		if (curr.tagName != 'INPUT') {
			return
		}
		const index = Array.from(curr.parentNode.parentNode.children).indexOf(curr.parentNode)
		if (curr.type == 'text') {
			currQuickSend.list[index].content = curr.value
		}
		if (curr.type == 'checkbox') {
			currQuickSend.list[index].hex = curr.checked
		}
		saveQuickList()
	})
	function saveQuickList() {
		localStorage.setItem('quickSendList', JSON.stringify(quickSendList))
	}

	const quickSendContent = document.getElementById('serial-quick-send-content')
	//快捷发送列表更换选项
	quickSend.addEventListener('change', (e) => {
		let index = e.target.value
		if (index != -1) {
			changeOption('quickSendIndex', index)
			currQuickSend = quickSendList[index]
			//
			quickSendContent.innerHTML = ''
			currQuickSend.list.forEach((item) => {
				quickSendContent.innerHTML += getQuickItemHtml(item)
			})
		}
	})
	//添加快捷发送
	document.getElementById('serial-quick-send-add').addEventListener('click', (e) => {
		const item = {
			name: '发送',
			content: '',
			hex: false,
		}
		currQuickSend.list.push(item)
		quickSendContent.innerHTML += getQuickItemHtml(item)
		saveQuickList()
	})
	function getQuickItemHtml(item) {
		return `<div class="d-flex p-1 border-bottom quick-item">
			<button type="button" title="移除该项" class="btn btn-sm btn-outline-secondary me-1 quick-remove"><i class="bi bi-x"></i></button>
			<input class="form-control form-control-sm me-1" placeholder="要发送的内容,双击改名" value="${item.content}">
			<button class="flex-shrink-0 me-1 align-self-center btn btn-secondary btn-sm  quick-send" title="${item.name}">${item.name}</button>
			<input class="form-check-input flex-shrink-0 align-self-center" type="checkbox" ${item.hex ? 'checked' : ''}>
		</div>`
	}
	//快捷发送分组新增
	document.getElementById('serial-quick-send-add-group').addEventListener('click', (e) => {
		changeName((name) => {
			quickSendList.push({
				name: name,
				list: [],
			})
			quickSend.innerHTML += `<option value="${quickSendList.length - 1}">${name}</option>`
			quickSend.value = quickSendList.length - 1
			quickSend.dispatchEvent(new Event('change'))
			saveQuickList()
		})
	})
	//快捷发送分组重命名
	document.getElementById('serial-quick-send-rename-group').addEventListener('click', (e) => {
		changeName((name) => {
			currQuickSend.name = name
			quickSend.options[quickSend.value].innerText = name
			saveQuickList()
		}, currQuickSend.name)
	})
	//快捷发送分组删除
	document.getElementById('serial-quick-send-remove-group').addEventListener('click', (e) => {
		if (quickSendList.length == 1) {
			return
		}
		//弹窗询问是否删除
		if (!confirm('是否删除该分组?')) {
			return
		}
		quickSendList.splice(quickSend.value, 1)
		quickSend.options[quickSend.value].remove()
		quickSend.value = 0
		quickSend.dispatchEvent(new Event('change'))
		saveQuickList()
	})

	//导出
	document.getElementById('serial-quick-send-export').addEventListener('click', (e) => {
		let data = JSON.stringify(currQuickSend.list)
		let blob = new Blob([data], { type: 'text/plain' })
		saveAs(blob, currQuickSend.name + '.json')
	})
	//导入
	document.getElementById('serial-quick-send-import-btn').addEventListener('click', (e) => {
		document.getElementById('serial-quick-send-import').click()
	})
	document.getElementById('serial-quick-send-import').addEventListener('change', (e) => {
		let file = e.target.files[0]
		e.target.value = ''
		let reader = new FileReader()
		reader.onload = function (e) {
			let data = e.target.result
			try {
				let list = JSON.parse(data)
				currQuickSend.list.push(...list)
				list.forEach((item) => {
					quickSendContent.innerHTML += getQuickItemHtml(item)
				})
				saveQuickList()
			} catch (e) {
				showMsg('导入失败:' + e.message)
			}
		}
		reader.readAsText(file)
	})
	//重置参数
	document.getElementById('serial-reset').addEventListener('click', (e) => {
		if (!confirm('是否重置参数?')) {
			return
		}
		localStorage.removeItem('serialOptions')
		localStorage.removeItem('toolOptions')
		localStorage.removeItem('quickSendList')
		localStorage.removeItem('code')
		location.reload()
	})
	//导出参数
	document.getElementById('serial-export').addEventListener('click', (e) => {
		let data = {
			serialOptions: localStorage.getItem('serialOptions'),
			toolOptions: localStorage.getItem('toolOptions'),
			quickSendList: localStorage.getItem('quickSendList'),
			code: localStorage.getItem('code'),
		}
		let blob = new Blob([JSON.stringify(data)], { type: 'text/plain' })
		saveAs(blob, 'web-serial-debug.json')
	})
	//导入参数
	document.getElementById('serial-import').addEventListener('click', (e) => {
		document.getElementById('serial-import-file').click()
	})
	function setParam(key, value) {
		if (value == null) {
			localStorage.removeItem(key)
		} else {
			localStorage.setItem(key, value)
		}
	}
	document.getElementById('serial-import-file').addEventListener('change', (e) => {
		let file = e.target.files[0]
		e.target.value = ''
		let reader = new FileReader()
		reader.onload = function (e) {
			let data = e.target.result
			try {
				let obj = JSON.parse(data)
				setParam('serialOptions', obj.serialOptions)
				setParam('toolOptions', obj.toolOptions)
				setParam('quickSendList', obj.quickSendList)
				setParam('code', obj.code)
				location.reload()
			} catch (e) {
				showMsg('导入失败:' + e.message)
			}
		}
		reader.readAsText(file)
	})
	const serialCodeContent = document.getElementById('serial-code-content')
	const serialCodeSelect = document.getElementById('serial-code-select')
	const code = localStorage.getItem('code')
	if (code) {
		serialCodeContent.value = code
	}
	//代码编辑器
	var editor = CodeMirror.fromTextArea(serialCodeContent, {
		lineNumbers: true, // 显示行数
		indentUnit: 4, // 缩进单位为4
		styleActiveLine: true, // 当前行背景高亮
		matchBrackets: true, // 括号匹配
		mode: 'javascript', // 设置编辑器语言为JavaScript
		// lineWrapping: true,    // 自动换行
		theme: 'idea', // 主题
	})
	//读取本地文件
	serialCodeSelect.onchange = function (e) {
		var fr = new FileReader()
		fr.onload = function () {
			editor.setValue(fr.result)
		}
		fr.readAsText(this.files[0])
	}
	document.getElementById('serial-code-load').onclick = function () {
		serialCodeSelect.click()
	}
	//运行或停止脚本
	const code_editor_run = document.getElementById('serial-code-run')
	code_editor_run.addEventListener('click', (e) => {
		if (worker) {
			worker.terminate()
			worker = null
			code_editor_run.innerHTML = '<i class="bi bi-play"></i>运行'
			editor.setOption('readOnly', false)
			editor.getWrapperElement().classList.remove('CodeMirror-readonly')
			return
		}
		editor.setOption('readOnly', 'nocursor')
		editor.getWrapperElement().classList.add('CodeMirror-readonly')
		localStorage.setItem('code', editor.getValue())
		code_editor_run.innerHTML = '<i class="bi bi-stop"></i>停止'
		var blob = new Blob([editor.getValue()], { type: 'text/javascript' })
		worker = new Worker(window.URL.createObjectURL(blob))
		worker.onmessage = function (e) {
			if (e.data.type == 'uart_send') {
				writeData(new Uint8Array(e.data.data))
			} else if (e.data.type == 'uart_send_hex') {
				sendHex(e.data.data)
			} else if (e.data.type == 'uart_send_txt') {
				sendText(e.data.data)
			} else if (e.data.type == 'log') {
				addLogErr(e.data.data)
			}
		}
	})
	//读取参数
	let options = localStorage.getItem('serialOptions')
	if (options) {
		let serialOptions = JSON.parse(options)
		set('serial-baud', serialOptions.baudRate)
		set('serial-data-bits', serialOptions.dataBits)
		set('serial-stop-bits', serialOptions.stopBits)
		set('serial-parity', serialOptions.parity)
		set('serial-buffer-size', serialOptions.bufferSize)
		set('serial-flow-control', serialOptions.flowControl)
	}
	options = localStorage.getItem('toolOptions')
	if (options) {
		toolOptions = JSON.parse(options)
	}
	document.getElementById('serial-timer-out').value = toolOptions.timeOut
	document.getElementById('serial-log-type').value = toolOptions.logType
	document.getElementById('serial-auto-scroll').innerText = toolOptions.autoScroll ? '自动滚动' : '暂停滚动'
	document.getElementById('serial-add-crlf').checked = toolOptions.addCRLF
	document.getElementById('serial-hex-send').checked = toolOptions.hexSend
	document.getElementById('serial-loop-send').checked = toolOptions.loopSend
	document.getElementById('serial-loop-send-time').value = toolOptions.loopSendTime
	document.getElementById('serial-send-content').value = toolOptions.sendContent
	quickSend.value = toolOptions.quickSendIndex
	quickSend.dispatchEvent(new Event('change'))
	resetLoopSend()

	//实时修改选项
	document.getElementById('serial-timer-out').addEventListener('change', (e) => {
		changeOption('timeOut', parseInt(e.target.value))
	})
	document.getElementById('serial-log-type').addEventListener('change', (e) => {
		changeOption('logType', e.target.value)
		if (e.target.value.includes('ansi')) {
			serialLogs.classList.add('ansi')
		} else {
			serialLogs.classList.remove('ansi')
		}
	})
	document.getElementById('serial-auto-scroll').addEventListener('click', function (e) {
		let autoScroll = this.innerText != '自动滚动'
		this.innerText = autoScroll ? '自动滚动' : '暂停滚动'
		changeOption('autoScroll', autoScroll)
	})
	document.getElementById('serial-send-content').addEventListener('change', function (e) {
		changeOption('sendContent', this.value)
	})
	document.getElementById('serial-add-crlf').addEventListener('change', function (e) {
		changeOption('addCRLF', this.checked)
	})
	document.getElementById('serial-hex-send').addEventListener('change', function (e) {
		changeOption('hexSend', this.checked)
	})
	document.getElementById('serial-loop-send').addEventListener('change', function (e) {
		changeOption('loopSend', this.checked)
		resetLoopSend()
	})
	document.getElementById('serial-loop-send-time').addEventListener('change', function (e) {
		changeOption('loopSendTime', parseInt(this.value))
		resetLoopSend()
	})

	document.querySelectorAll('#serial-options .input-group input,#serial-options .input-group select').forEach((item) => {
		item.addEventListener('change', async (e) => {
			if (!serialOpen) {
				return
			}
			//未找到API可以动态修改串口参数,先关闭再重新打开
			await closeSerial()
			//立即打开会提示串口已打开,延迟100ms再打开
			setTimeout(() => {
				openSerial()
			}, 100)
		})
	})

	//重制发送循环时钟
	function resetLoopSend() {
		clearInterval(serialloopSendTimer)
		if (toolOptions.loopSend) {
			serialloopSendTimer = setInterval(() => {
				send()
			}, toolOptions.loopSendTime)
		}
	}

	//清空
	document.getElementById('serial-clear').addEventListener('click', (e) => {
		serialLogs.innerHTML = ''
	})
	//复制
	document.getElementById('serial-copy').addEventListener('click', (e) => {
		let text = serialLogs.innerText
		if (text) {
			copyText(text)
		}
	})
	//保存
	document.getElementById('serial-save').addEventListener('click', (e) => {
		let text = serialLogs.innerText
		if (text) {
			saveText(text)
		}
	})
	//发送
	document.getElementById('serial-send').addEventListener('click', (e) => {
		send()
	})

	const serialToggle = document.getElementById('serial-open-or-close')
	const serialLogs = document.getElementById('serial-logs')

	//选择串口
	document.getElementById('serial-select-port').addEventListener('click', async () => {
		// 客户端授权
		try {
			await navigator.serial.requestPort().then(async (port) => {
				closeSerial()
				serialPort = port
				serialStatuChange(true)
			})
		} catch (e) {
			console.error('获取串口权限出错' + e.toString())
		}
	})

	//关闭串口
	async function closeSerial() {
		if (serialOpen) {
			serialOpen = false
			reader?.cancel()
			serialToggle.innerHTML = '打开串口'
		}
	}

	//打开串口
	async function openSerial() {
		let SerialOptions = {
			baudRate: parseInt(get('serial-baud')),
			dataBits: parseInt(get('serial-data-bits')),
			stopBits: parseInt(get('serial-stop-bits')),
			parity: get('serial-parity'),
			bufferSize: parseInt(get('serial-buffer-size')),
			flowControl: get('serial-flow-control'),
		}
		// console.log('串口配置', JSON.stringify(SerialOptions))
		serialPort
			.open(SerialOptions)
			.then(() => {
				serialToggle.innerHTML = '关闭串口'
				serialOpen = true
				serialClose = false
				localStorage.setItem('serialOptions', JSON.stringify(SerialOptions))
				readData()
			})
			.catch((e) => {
				showMsg('打开串口失败:' + e.toString())
			})
	}

	//打开或关闭串口
	serialToggle.addEventListener('click', async () => {
		if (!serialPort) {
			showMsg('请先选择串口')
			return
		}

		if (serialPort.writable && serialPort.readable) {
			closeSerial()
			serialClose = true
			return
		}

		openSerial()
	})

	//设置读取元素
	function get(id) {
		return document.getElementById(id).value
	}
	function set(id, value) {
		return (document.getElementById(id).value = value)
	}

	//修改参数并保存
	function changeOption(key, value) {
		toolOptions[key] = value
		localStorage.setItem('toolOptions', JSON.stringify(toolOptions))
	}

	//串口事件监听
	navigator.serial.addEventListener('connect', (e) => {
		serialStatuChange(true)
		serialPort = e.target
		//未主动关闭连接的情况下,设备重插,自动重连
		if (!serialClose) {
			openSerial()
		}
	})
	navigator.serial.addEventListener('disconnect', (e) => {
		serialStatuChange(false)
		setTimeout(closeSerial, 500)
	})
	function serialStatuChange(statu) {
		let tip
		if (statu) {
			tip = '<div class="alert alert-success" role="alert">设备已连接</div>'
		} else {
			tip = '<div class="alert alert-danger" role="alert">设备已断开</div>'
		}
		document.getElementById('serial-status').innerHTML = tip
	}
	//串口数据收发
	async function send() {
		let content = document.getElementById('serial-send-content').value
		if (!content) {
			addLogErr('发送内容为空')
			return
		}
		if (toolOptions.hexSend) {
			await sendHex(content)
		} else {
			await sendText(content)
		}
	}

	//发送HEX到串口
	async function sendHex(hex) {
		const value = hex.replace(/\s+/g, '')
		if (/^[0-9A-Fa-f]+$/.test(value) && value.length % 2 === 0) {
			let data = []
			for (let i = 0; i < value.length; i = i + 2) {
				data.push(parseInt(value.substring(i, i + 2), 16))
			}
			await writeData(Uint8Array.from(data))
		} else {
			addLogErr('HEX格式错误:' + hex)
		}
	}

	//发送文本到串口
	async function sendText(text) {
		const encoder = new TextEncoder()
		writeData(encoder.encode(text))
	}

	//写串口数据
	async function writeData(data) {
		if (!serialPort || !serialPort.writable) {
			addLogErr('请先打开串口再发送数据')
			return
		}
		const writer = serialPort.writable.getWriter()
		if (toolOptions.addCRLF) {
			data = new Uint8Array([...data, 0x0d, 0x0a])
		}
		await writer.write(data)
		writer.releaseLock()
		addLog(data, false)
	}

	//读串口数据
	async function readData() {
		while (serialOpen && serialPort.readable) {
			reader = serialPort.readable.getReader()
			try {
				while (true) {
					const { value, done } = await reader.read()
					if (done) {
						break
					}
					dataReceived(value)
				}
			} catch (error) {
			} finally {
				reader.releaseLock()
			}
		}
		await serialPort.close()
	}

	//串口分包合并
	function dataReceived(data) {
		serialData.push(...data)
		if (toolOptions.timeOut == 0) {
			if (worker) {
				worker.postMessage({ type: 'uart_receive', data: serialData })
			}
			addLog(serialData, true)
			serialData = []
			return
		}
		//清除之前的时钟
		clearTimeout(serialTimer)
		serialTimer = setTimeout(() => {
			if (worker) {
				worker.postMessage({ type: 'uart_receive', data: serialData })
			}
			//超时发出
			addLog(serialData, true)
			serialData = []
		}, toolOptions.timeOut)
	}
	var ansi_up = new AnsiUp()
	//添加日志
	function addLog(data, isReceive = true) {
		let classname = 'text-primary'
		let form = '→'
		if (isReceive) {
			classname = 'text-success'
			form = '←'
		}
		newmsg = ''
		if (toolOptions.logType.includes('hex')) {
			let dataHex = []
			for (const d of data) {
				//转16进制并补0
				dataHex.push(('0' + d.toString(16).toLocaleUpperCase()).slice(-2))
			}
			if (toolOptions.logType.includes('&')) {
				newmsg += 'HEX:'
			}
			newmsg += dataHex.join(' ') + '<br/>'
		}
		if (toolOptions.logType.includes('text')) {
			let dataText = textdecoder.decode(Uint8Array.from(data))
			if (toolOptions.logType.includes('&')) {
				newmsg += 'TEXT:'
			}
			//转义HTML标签,防止内容被当作标签渲染
			newmsg += HTMLEncode(dataText)
		}
		if (toolOptions.logType.includes('ansi')) {
			const dataText = textdecoder.decode(Uint8Array.from(data))
			const html = ansi_up.ansi_to_html(dataText)
			newmsg += html
		}
		let time = toolOptions.showTime ? formatDate(new Date()) + '&nbsp;' : ''
		const template = '<div><span class="' + classname + '">' + time + form + '</span><br>' + newmsg + '</div>'
		let tempNode = document.createElement('div')
		tempNode.innerHTML = template
		serialLogs.append(tempNode)
		if (toolOptions.autoScroll) {
			serialLogs.scrollTop = serialLogs.scrollHeight - serialLogs.clientHeight
		}
	}
	//HTML转义
	function HTMLEncode(html) {
		var temp = document.createElement('div')
		temp.textContent != null ? (temp.textContent = html) : (temp.innerText = html)
		var output = temp.innerHTML
		temp = null
		return output
	}
	//HTML反转义
	function HTMLDecode(text) {
		var temp = document.createElement('div')
		temp.innerHTML = text
		var output = temp.innerText || temp.textContent
		temp = null
		return output
	}
	//系统日志
	function addLogErr(msg) {
		let time = toolOptions.showTime ? formatDate(new Date()) + '&nbsp;' : ''
		const template = '<div><span class="text-danger">' + time + ' 系统消息</span><br>' + msg + '</div>'
		let tempNode = document.createElement('div')
		tempNode.innerHTML = template
		serialLogs.append(tempNode)
		if (toolOptions.autoScroll) {
			serialLogs.scrollTop = serialLogs.scrollHeight - serialLogs.clientHeight
		}
	}

	//复制文本
	function copyText(text) {
		let textarea = document.createElement('textarea')
		textarea.value = text
		textarea.readOnly = 'readonly'
		textarea.style.position = 'absolute'
		textarea.style.left = '-9999px'
		document.body.appendChild(textarea)
		textarea.select()
		textarea.setSelectionRange(0, textarea.value.length)
		document.execCommand('copy')
		document.body.removeChild(textarea)
		showMsg('已复制到剪贴板')
	}

	//保存文本
	function saveText(text) {
		let blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
		saveAs(blob, 'serial.log')
	}

	//下载文件
	function saveAs(blob, filename) {
		if (window.navigator.msSaveOrOpenBlob) {
			navigator.msSaveBlob(blob, filename)
		} else {
			let link = document.createElement('a')
			let body = document.querySelector('body	')
			link.href = window.URL.createObjectURL(blob)
			link.download = filename
			// fix Firefox
			link.style.display = 'none'
			body.appendChild(link)
			link.click()
			body.removeChild(link)
			window.URL.revokeObjectURL(link.href)
		}
	}

	//弹窗
	const modalTip = new bootstrap.Modal('#model-tip')
	function showMsg(msg, title = 'Web Serial') {
		//alert(msg)
		document.getElementById('modal-title').innerHTML = title
		document.getElementById('modal-message').innerHTML = msg
		modalTip.show()
	}

	//当前时间 精确到毫秒
	function formatDate(now) {
		const hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours()
		const minute = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
		const second = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds()
		const millisecond = ('00' + now.getMilliseconds()).slice(-3)
		return `${hour}:${minute}:${second}.${millisecond}`
	}

	//左右折叠
	document.querySelectorAll('.toggle-button').forEach((element) => {
		element.addEventListener('click', (e) => {
			e.currentTarget.parentElement.querySelector('.collapse').classList.toggle('show')
			e.currentTarget.querySelector('i').classList.toggle('bi-chevron-compact-right')
			e.currentTarget.querySelector('i').classList.toggle('bi-chevron-compact-left')
		})
	})

	//设置名称
	const modalNewName = new bootstrap.Modal('#model-change-name')
	function changeName(callback, oldName = '') {
		set('model-new-name', oldName)
		modalNewName.show()
		document.getElementById('model-save-name').onclick = null
		document.getElementById('model-save-name').onclick = function () {
			callback(get('model-new-name'))
			modalNewName.hide()
		}
	}
})()
