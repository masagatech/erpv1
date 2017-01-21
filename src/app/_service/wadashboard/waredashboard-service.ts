import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class dashboardService  {
    constructor(private _dataserver:DataService,private _router:Router) { }

    getdashboard(req:any)
    {
       return this._dataserver.post("DashBoard",req);
    }
}