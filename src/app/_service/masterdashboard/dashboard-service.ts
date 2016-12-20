import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class MasterdashboardService  {
    constructor(private _dataserver:DataService,private _router:Router) { }

}