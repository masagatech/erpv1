import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class DNService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getDebitNote(req: any) {
        return this._dataserver.post("getDebitNote", req)
    }

    saveDebitNote(req: any) {
        return this._dataserver.post("saveDebitNote", req)
    }
}