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
    const { value,done} = await Serial.reader.read();
    if (done) {
        debugLogMessage("读取流结束");
        break;
    }
    //  //
    // let textdecoder = new TextDecoder();
    // let serialdata=[];
  
    // serialdata.push(...value);
    // let dataText = textdecoder.decode(Uint8Array.from(serialdata));
    // debugLogMessage(dataText);
     //
        
   
    Serial.receiveBuffer = new Uint8Array([...Serial.receiveBuffer, ...value]);
    
    Serial.receivedByteCount += value.length;
    byteCount.textContent = `${Serial.receivedByteCount} 字节`;
    
    debugLogMessage(`收到${value.length}字节数据`);

    await processReceiveBuffer();
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

let serialData=[];
let timeOut=50;
let serialTimer = null
async function processReceiveBuffer() {
    if (Serial.receiveBuffer.length === 0) return;
    const decoder = new TextDecoder();//解码器
    if(hexDisplay.checked){
            const hexStr = Array.from(Serial.receiveBuffer)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ');
          await appendToReceivedText(hexStr + ' ');
       
    }else{
        serialData.push(...Serial.receiveBuffer)
       
		
		//清除之前的时钟
		clearTimeout(serialTimer)
		serialTimer = setTimeout(async () => {
           
			// debugLogMessage(textdecoder.decode(Uint8Array.from(serialData)));
            await appendToReceivedText(processTextData(decoder.decode(Uint8Array.from(serialData))));
			serialData = []
		}, timeOut)
     
    }
    Serial.receiveBuffer = new Uint8Array(0);
    

}




// export	async function read2Data() {
// 		while (Serial.serialPort.readable) {
// 			Serial.reader = Serial.serialPort.readable.getReader()
// 			try {
// 				while (true) {
// 					const { value, done } = await Serial.reader.read()
// 					if (done) {
// 						break
// 					}
                   
// 					dataReceived(value)
// 				}
// 			} catch (error) {
// 			} finally {
// 				Serial.reader.releaseLock()
// 			}
// 		}
// 		await Serial.serialPort.close()
// 	}


