import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class CashFlowService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getCashFlow(req: any) {
        return this._dataserver.post("getcashflow", req)
    }

    saveCashFlow(req: any) {
        return this._dataserver.post("savecashflow", req)
    }
}