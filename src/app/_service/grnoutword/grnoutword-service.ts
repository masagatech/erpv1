import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class grnOutwordService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getgrndetal(req: any) {
        return this._dataserver.post("getgrndetails", req);
    }

    savegrnoutword(req: any) {
        return this._dataserver.post("savegrnoutword", req);
    }

    getoutwordgriddetail(req: any) {
        return this._dataserver.post("getviewdetails", req);
    }

}