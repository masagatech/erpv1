import { Injectable } from '@angular/core';
import { DataService } from '../../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class CustomerViewService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getcustomer(req:any)
    {
        return this._dataserver.post("getcustomer",req);
    }
}