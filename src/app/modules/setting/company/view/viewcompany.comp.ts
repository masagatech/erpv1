import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../../_service/user/user-service';
import { CompService } from '../../../../_service/company/comp-service' /* add reference for view employee */
import { LoginUserModel } from '../../../../_model/user_model';

import { Router } from '@angular/router';

@Component({
    templateUrl: 'viewcompany.comp.html',
    providers: [CompService]
    //styles : [".div-panel{}"]
})

export class ViewCompany implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    loginUser: LoginUserModel;

    isShowGrid: any = true;
    isShowList: any = false;

    company: any[];

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _userservice: UserService,
        private _compservice: CompService) {
        this.loginUser = this._userservice.getUser();
        this.getCompany();
    }

    getCompany() {
        this._compservice.getCompany({ "flag": "all", "fy": this.loginUser.fy }).subscribe(data => {
            this.company = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    viewFullDesc(row) {
        if (row.isshdesc == 0) {
            row.isshdesc = 1;
        } else {
            row.isshdesc = 0;
        }
    }

    viewFullAddress(row) {
        if (row.isshaddr == 0) {
            row.isshaddr = 1;
        } else {
            row.isshaddr = 0;
        }
    }

    isshcompany(viewtype) {
        if (viewtype == "Grid") {
            this.isShowGrid = true;
            this.isShowList = false;
        }
        else {
            this.isShowGrid = false;
            this.isShowList = true;
        }
    }

    openCompanyDetails(row) {
        if (!row.IsLocked) {
            this._router.navigate(['/setting/company/edit', row.cmpid]);
        }
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Company");
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/setting/company/add']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}