import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class WarehouseAddService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getItemsAutoCompleted(req: any) {
        return this._dataserver.post("getdcitemsdetails", req);
    }
    saveWarehouse(req: any) {
        return this._dataserver.post("saveWarehouseTranf", req);
    }
}