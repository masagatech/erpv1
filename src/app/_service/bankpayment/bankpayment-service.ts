import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class BankPaymentService {
    constructor(private _dataserver: DataService, private _router: Router) {

    }

    getBankMaster(req: any) {
        return this._dataserver.post("getBankMaster", req);
    }

    saveBankPayment(req: any) {
        return this._dataserver.post("saveBankPayment", req);
    }

    getBankPayment(req: any) {
        return this._dataserver.post("getBankPayment", req);
    }
}