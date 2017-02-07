import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class materialAddService {
    constructor(private _dataserver: DataService, private _router: Router) { }
    getuom(req: any) {
        return this._dataserver.post("getuom", req);
    }

    saveMaterialmaster(req: any) {
        return this._dataserver.post("savematerialMaster", req);
    }
    getMaterialMaster(req: any) {
        return this._dataserver.post("getmaterialMaster", req);
    }
}