import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DRService } from '../../../_service/docrepo/dr-service'; /* add reference for view document repository */
import { EmpService } from '../../../_service/employee/emp-service'; /* add reference for view employee */
import { CommonService } from '../../../_service/common/common-service'; /* add reference for view document repository */
import { OrderByPipe } from '../../../_pipe/orderby.pipe';
import { Router } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'dashboard.comp.html',
    providers: [DRService, EmpService, CommonService]
})

export class DRDashboardComp implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    sort: any;

    uid: number = 0;
    ucode: string = "";
    uname: string = "";
    tag: string = "";

    IsVisibleGrid: any = true;
    IsVisibleList: any = false;

    userDT: any = [];
    drTagDT: any = [];
    drViewDT: any = [];

    selecteduid: number = 0;

    constructor(private _router: Router, private _drservice: DRService, private _commservice: CommonService, private _empservice: EmpService,
        private setActionButtons: SharedVariableService) {
        var that = this;

        that.getDRWiseUser();
        that.getUserWiseTag(0);
    }

    getDRWiseUser() {
        var that = this;

        that._drservice.getEmpDocRepo({ "flag": "drwiseuser", "search": that.uname }).subscribe(data => {
            that.userDT = data.data;
            debugger;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getUserWiseTag(puid) {
        var that = this;

        that._drservice.getEmpDocRepo({ "flag": "userwisedrtag", "uid": puid }).subscribe(data => {
            that.drViewDT = [];
            that.drTagDT = data.data;
            that.selecteduid = puid;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getTagWiseDR(puid, ptag) {
        var that = this;

        that._drservice.getEmpDocRepo({ "flag": "tagwisedr", "uid": puid, "tag": ptag }).subscribe(data => {
            that.drViewDT = data.data;
            that.tag = this.drViewDT[0].tag;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ShowHideDocs(viewtype) {
        var that = this;

        if (viewtype == "Grid") {
            that.IsVisibleGrid = true;
            that.IsVisibleList = false;
        }
        else {
            that.IsVisibleGrid = false;
            that.IsVisibleList = true;
        }
    }

    actionBarEvt(evt) {
        var that = this;

        if (evt === "add") {
            that._router.navigate(['/docrepo/add']);
        }
        if (evt === "edit") {
            if (that.selecteduid == 0) {
                alert("Please select 1 User !!!!");
            }
            else {
                that._router.navigate(['/docrepo/edit', that.selecteduid]);
            }
        }
    }

    ngOnInit() {
        var that = this;

        that.actionButton.push(new ActionBtnProp("add", "Add", "plus", true, false));
        that.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        that.setActionButtons.setActionButtons(this.actionButton);
        that.subscr_actionbarevt = that.setActionButtons.setActionButtonsEvent$.subscribe(evt => that.actionBarEvt(evt));
    }

    ngOnDestroy() {
        var that = this;

        that.subscr_actionbarevt.unsubscribe();
        console.log('ngOnDestroy');
    }
}