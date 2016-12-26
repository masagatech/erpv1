import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class RBService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    // Receipt Book

    getAllRB(req: any) {
        return this._dataserver.post("getAllRB", req)
    }

    getRBDetails(req: any) {
        return this._dataserver.post("getRBDetails", req)
    }

    saveRBDetails(req: any) {
        return this._dataserver.post("saveReceiptBook", req)
    }

    // Receipt Book Issued

    getAllRBI(req: any) {
        return this._dataserver.post("getAllRBI", req)
    }

    getRBIDetails(req: any) {
        return this._dataserver.post("getRBIDetails", req)
    }

    saveRBIDetails(req: any) {
        return this._dataserver.post("saveRBIDetails", req)
    }
}