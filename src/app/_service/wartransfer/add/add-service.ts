import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class warTransferAddService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    saveWarehouse(req: any) {
        return this._dataserver.post("saveWarehouseTranf", req);
    }
    getwarehouseTransfer(req: any) {
        return this._dataserver.post("getwarehouseTransfer", req);
    }
}