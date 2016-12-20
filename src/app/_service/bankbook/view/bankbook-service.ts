import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class bankBookService {
    constructor(private _dataserver: DataService, private _router: Router) {

    }
    getBankMaster(req: any) {
        return this._dataserver.post("BankNameGet", req);
    }

    getBankBookList(req:any)
    {
         return this._dataserver.post("Get_BankBookReport", req);
    }
}