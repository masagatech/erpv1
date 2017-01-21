import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class ExpVoucherService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    // Receipt Book

    getAllExpenseVoucher(req: any) {
        return this._dataserver.post("getAllExpenseVoucher", req)
    }

    getExpenseVoucherDetails(req: any) {
        return this._dataserver.post("getExpenseVoucherDetails", req)
    }

    saveExpenseVoucher(req: any) {
        return this._dataserver.post("saveExpenseVoucher", req)
    }
}