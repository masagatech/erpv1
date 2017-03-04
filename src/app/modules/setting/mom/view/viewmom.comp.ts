import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for MOM */
import { Router } from '@angular/router';
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

@Component({
    templateUrl: 'viewMOM.comp.html',
    providers: [CommonService]
})

export class ViewMOM implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    monGroupDT: any = [];
    momDT: any = [];
    totalRecords: number = 0;

    constructor(private _router: Router, private setActionButtons: SharedVariableService, private _commonservice: CommonService) {
        this.fillMOMGroup();
    }

    fillMOMGroup() {
        var that = this;

        that._commonservice.getMOM({ "flag": "group" }).subscribe(data => {
            that.monGroupDT = data.data;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    BindMOMGrid(row, from: number, to: number) {
        var that = this;
        that._commonservice.getMOMGrid({ "flag": "grid", "group": row.group, "from": from, "to": to }).subscribe(data => {
            that.totalRecords = data.data[1].recordstotal;
            that.momDT = data.data[0];
        });
    }

    loadMOMGrid(event: LazyLoadEvent) {
        this.BindMOMGrid(event, event.first, (event.first + event.rows));
    }

    openMOMDetails(row) {
        this._router.navigate(["/setting/masterofmaster/edit", row.id]);
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        this.setActionButtons.setTitle("Master of Master");
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
    }

    actionBarEvt(evt) {
        if (evt === "add") {
            this._router.navigate(['/setting/masterofmaster/add']);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.subscr_actionbarevt.unsubscribe();
    }
}