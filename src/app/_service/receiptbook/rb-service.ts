import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class RBService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getAllRB(req: any) {
        return this._dataserver.post("getAllRB", req)
    }

    getRBDetails(req: any) {
        return this._dataserver.post("getRBDetails", req)
    }

    saveReceiptBook(req: any) {
        return this._dataserver.post("saveReceiptBook", req)
    }
}