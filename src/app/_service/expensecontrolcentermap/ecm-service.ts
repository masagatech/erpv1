import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class ECMService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    // Receipt Book

    getAllExpenseCtrlMap(req: any) {
        return this._dataserver.post("getAllExpenseCtrlMap", req)
    }

    getExpenseCtrlMap(req: any) {
        return this._dataserver.post("getExpenseCtrlMap", req)
    }

    saveExpenseCtrlMap(req: any) {
        return this._dataserver.post("saveExpenseCtrlMap", req)
    }
}