import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class ContrService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    saveCtrlcenter(req: any) {
        return this._dataserver.post("saveCtrlcenter", req);
    }

    getCtrlcenter(req: any) {
        return this._dataserver.post("getCtrlcenter", req);
    }
}