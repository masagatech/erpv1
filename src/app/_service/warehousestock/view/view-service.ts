import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class WarehouseViewService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getwarehouseTransfer(req: any) {
        return this._dataserver.post("getwarehouseTransfer", req);
    }

}