import { debugLogMessage } from "./debuglog.js";
import { receivedText } from "./DOM.js";
import { Serial } from "./Value.js";

//有bug添加utf-8编码
export function saveReceivedData() {
    if(!receivedText.value){
        alert('没有数据可以保存');
        return;
    }
    try {
        const BOM=new Uint8Array([0xEF,0xBB,0XBF]);
        const text=new TextEncoder('utf-8').encode(receivedText.value);
        const data=new Uint8Array(BOM.length+text.length);
        data.set(BOM);
        data.set(text,BOM.length);

        const blob =new Blob([data],{type:"text/plain;charset=utf-8"});
        const url =URL.createObjectURL(blob);//创建一个url
        const a=document.createElement('a');//创建一个a标签
        a.href =url;//设置a标签的href属性为url
        a.download = `Serial_log_${new Date().toISOString().slice(0,10)}.txt`;//设置a标签的download属性为文件名
        a.click();//模拟点击a标签，触发下载
        URL.revokeObjectURL(url);//释放url
        debugLogMessage(`数据已保存到文件 Serial_log_${new Date().toISOString().slice(0,10)}.txt`);

    } catch (error) {
        debugLogMessage(`保存数据时出错：${error.message}`);
        alert('保存数据时出错,请查看调试信息');
    }
    
}

export function copyReceivedData() {
    if(!receivedText.value){
        alert('没有数据可以复制');
        return;
    }
    try {
        receivedText.select();
        document.execCommand('copy');
        debugLogMessage('数据已复制到剪贴板');
    } catch (error) {
        debugLogMessage(`复制数据时出错：${error.message}`);
    }
    
}