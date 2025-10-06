import { debugLogMessage } from "./debuglog.js";
import { presetCommands, sendText } from "./DOM.js"
import { sendSerialData } from "./Send.js";



export async function sendCmd() {

    const Cmd=presetCommands.value;
    if(!Cmd) return;
    if(Cmd==='custom'){
        const customCommand=prompt('请输入自定义AT指令:', 'AT');
        if(customCommand){
            sendText.value=customCommand;
            presetCommands.value='';
        }
        return;
    }
    sendText.value=Cmd;

    await sendSerialData();


}


let Cmd = {
        "AT": "AT",
        "AT+GMR": "AT+GMR (查询版本)",
        "AT+RST": "AT+RST (重启)",
        "AT+CWMODE=1": "AT+CWMODE (设置WiFi模式默认1)",
        "AT+CWMODE?":"AT+CWMODE?查看WiFi模式",
        "AT+CWLAP": "AT+CWLAP (扫描WiFi)",
        'AT+CWJAP="SSID","password"': "AT+CWJAP (连接WiFi)",
        "AT+CWQAP": "AT+CWQAP(断开WiFi连接)",
        "AT+CIFSR": "AT+CIFSR (获取IP地址)",
        'AT+CIPSTART="TCP","IP",PORT': "AT+CIPSTART(建立TCP连接)",
        "AT+RESTORE": "AT+RESTORE(恢复模块出厂设置)"
    };


export function ATCmd(){

        const  precmd=presetCommands;
        precmd.innerHTML = '';

        Object.entries(Cmd).forEach(([value, text]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            precmd.appendChild(option);
        });

        const cuscmd = document.createElement('option');
        cuscmd.value = 'custom';
        cuscmd.textContent = '自定义AT指令...';
        precmd.appendChild(cuscmd);
}


    

   
    