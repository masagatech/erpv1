import { Pipe } from "@angular/core";

@Pipe({
  name: "_currency"
})
export class _currencyPipe {
  transform(money: any, args: any): any {

    return args.currsym + "" + this.amt(money, args.decimals, 3, ',', '.');
    // toFixed(args.decimals).toString();
  }

  amt(a, n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
      num = parseFloat(a).toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
  }
}