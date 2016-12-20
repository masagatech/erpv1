import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class ItemViewService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getItemsMaster(req:any)
    {
        return this._dataserver.post("ItemMasterGet",req);
    }
}