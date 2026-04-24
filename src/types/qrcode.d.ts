declare module 'qrcode' {
  type ToDataUrlOptions = {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    margin?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  };

  const QRCode: {
    toDataURL(text: string, options?: ToDataUrlOptions): Promise<string>;
    toCanvas(canvas: HTMLCanvasElement, text: string, options?: ToDataUrlOptions): Promise<void>;
  };

  export default QRCode;
}
