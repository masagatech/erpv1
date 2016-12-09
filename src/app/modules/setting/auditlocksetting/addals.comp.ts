import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { ALSService } from '../../../_service/auditlocksetting/als-service'; /* add reference for audit lock setting */
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'addals.comp.html',
    providers: [ALSService]
})

export class ALSAddEdit implements OnInit, OnDestroy {
    title: any;
    Remark: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    alsRowData: any[] = [];

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router, private _alsservice: ALSService) {
        this.getAuditLockSetting();
    }

    getAuditLockSetting() {
        this._alsservice.getAuditLockSetting({ "FilterType": "", "ALSAutoID": "0" }).subscribe(data => {
            this.alsRowData = JSON.parse(data.data);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    expandDetails(row) {
        if (row.IsCollapse == 0) {
            row.IsCollapse = 1;
            if (row.Details.length === 0) {
                this._alsservice.getAuditLockSetting({ "FilterType": "Details", "ALSAutoID": row.ALSAutoID }).subscribe(data => {
                    row.Details = JSON.parse(data.data);
                    debugger;
                    console.log(row.ALSAutoID);
                    console.log(row.Details);
                }, err => {
                    console.log("Error");
                }, () => {
                    // console.log("Complete");
                })
            }
        } else {
            row.IsCollapse = 0;
        }
    }

    saveALSData() {
        var xmldt = "<r>";
        var lockDate: any;

        for (var i = 0; i < this.alsRowData.length; i++) {
            var field = this.alsRowData[i];
            lockDate = field.LockDate;

            if (lockDate != "") {
                xmldt += "<i>";

                xmldt += "<ALAAutoID>0</ALAAutoID>";
                xmldt += "<MN>" + field.ModuleName + "</MN>";
                xmldt += "<AD>" + field.LockDate + "</AD>";
                xmldt += field.CurrentLockDate == null ? "<PAD></PAD>" : "<PAD>" + field.CurrentLockDate + "</PAD>";
                xmldt += "<FY>5</FY>";
                xmldt += "<CB>vivek</CB>";
                xmldt += "<RM>" + this.Remark + "</RM>";

                xmldt += "</i>";
            }
        }

        xmldt += "</r>";
        console.log(xmldt);

        var saveDR = {
            "AuditLockAction": xmldt
        }

        this._alsservice.saveAuditLockAction(saveDR).subscribe(data => {
            var dataResult = JSON.parse(data.data);
            debugger;
            console.log(dataResult);

            if (dataResult[0].Doc != "-1") {
                alert(dataResult[0].Status + ', Doc : ' + dataResult[0].Doc);
                this._router.navigate(['/setting']);
            }
            else {
                alert("Error");
            }
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    ngOnInit() {
        this.title = "Add dn";
        console.log('ngOnInit');

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            this.actionButton.find(a => a.id === "edit").hide = true;
            this.actionButton.find(a => a.id === "delete").hide = true;
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveALSData();
        } else if (evt === "edit") {
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}