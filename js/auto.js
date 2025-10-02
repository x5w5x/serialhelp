//2025-10-1新功能
export const Auto ={
reCount : 0,
 maxReCount :5, //
 reDelay : 2000, //
 isAutoEn: true, //自动重连使能
 isDisCon : false,//是否手动断开连接
predPort :null, //首选端口

};

export function addautoBtn() {
    const auto=document.createElement("input");
    auto.type="checkbox";
    auto.id="autoReconnect";
    auto.checked=true;
    auto.addEventListener('change',(e)=>{
        Auto.isAutoEn=e.target.checked;
    });
    const autolab=document.createElement("label");
    autolab.textContent="自动重连";
    autolab.prepend(auto);
    const setting=document.querySelector(".connection-settings");
    setting.appendChild(autolab);
}