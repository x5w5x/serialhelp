import { buttonClick } from "./Button.js";
import { saveReceivedData } from "./Data.js";
import { debugLogMessage } from "./debuglog.js";
import { baudRateSelect, byteCount, clearBtn, clearSendBtn, connectBtn, receivedText, saveBtn, sendBtn, sendText, statusText } from "./DOM.js";
import { sendSerialData } from "./Send.js";
import { checkPreviouslyGrantedPorts, connectSerial, disconnectSerial } from "./Serial.js";
import { Serial } from "./Value.js";

function init() {
    if(!('serial'in navigator)){
        const errorMsg=' 错误: 您的浏览器不支持Web Serial API,请使用Chrome/Edge 89+或Opera 76+';
        statusText.TwxtContene=errorMsg;
        debugLogMessage(errorMsg);
        document.querySelectorAll('button').forEach(btn=>{
            if(btn.id  !='clearBtn'&&btn.id !='clearDebugBtn'&&btn.id!='clearSendBtn'){
                btn.disabled=true;
            }
        });
        return;
    }
    setupEventListeners();
    checkPreviouslyGrantedPorts();
    
    debugLogMessage('在线串口调试助手已初始化');
}

function setupEventListeners() {
    //连接
    connectBtn.addEventListener('click',async()=>{
        if(Serial.serialPort){
        disconnectSerial();
        }else{
            connectSerial();
        }
    });
    //波特率
    baudRateSelect.addEventListener('change',(e)=>{
        if(e.target.value==='custom'){
            customBaudRate.style.display='inline-block';
            customBaudRate.focus();
        }else{
            customBaudRate.style.display='none';
        }
    });
    //发送
    sendBtn.addEventListener('click',async ()=>{
        await sendSerialData();
    });
    //接收区
    clearBtn.addEventListener('click',()=>{
        receivedText.value="";
        Serial.receivedByteCount=0;
        byteCount.textContent = `${Serial.receivedByteCount} 字节`;
        debugLogMessage("接收区已清空");
    });
    //发送区
    clearSendBtn.addEventListener('click',()=>{
       sendText.value="";
       debugLogMessage("发送区已清空")
    });

    buttonClick();



    
}


document.addEventListener('DOMContentLoaded', init);