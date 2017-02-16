import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class warstockViewService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getStockLedger(req: any) {
        return this._dataserver.post("getstockLedger", req);
    }

}