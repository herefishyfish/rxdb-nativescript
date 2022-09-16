export class Utils {
  static numberToZedoPadHex(n: number): string {
    if (typeof n !== 'number') {
      return '';
    }
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }
}
