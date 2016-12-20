import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class DRService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getDocRepo(req: any) {
        return this._dataserver.post("getDocRepo", req)
    }

    saveDocRepo(req: any) {
        return this._dataserver.post("saveDocRepo", req)
    }
}