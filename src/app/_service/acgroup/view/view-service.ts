import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class acgroupview {
    constructor(private _dataserver: DataService, private _router: Router) { }
    acGroupView(req:any)
    {
        return this._dataserver.post("getAcgroup",req);
    }
}