import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { ContrService } from "../../../../_service/contrcenter/contr-service";

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [ContrService, CommonService]

}) export class contradd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    centername: any = "";
    profit: any = "";
    cost: any = "";
    empid: any = 0;
    empname: any = "";
    remark: any = "";

    constructor(private setActionButtons: SharedVariableService, private ctrlServies: ContrService, private _autoservice: CommonService) {

    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".centername").focus();
    }

    getAutoCompleteEmp(me: any) {
        var that = this;
        this._autoservice.getAutoData({ "type": "userwithcode", "search": that.empname, "cmpid": 1 }).subscribe(data => {
            $(".empname").autocomplete({
                source: data.data,
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    me.empid = ui.item.value;
                    me.empname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    paramjson() {
        var param = {
            "centername": this.centername,
            "profitcode": this.profit,
            "costcode": this.cost,
            "empid": this.empid,
            "cmpid":1,
            "createdby":"admin",
            "remark": this.remark
        }
        return param;
    }


    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "save") {
            this.ctrlServies.saveCtrlcenter(
                this.paramjson()
            ).subscribe(
                
            )
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            // alert("edit called");
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
    }
}