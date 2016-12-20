import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class bankReceiptService {
    constructor(private _dataserver: DataService, private _router: Router) {

    }

    getBankMaster(req: any) {
        return this._dataserver.post("getBankMaster", req);
    }
    saveBankReceipt(req:any)
    {
          return this._dataserver.post("savebankreciept", req);
    }

    getBankReceiptView(req:any)
    {
            return this._dataserver.post("getbankreciptview", req); 
    }
}