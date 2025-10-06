import { addAi } from "./Ai.js";
import { debouncedlode, debouncedSave, getID, ID, loadData, PostData, setID,} from "./Api.js";
import { addautoBtn, Auto } from "./auto.js";
import { buttonClick } from "./Button.js";
import { ATCmd } from "./Cmd.js";
import { saveReceivedData } from "./Data.js";
import { debugLogMessage, isdebug } from "./debuglog.js";
import { baudRateSelect, byteCount, clearBtn, clearSendBtn, connectBtn, dataBitsSelect, paritySelect, receivedText, saveBtn, sendBtn, sendText, statusText, stopBitsSelect } from "./DOM.js";
import { sendSerialData } from "./Send.js";
import { checkPreviouslyGrantedPorts, connectSerial, disconnectSerial, reConnect } from "./Serial.js";
import { Serial } from "./Value.js";

async function init() {
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
    //检测重连
   navigator.serial.addEventListener('connect', (e) => {
        if(Auto.isAutoEn){
            debugLogMessage('正在尝试重新连接');
            reConnect();
        }
   });
    //连接
    connectBtn.addEventListener('click',async()=>{
        if(Serial.serialPort){
        await disconnectSerial();
        }else{
        await  connectSerial();
        }
    });
    //波特率
    baudRateSelect.addEventListener('change',(e)=>{
        if(e.target.value==='custom'){
            customBaudRate.style.display='inline-block';
            customBaudRate.focus();
        }else{
            customBaudRate.style.display='none';
            reConnect();
            // debouncedSave();
        }
    });
    //数据位
    dataBitsSelect.addEventListener('change',()=>{
        reConnect();
        // debouncedSave();
    });
    //
    stopBitsSelect.addEventListener('change',()=>{
        reConnect();
        // debouncedSave();
    });
    //
    paritySelect.addEventListener('change',()=>{
        reConnect();
        // debouncedSave();
    });
    

    //发送
    sendBtn.addEventListener('click',async ()=>{
        await sendSerialData();
        // debouncedSave();
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
    addautoBtn();
    //
    isdebug();
    //
    ATCmd();
    // setID();
    
    // debouncedlode();
  
    // debouncedSave();


   

    
}

addAi();
document.addEventListener('DOMContentLoaded', init);

