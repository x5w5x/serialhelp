
import { addLog, FileSe, } from "./esptool.js";

export function mybin() {
    const select = document.getElementById('h3');
    const binselect = document.createElement('select');
    binselect.setAttribute('id', 'binselect');
    binselect.setAttribute('class', 'form-select');

    const option = document.createElement('option');
    option.value = '';
    option.textContent = '-- 选择默认固件 --';
    binselect.appendChild(option);

    const options = [
        {
            path: './bin/Ai-Thinker_ESP8266_DOUT_8Mbit_v1.5.4.1-a_20171130.bin',
            name: 'Ai-Thinker ESP8266 DOUT 8Mbit v1.5.4.1-a',
            address: '0x00000'
        },
        {
            path: './bin/Ai-Thinker_ESP8266_DOUT_32Mbit_v1.5.4.1-a_20171130.bin',
            name: 'Ai-Thinker ESP8266 DOUT 32Mbit v1.5.4.1-a',
            address: '0x00000'
        }
    ];

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.path;
        opt.textContent = option.name;
        opt.dataset.address = option.address;
        binselect.appendChild(opt);
    });
    select.appendChild(binselect);

    binselect.addEventListener('change', async (e) => {
        const sop = e.target.options[e.target.selectedIndex];
        const sfile = sop.value;

        if (sfile) {
            try {
                const file = await fetch(sfile);
                if (!file.ok) throw new Error('文件获取失败');
                const blob = await file.blob();
                const fData = new File([blob], sfile.split('/').pop(), { type: 'application/octet-stream' });

                const faddr = document.getElementById('flash-addr');
                if (faddr) {
                    faddr.value = sop.dataset.address || '0x00000';
                }
                FileSe(fData);

                addLog(`建议烧录地址: ${selectedOption.dataset.address || '0x00000'}`);

            } catch (error) {

            }
        }
    });

}





mybin();

