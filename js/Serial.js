import { Auto } from "./auto.js";
import { debugLogMessage } from "./debuglog.js";
import { baudRateSelect, connectBtn, customBaudRate, dataBitsSelect, paritySelect, statusIndicator, stopBitsSelect } from "./DOM.js";
import { readData } from "./Read.js";
import { stopRepeatSend } from "./Send.js";
import { Serial } from "./Value.js";

//串口连接
export async function connectSerial() {
    debugLogMessage("===开始连接串口===");
    statusIndicator.className = 'status-indicator connecting';
    statusText.textContent = '正在连接...';
    connectBtn.disabled = true;
   

    try {
        const ports =await navigator.serial.getPorts();
        Auto.predPort=ports[0];
        if(!Auto.predPort){
        debugLogMessage("选择串口设备...");
        Serial.serialPort=await navigator.serial.requestPort();
        Auto.predPort=Serial.serialPort;
        debugLogMessage('已经选择了串口');
        }else{
            Serial.serialPort=Auto.predPort;
            debugLogMessage("使用上次连接的设备");
        }


        const baudRate=baudRateSelect.value=='custom'
        ?parseInt(customBaudRate.value)
        :parseInt(baudRateSelect.value);
        if(isNaN(baudRate)||baudRate<=0){
            throw new Error("无效的波特率");
        }

       
        
        const options = {
            baudRate: baudRate,
            dataBits: parseInt(dataBitsSelect.value),
            stopBits: parseInt(stopBitsSelect.value),
            parity: paritySelect.value,
            flowControl: 'none'
        };
        
        debugLogMessage(`尝试使用波特率:${baudRate} 数据位:${parseInt(dataBitsSelect.value)} 停止位:${parseInt(stopBitsSelect.value)}打开串口`)
       // 打开串口
        try {
            await Serial.serialPort.open(options);
            debugLogMessage("串口打开成功");
        } catch (openError) {
            debugLogMessage(`串口打开失败:${openError.debugLogMessage}`);
            debugLogMessage('开始自测试常见波特率');
            const commonBaudRates = [9600, 19200, 38400, 57600, 115200];//
            //后期改动态
            for (const rate of commonBaudRates) {
                if (rate === options.baudRate) continue;
                
                try {
                    await serialPort.open({...options, baudRate: rate});
                    debugLogMessage(`成功使用 ${rate}bps 打开`);
                    break;
                } catch (e) {
                    debugLogMessage(`波特率 ${rate} 也失败: ${e.message}`);
                    if (rate === commonBaudRates[commonBaudRates.length - 1]) {
                        throw new Error('所有尝试的波特率都失败');
                    }
                }
            }
        
        }
        //写入器初始化
        Serial.writer=Serial.serialPort.writable.getWriter();
        debugLogMessage("写入器初始化成功");
        connectBtn.textContent="断开连接"
        statusIndicator.className= 'status-indicator connected';
        statusText.textContent=`已连接(${baudRate} bps)`;

        readData();

        Serial.serialPort.addEventListener('disconnect', () => {
            debugLogMessage('设备已断开连接');
            disconnectSerial();
            alert('串口设备已断开\n检测是否接触不良或者人为断开');
        });
        debugLogMessage("===连接成功===");

        

    } catch (error) {
         debugLogMessage(`连接过程中出错: ${error.message}`);
        statusIndicator.className = 'status-indicator disconnected';
        
        let errorMessage = `连接失败: ${error.message}`;
        if (error instanceof DOMException) {
            if (error.name === 'SecurityError') {
                errorMessage = '连接失败: 请授予串口访问权限';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '连接失败: 未找到可用的串口设备';
            }
        }
    statusText.textContent = errorMessage; 
        await cleanupSerialResources();


    }finally{
        connectBtn.disabled=false;
    }
    
}
//检查
export async function checkPreviouslyGrantedPorts() {
try {
    const ports =await navigator.serial.getPorts();
    debugLogMessage(`找到${ports.length}个已授权的串口设备`);
    if(ports.length>0){
        Auto.predPort=ports[0];
        debugLogMessage("提示:可以自动连接上次使用的设备");
            debugLogMessage("尝试自动连接上次的设备...");
            connectSerial();
    }
} catch (error) {
    debugLogMessage(`检查授权端口时出错:${error.message}`);
    
}
    
}


//断开串口
export async function disconnectSerial() {
    debugLogMessage("===开始断开设备===");
    connectBtn.disabled=true;
    try {
        stopRepeatSend();
        await cleanupSerialResources();
        connectBtn.textContent="连接串口";
        statusIndicator.className='status-indicator disconnected';
        statusText.textContent="未连接";
        debugLogMessage("===已断开连接===");


    } catch (error) {
        debugLogMessage(`断开连接时出错:${error.message}`)
        statusText.textContent=`断开失败:${error.message}`;
    }
    finally{
        connectBtn.disabled=false;
    }
    
}


async function cleanupSerialResources() {
    if(Serial.reader){
        try {
            await Serial.reader.cancel();
        } catch (error) {
            debugLogMessage(`取消读取器时出错${error.message}`);
        }
        Serial.reader=null;
    }
    if(Serial.writer){
        try {
            await Serial.writer.releaseLock();
        } catch (error) {
            debugLogMessage(`释放写入器时出错:${error.message}`);
        }
        Serial.writer=null;
    }
    if(Serial.serialPort){
        try {
            await Serial.serialPort.close();
        } catch (error) {
            debugLogMessage(`关闭串口时出错:${error.message}`);
        }
        Serial.serialPort=null;
    }
    
}


export async function reConnect() {
    debugLogMessage("配置更改开始重连");
    await disconnectSerial();
    await connectSerial();
    debugLogMessage("重连成功");
    
}