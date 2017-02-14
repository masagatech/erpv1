import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class BudgetService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    getBudget(req: any) {
        return this._dataserver.post("getBudget", req)
    }

    saveBudget(req: any) {
        return this._dataserver.post("saveBudget", req)
    }
}