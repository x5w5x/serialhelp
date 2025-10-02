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