import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class DRService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getEmpDocRepo(req: any) {
        return this._dataserver.post("getEmpDocRepo", req)
    }

    saveEmpDocRepo(req: any) {
        return this._dataserver.post("saveEmpDocRepo", req)
    }
}