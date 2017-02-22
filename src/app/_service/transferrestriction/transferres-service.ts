import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class TransferrestrictionService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    saveTransferRes(req: any) {
        return this._dataserver.post("saveTransferRestriction", req);
    }

    getTransferRes(req: any) {
        return this._dataserver.post("getTransferRestriction", req);
    }

}