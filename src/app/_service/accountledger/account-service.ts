import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class accountledger {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getctrldetail(req: any) {
        return this._dataserver.post("getctrldetails", req);
    }

    getaccountledger(req: any) {
        return this._dataserver.post("getAccountLedger", req);
    }

    saveAcLedger(req: any) {
        return this._dataserver.post("saveAccountLedger", req);
    }
}