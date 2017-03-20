import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class PurchaseService {
    constructor(private _dataserver: DataService, private _router: Router) { }
    getdocumentno(req: any) {
        return this._dataserver.post("getpurdocumentno", req);
    }
    savePurchaseInv(req: any) {
        return this._dataserver.post("savePurchaseInvoice", req);
    }
}
