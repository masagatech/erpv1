import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class ItemAddService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    itemsMasterSave(req:any)
    {
        return this._dataserver.post("saveItemsMaster",req);
    }

    EditItem(req:any)
    {
        return this._dataserver.post("ItemMasterGet",req);
    }
    
}