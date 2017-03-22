import { Pipe } from "@angular/core";

@Pipe({
  name: "_currency"
})
export class _currencyPipe {
  transform(money: any, args: any): any {
    
    return args.currsym +""+ money.format(args.decimals, 3, '.', ',');
    // toFixed(args.decimals).toString();
  }
}