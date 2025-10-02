
// //全局变量
export const Serial = {
  serialPort: null,
  reader: null,
  writer: null,
  sendHistory: [],
  historyIndex: -1,
  repeatTimer: null,
  receivedByteCount: 0,
  partialBuffer: new Uint8Array(0),
  
};