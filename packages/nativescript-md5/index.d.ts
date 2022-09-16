export interface INativescriptMd5 {
  static hashForString(params: type): string;
}

export class NativescriptMd5 implements INativescriptMd5 {
  static hashForString(params: string): string;
}
