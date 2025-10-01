import { debugLogMessage } from "./debuglog.js";
import { Serial } from "./Value.js";

export async function loadSendFile() {
    if(!Serial.serialPort||!Serial.writer){
        alert("串口未打开");
        return;
    }
    const file = document.createElement("input");
    file.type = "file";
    file.addEventListener("change", async (e) => {
        const file =e.target.files[0];
        if(!file)
            return;
         try {
            const text = await file.text();
            sendText.value = text;
            debugLogMessage(`已加载文件: ${file.name} (${file.size} 字节)`);
        } catch (error) {
            debugLogMessage(`加载文件失败: ${error.message}`);
            alert('加载文件失败');
        }

        
        
    });
    file.click();
    
}