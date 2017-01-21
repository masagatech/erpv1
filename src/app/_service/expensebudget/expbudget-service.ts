import { Injectable } from '@angular/core';
import { DataService } from '../../_service/dataconnect';
import { Router } from '@angular/router';

@Injectable()
export class ExpBudgetService {
    constructor(private _dataserver: DataService, private _router: Router) { }

    // Receipt Book

    getAllExpenseBudget(req: any) {
        return this._dataserver.post("getAllExpenseBudget", req)
    }

    getExpenseBudgetDetails(req: any) {
        return this._dataserver.post("getExpenseBudgetDetails", req)
    }

    saveExpenseBudget(req: any) {
        return this._dataserver.post("saveExpenseBudget", req)
    }
}