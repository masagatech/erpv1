import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class WarehouseAddService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    save(req: any) {
        return this._dataserver.post("saveWarehouse", req);
    }
    getwarehouse(req: any) {
        return this._dataserver.post("getwarehouse", req);
    }
}