import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { ContrService } from "../../../../_service/contrcenter/contr-service";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [ContrService, CommonService]

}) export class contradd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    autoid: any = 0;
    centername: any = "";
    profit: any = "";
    cost: any = "";
    empid: any = 0;
    empname: any = "";
    remark: any = "";
    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private ctrlServies: ContrService, private _autoservice: CommonService, private _routeParams: ActivatedRoute) {

    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".centername").focus();

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.autoid = params['id'];
                this.EditCtrl(this.autoid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');

            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
    }

    EditCtrl(autoid) {
        this.ctrlServies.getCtrlcenter({
            "cmpid": 1,
            "ctrlid": autoid
        }).subscribe(result => {
            var dataset = result.data;
            console.log(dataset);
            this.centername = dataset[0].ctrlname;
            this.profit = dataset[0].profitctr;
            this.cost = dataset[0].costctr;
            this.empid = dataset[0].empid;
            this.empname = dataset[0].person;
            this.remark = dataset[0].remark;
            $(".centername").focus();
        }, err => {
            console.log("Error");
        }, () => {
            'Final'
        });
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

    ClearControll() {
        this.centername = "";
        this.profit = "";
        this.cost = "";
        $("empname").val("");
        this.remark = "";
    }

    paramjson() {
        var param = {
            "centername": this.centername,
            "profitcode": this.profit,
            "ctrlid": this.autoid,
            "costcode": this.cost,
            "empid": this.empid,
            "cmpid": 1,
            "createdby": "admin",
            "remark": this.remark
        }
        console.log(param);
        return param;
    }


    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "save") {

            if (this.centername == "" || this.centername == undefined) {
                alert("Please enter center name");
               $(".centername").focus();
                return;
            }
            if (this.cost == "" && this.profit == "") {
                alert("Please enter profit and cost");
                $(".profitcost").focus();
                return;
            }

            this.ctrlServies.saveCtrlcenter(
                this.paramjson()
            ).subscribe(result => {
                var dataset = result.data;
                console.log(dataset);
                if (dataset[0].funsave_ctrlcenter.maxid == -1) {
                    alert("Center Name already exists");
                    $(".centername").focus();
                    return;
                }
                if (dataset[0].funsave_ctrlcenter.maxid > 0) {
                    alert("Data Save Successfully");
                    this.ClearControll();
                    $(".centername").focus();
                    return;
                }
                else {
                    console.log(dataset);
                }
            }, err => {
                console.log("Error");
            }, () => {
                'Final'
            });
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".centername").focus();
            this.actionButton.find(a => a.id === "save").hide = false;
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