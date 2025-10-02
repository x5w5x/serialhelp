import { autoScroll, debugLog } from "./DOM.js";
//调试信息
export function debugLogMessage(message) {
    const timestamp=new Date().toLocaleTimeString();
    debugLog.value+=`[${timestamp}] ${message}\n`;
    if(autoScroll.checked){
        debugLog.scrollTop=debugLog.scrollHeight;
    }
    console.log(message);
    
}


export function exportDebugLog() {
   try {
    const blob = new Blob([debugLog.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `serial_debug_${new Date().toISOString().slice(0, 10)}.log`;
        a.click();
        
        URL.revokeObjectURL(url);
        debugLogMessage('调试日志已导出');
   } catch (error) {
      debugLogMessage(`导出调试日志失败: ${error.message}`);
        alert('导出失败，请查看调试信息');
  }
    
}