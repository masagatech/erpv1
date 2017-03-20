import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class itemGroupService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getitemdetail(req: any) {
        return this._dataserver.post("getItemsname", req);
    }

     saveitemgroup(req: any) {
        return this._dataserver.post("saveItemsGroup", req);
    }
}