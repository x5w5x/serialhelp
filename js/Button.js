import { sendCmd } from "./Cmd.js";
import { copyReceivedData, saveReceivedData } from "./Data.js";
import { debugLogMessage, exportDebugLog } from "./debuglog.js";
import { clearDebugBtn, copyBtn, debugLog, exportDebugBtn, loadBtn, presetCommands, repeatInterval, repeatSend, saveBtn, sendPresetBtn, testLoopback, testNewlineBtn } from "./DOM.js";
import { loadSendFile } from "./File.js";
import { startRepeatSend, stopRepeatSend } from "./Send.js";



export function buttonClick() {
    saveBtn.addEventListener('click',saveReceivedData);
    copyBtn.addEventListener('click',copyReceivedData);
    loadBtn.addEventListener('click',loadSendFile);
    clearDebugBtn.addEventListener('click',()=> {
        debugLog.value = ' ';
        debugLogMessage('调试信息已清空');
    });
    exportDebugBtn.addEventListener('click',exportDebugLog);
    sendPresetBtn.addEventListener('click',sendCmd);
    presetCommands.addEventListener('change',(e)=>{
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
    repeatSend.addEventListener('change',(e)=>{
         repeatInterval.disabled = !e.target.checked;

        if (e.target.checked) {
            startRepeatSend();
        } else {
            stopRepeatSend();
        }
    });
   
    repeatInterval.addEventListener('input', (e) => {
    if (repeatSend.checked) {

        stopRepeatSend();
        //最小阈值
        if (e.target.value && e.target.value > 100) {
            startRepeatSend();
        }
    }
});
//待开发

   testLoopback.addEventListener('click',()=>{
        alert('待开发');
   })

   testNewlineBtn.addEventListener('click',()=>{
        alert('待开发')
   })

}