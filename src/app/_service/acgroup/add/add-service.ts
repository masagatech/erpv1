import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class acgroupadd {
    constructor(private _dataserver: DataService, private _router: Router) { }

    acGroupSave(req:any)
    {
        return this._dataserver.post("saveAcgroup",req);
    }
    acGroupView(req:any)
    {
        return this._dataserver.post("getAcgroup",req);
    }

    acApplicableFrom(req:any)
    {
        return this._dataserver.post("getApplicableFrom",req);
    }

}