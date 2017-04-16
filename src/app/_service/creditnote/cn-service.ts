import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class CNService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getCreditNote(req: any) {
        return this._dataserver.post("getCreditNote", req)
    }

    saveCreditNote(req: any) {
        return this._dataserver.post("saveCreditNote", req)
    }
}