import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class CompService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getCompany(req: any) {
        return this._dataserver.post("getCompany", req)
    }

    saveCompany(req: any) {
        return this._dataserver.post("saveCompany", req)
    }

    updateCompanyFYMapping(req: any) {
        return this._dataserver.post("UpdateCompanyFYMapping", req)
    }
}