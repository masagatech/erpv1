import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class ALSService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getAuditLockSetting(req: any) {
        return this._dataserver.post("GetAuditLockSetting", req)
    }

    saveAuditLockAction(req: any) {
        return this._dataserver.post("SaveAuditLockAction", req)
    }
}