import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class DNService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    viewDebitNote(req: any) {
        return this._dataserver.post("GetDebitNote", req)
    }

    saveDebitNote(req: any) {
        return this._dataserver.post("SaveDebitNote", req)
    }
}