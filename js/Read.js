import { debugLogMessage } from "./debuglog.js";
import { hexDisplay } from "./DOM.js";
import { appendToReceivedText, processTextData } from "./Text.js";
import { Serial } from "./Value.js";


export async function readData() {
    debugLogMessage("启动数据循环读取");
    try {
        if(!Serial.serialPort.readable){
            throw new Error("串口不可读");
        }
        Serial.reader = Serial.serialPort.readable.getReader();

        Serial.receiveBuffer = new Uint8Array(0);

    while (Serial.serialPort.readable) {
    const { value, done } = await Serial.reader.read();
    if (done) {
        debugLogMessage("读取流结束");
        break;
    }
    
    // 合并到缓冲区
    const Buffer = new Uint8Array(Serial.receiveBuffer.length + value.length);
    Buffer.set(Serial.receiveBuffer);
    Buffer.set(value, Serial.receiveBuffer.length);
    Serial.receiveBuffer = Buffer;
    
    Serial.receivedByteCount += value.length;
    byteCount.textContent = `${Serial.receivedByteCount} 字节`;
    
    debugLogMessage(`收到${value.length}字节数据，缓冲区: ${Serial.receiveBuffer.length}字节`);
    
    processReceiveBuffer();
    }
    } catch (error) {
        debugLogMessage(`读取数据时出错: ${error.message}`);
        if (error.name !== 'NetworkError') {
            statusText.textContent = `读取错误: ${error.message}`;
        }
        
        if (error.name === 'NetworkError') {
            disconnectSerial();
        }
    }finally{
        if(Serial.reader){
            Serial.reader.releaseLock();
            Serial.reader=null;
            debugLogMessage("读取器已释放");
        }
    }
    
}





function processReceiveBuffer() {
    if (Serial.receiveBuffer.length === 0) return;
    
    const decoder = new TextDecoder();//解码器
    const Str = decoder.decode(Serial.receiveBuffer);
    

    const n = Str.indexOf('\n');
    
    if (n >= 0) {
        // 找到完整行，处理到换行符之前的所有数据
        const End = n + 1; 
        const Data = Serial.receiveBuffer.slice(0,End);
        const lastData = Serial.receiveBuffer.slice(End);
        
        if(hexDisplay.checked){
            const hexStr = Array.from(Data)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ');
                appendToReceivedText(hexStr + ' ');
        }else{
        // 完整行
        const Text = decoder.decode(Data);
        appendToReceivedText(processTextData(Text));
    }
        
        // 更新缓冲区
        Serial.receiveBuffer = lastData;

        processReceiveBuffer();
    } else {

        if (Serial.receiveBuffer.length > 80) { // 缓冲区阈值
            if(hexDisplay.checked){
                const hexStr = Array.from(Serial.receiveBuffer)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ');
                appendToReceivedText(hexStr + ' ');

            }else{
            const text = decoder.decode(Serial.receiveBuffer);
            appendToReceivedText(processTextData(text));}
            Serial.receiveBuffer = new Uint8Array(0);
        }
       
    }
}