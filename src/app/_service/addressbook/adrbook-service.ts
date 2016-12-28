import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class AdrBookService {
    constructor(private _dataserver: DataService, private _router: Router) { }
    saveAdrBook(req: any) {
        return this._dataserver.post("saveAddress", req);
    }
    
     getAdrBook(req: any) {
        return this._dataserver.post("getAddress", req);
    }
}