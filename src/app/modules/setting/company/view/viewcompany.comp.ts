import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CompService } from '../../../../_service/company/comp-service' /* add reference for view employee */

import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewcompany.comp.html',
    providers: [CompService]
})

export class ViewCompany implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    IsVisibleGrid: any = true;
    IsVisibleList: any = false;

    CompanyDetails: any[];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _compservice: CompService) {
        this.getCompanyDetails();
    }

    getCompanyDetails() {
        this._compservice.viewCompanyDetails({ "CompanyID": "0", "SearchTxt": "" }).subscribe(data => {
            this.CompanyDetails = JSON.parse(data.data);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    viewFullDesc(row) {
        if (row.IsCollapseDesc == 0) {
            row.IsCollapseDesc = 1;
        } else {
            row.IsCollapseDesc = 0;
        }
    }

    viewFullAddress(row) {
        if (row.IsCollapseAddress == 0) {
            row.IsCollapseAddress = 1;
        } else {
            row.IsCollapseAddress = 0;
        }
    }

    ShowHideCompany(viewtype) {
        if (viewtype == "Grid") {
            this.IsVisibleGrid = true;
            this.IsVisibleList = false;
        }
        else {
            this.IsVisibleGrid = false;
            this.IsVisibleList = true;
        }
    }

    openCompanyDetails(row) {
        if (!row.IsLocked) {
            this._router.navigate(['/setting/editcompany', row.CompanyID]);
        }
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/setting/addcompany']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}