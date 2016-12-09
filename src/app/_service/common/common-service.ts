import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class CommonService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getMasterOfMaster(req: any) {
        return this._dataserver.post("GetMasterOfMaster", req)
    }

    getAutoCompleteData(req: any) {
        return this._dataserver.post("GetAutoData", req)
    }
}