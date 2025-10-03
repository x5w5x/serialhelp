

//定时发送

import { debugLogMessage } from "./debuglog.js";
import { appendNewline, hexSend, isclear, newlineType, repeatInterval, repeatSend, sendText } from "./DOM.js";
import { appendToReceivedText } from "./Text.js";
import { Serial } from "./Value.js";
export function startRepeatSend(){
    if(Serial.repeatTimer) return;

    const time =parseInt(repeatInterval.value)||1000;
    if(time<100){
        alert('发送间隔不能小于100ms');
        repeatSend.checked=false;
        repeatInterval.disable=true;
        return;
    }
    debugLogMessage(`启动定时发送\n间隔${time}ms`);
    Serial.repeatTimer=setInterval(async ()=>{
        if(sendText.value.trim()){
            await sendSerialData();
        }
    },time);

}


export function stopRepeatSend(){

    if(Serial.repeatTimer){
        clearInterval(Serial.repeatTimer);
        Serial.repeatTimer=null;
        debugLogMessage('已停止定时发送')
    }
}

//有bug
export async function sendSerialData() {
    if(!Serial.sendHistory||!Serial.writer){
        if(!repeatSend.checked)
        alert('请先连接串口');
        return;
    }
    let data =sendText.value.trim();
    if(!data) return;
    try {
        const newlineChar=newlineType.value;
        const isHexMode =hexSend.checked;
        const shouldAppendNewline =appendNewline.checked;
        //
        const lines =data.split('\n');
        let lastLineIndex =lines.length-1;
        for(let i=0;i<lines.length;i++){
            let line =lines[i].trim();
            if(!line) continue;//空行跳过
            //判断AT
            const isATCommand=line.toUpperCase().startsWith('AT');
            //自动添加换行有bug
            if(shouldAppendNewline){
                if(isATCommand&&!line.endsWith('\r')&&!line.endsWith('\n')){
                    line+='\r\n';
                }else if(!isATCommand && !line.endsWith('\r') && !line.endsWith('\n')){
                    line+=newlineChar;
                }
            }
            //十六进制
            if(isHexMode){
                const hexArray = line.split(/\s+/).filter(x => x);
                const byteArray = new Uint8Array(hexArray.map(h => {
                    // 处理特殊转义字符
                    if (h === '\\n') return 0x0A;
                    if (h === '\\r') return 0x0D;
                    if (h === '\\t') return 0x09;
                    return parseInt(h, 16);
                }));
                
                await Serial.writer.write(byteArray);
                appendToReceivedText(`${'\n'}[发送] ${hexArray.join(' ')}\n`);
            }else{
                //文本
                await Serial.writer.write(new TextEncoder().encode(line));
                
                // 格式化显示发送的数据
                let displayText = line;
                if (showControlChars.checked) {
                    displayText = displayText.replace(/\r/g, '\\r')
                                           .replace(/\n/g, '\\n\n')
                                           .replace(/\t/g, '\\t');
                }
                appendToReceivedText(`${'\n'}[发送] ${displayText}\n`);

            }

            if(i<lastLineIndex||(i===lastLineIndex&&lines[i].trim())){
                await new Promise(resolve=>setTimeout(resolve,10));
            }
        }
        if(data && !Serial.sendHistory.includes(data.replace(/\r?\n$/, ''))) {
            Serial.sendHistory.unshift(data.replace(/\r?\n$/, ''));
              if ( Serial.sendHistory.length > 10) {
                 Serial.sendHistory.pop();
            }
        }
        Serial.historyIndex=-1;
        //自动清空发送区
        if(isclear.checked)
        sendText.value=" ";

    } catch (error) {
        debugLogMessage(`发送失败:${error.mesagg}`);
        statusText.textContent= " 发送失败";
        alert(`发送失败:${error.mesagg}`);
    }
    
}