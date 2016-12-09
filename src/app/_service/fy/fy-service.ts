import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class FYService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getFinancialYear(req: any) {
        return this._dataserver.post("GetFinancialYear", req)
    }

    saveFinancialYear(req: any) {
        return this._dataserver.post("SaveFinancialYear", req)
    }
}