import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class BankRecoService {
    constructor(private _dataserver: DataService, private _router: Router) {

    }

    getBankReco(req: any) {
        return this._dataserver.post("getBankReco", req);
    }
    
    saveBankReco(req: any) {
        return this._dataserver.post("saveBankReco", req);
    }
}