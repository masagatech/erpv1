import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class BankBookService {
    constructor(private _dataserver: DataService, private _router: Router) {

    }

    getBankBook(req: any) {
        return this._dataserver.post("getBankBook", req);
    }
}