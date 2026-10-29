declare module 'mammoth' {
  export interface MammothOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: any;
    path?: string;
  }
  export interface ConvertResult {
    value: string;
    messages: any[];
  }
  export function convertToHtml(input: MammothOptions, options?: any): Promise<ConvertResult>;
  export function extractRawText(input: MammothOptions): Promise<ConvertResult>;
  const mammoth: {
    convertToHtml: typeof convertToHtml;
    extractRawText: typeof extractRawText;
  };
  export default mammoth;
}
