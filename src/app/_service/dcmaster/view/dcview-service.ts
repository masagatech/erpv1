import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class dcviewService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    GetSalesOrderView(req: any) {
        return this._dataserver.post("getSalesOrderView", req);
    }
}