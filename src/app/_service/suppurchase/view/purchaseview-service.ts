import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class PurchaseviewService {
    constructor(private _dataserver: DataService, private _router: Router) { }
    getpurchaseview(req: any) {
        return this._dataserver.post("getpurchaseview", req);
    }
}