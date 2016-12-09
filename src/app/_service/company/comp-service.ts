import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class CompService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    viewCompanyDetails(req: any) {
        return this._dataserver.post("GetCompanyMaster", req)
    }

    saveCompanyDetails(req: any) {
        return this._dataserver.post("SaveCompanyDetails", req)
    }

    updateCompanyFYMapping(req: any) {
        return this._dataserver.post("UpdateCompanyFYMapping", req)
    }
}