import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class PDCService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getPDCDetails(req: any) {
        return this._dataserver.post("getpdc", req)
    }

    savePDCDetails(req: any) {
        return this._dataserver.post("savepdc", req)
    }
}