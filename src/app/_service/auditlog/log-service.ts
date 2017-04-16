import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class LogService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getAuditLog(req: any) {
        return this._dataserver.post("getAuditLog", req)
    }

    saveAuditLog(req: any) {
        return this._dataserver.post("saveAuditLog", req)
    }
}