import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class ValidationService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    checkDateValid(req: any) {
        return this._dataserver.post("checkDateValid", req)
    }
}