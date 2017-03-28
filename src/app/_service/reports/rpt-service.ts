import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class ReportsService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getBankView(req: any) {
        return this._dataserver.post("getBankView", req)
    }

    getBankBook(req: any) {
        return this._dataserver.post("getBankBook", req);
    }

    getBankDashboard(req: any) {
        return this._dataserver.post("getBankDashboard", req);
    }
}