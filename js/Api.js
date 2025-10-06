import { debugLogMessage } from './debuglog.js';
import {
    baudRateSelect,
    dataBitsSelect,
    stopBitsSelect,
    paritySelect,
    receivedText,
    sendText,
    hexDisplay,
    hexSend,
    autoNewline,
    showTimestamp,
    autoScroll,
    appendNewline,
    newlineType,
    repeatSend,
    repeatInterval,
    showControlChars
} from './DOM.js';

// 收集所有配置和数据
export const Data = () => {
    return {
        // 串口配置
        baudRate: baudRateSelect.value,
        dataBits: dataBitsSelect.value,
        stopBits: stopBitsSelect.value,
        parity: paritySelect.value,
        
        // 接收区数据
        receivedText: receivedText.value,
        
        // 显示设置
        hexDisplay: hexDisplay.checked,
        autoNewline: autoNewline.checked,
        showTimestamp: showTimestamp.checked,
        autoScroll: autoScroll.checked,
        showControlChars: showControlChars.checked,
        
        // 发送设置
        hexSend: hexSend.checked,
        appendNewline: appendNewline.checked,
        newlineType: newlineType.value,
        repeatSend: repeatSend.checked,
        repeatInterval: repeatInterval.value,
        
        // 发送区数据
        sendText: sendText.value
    };
};

// 恢复所有配置和数据
export const restData = (data) => {
    // 恢复串口配置
    baudRateSelect.value = data.baudRate;
    dataBitsSelect.value = data.dataBits;
    stopBitsSelect.value = data.stopBits;
    paritySelect.value = data.parity;
    
    // 恢复接收区数据
    receivedText.value = data.receivedText || '';
    
    // 恢复显示设置
    hexDisplay.checked = data.hexDisplay || false;
    autoNewline.checked = data.autoNewline || false;
    showTimestamp.checked = data.showTimestamp || false;
    autoScroll.checked = data.autoScroll || true;
    showControlChars.checked = data.showControlChars || false;
    
    // 恢复发送设置
    hexSend.checked = data.hexSend || false;
    appendNewline.checked = data.appendNewline || true;
    newlineType.value = data.newlineType || '\n';
    repeatSend.checked = data.repeatSend || false;
    repeatInterval.value = data.repeatInterval || '1000';
    
    // 恢复发送区数据
    sendText.value = data.sendText || '';
};
const API_BASE_URL = 'http://localhost:3000';
//连接设备标识ID用于访问数据库
export let ID ='';
let isfile='';
export async function getID() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/id`);
        const data = await response.json();
        // ID=data.id
        // isfile=data.fileExists
        return data.id

    } catch (error) {
        console.log(`获取ID出错${error}`);
        return null;
    }
    
}





export function setID(){
    getID().then(id => {
    if (id) {
       ID=id;
    }
});
}


// 保存数据到后端 ID+数据
//ID是表头 用来保存访问数据
//数据是这样的
// {"baudRate":"115200","dataBits":"8","stopBits":"1","parity":"none","receivedText":"","hexDisplay":false,"autoNewline":false,"showTimestamp":false,"autoScroll":true,"showControlChars":false,"hexSend":false,"appendNewline":true,"newlineType":"\\n","repeatSend":false,"repeatInterval":"1000","sendText":""}
export async function PostData() {
    const data =Data();
    try {
        const response = await fetch(`${API_BASE_URL}/api/save/${ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('保存失败');
        }
        return true;
    } catch (error) {
        console.error('保存数据出错:', error);
        return false;
    }
};

// 从后端加载数据
export async function loadData(){
    try {
        const response = await fetch(`${API_BASE_URL}/api/load/${ID}`);
        if (!response.ok) {
            throw new Error('加载失败');
        }
        const data = await response.json();
        restData(data);
        return true;
    } catch (error) {
        console.error('加载数据出错:', error);
        return false;
    }
};

// 创建防抖函数
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// 创建防抖的保存函数
export const debouncedSave = debounce(PostData, 1000);
export const debouncedlode = debounce(loadData, 10000);