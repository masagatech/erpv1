import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class BankReceiptService {
    constructor(private _dataserver: DataService, private _router: Router) {

    }

    getBankMaster(req: any) {
        return this._dataserver.post("getBankMaster", req);
    }

    getBankReceipt(req: any) {
        return this._dataserver.post("getBankReceipt", req);
    }

    saveBankReciept(req: any) {
        return this._dataserver.post("saveBankReciept", req);
    }
}