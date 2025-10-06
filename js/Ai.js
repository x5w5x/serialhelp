
export function addAi(){
   const ai = document.querySelector('footer p i.fa-info-circle').parentNode;
   ai.appendChild(document.createTextNode('|ai快捷跳转->>|'));
    const link = [
        { href: 'https://yuanbao.tencent.com/chat/naQivTmsDa', text: '腾讯元宝'},
        { href: 'https://www.doubao.com/chat/?channel=microsoft&source=microsoft_db_14&type=daoh&theme=wangzjh', text: '豆包', },
        {href:'https://chat.deepseek.com/',text:'DeepSeek'},
    ];
    
    link.forEach((ailist, index) => {

        if (index > 0) {
            const separator = document.createElement('span');
            separator.textContent = ' | ';
            ai.appendChild(separator);
        }
        
        // 创建链接
        const link = document.createElement('a');
        link.href = ailist.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = `<i ></i>${ailist.text}`;
        
        ai.appendChild(link);
    });
    ai.appendChild(document.createTextNode('|<<--'));
        
}