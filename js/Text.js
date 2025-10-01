import { debugLogMessage } from "./debuglog.js";
import { autoNewline, autoScroll, receivedText, showControlChars, showTimestamp } from "./DOM.js";

export function processTextData(text) {
    let processed = text;
    
    // 显示控制字符
    if (showControlChars.checked) {
        processed = processed.replace(/[\x00-\x1F]/g, c => {
            return `[${c.charCodeAt(0).toString(16).padStart(2, '0')}]`;
        });
    }
    
    // 添加时间戳
    if (showTimestamp.checked) {
        const now = new Date();
        const timestamp = `[${now.toLocaleTimeString()}] `;
        processed = processed.replace(/\n/g, '\n' + timestamp);
        processed = timestamp + processed;
    }
    
    // 自动换行
    if (autoNewline.checked && !processed.endsWith('\n')) {
        processed += '\n';
    }

    return processed;
}

export function appendToReceivedText(text) {
    const maxLines=1000;//可能内存溢出
    //换行分割
    const currentLines =receivedText.value.split('\n');
    if(currentLines.length>maxLines){
        receivedText.value=currentLines.slice(-maxLines).join('\n');
    }
    //追加新内容
    receivedText.value +=text;
    //滚动
    if(autoScroll.checked){
        receivedText.scrollTop=receivedText.scrollHeight;
    }
    
}
