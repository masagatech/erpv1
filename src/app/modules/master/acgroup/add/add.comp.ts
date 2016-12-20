import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { acgroupadd } from "../../../../_service/acgroup/add/add-service";

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [acgroupadd, CommonService]                         //Provides Add Service
    //,AutoService
}) export class acadd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    groupid: any = 0;
    groupcode: any = "";
    groupName: any = "";
    parentgr: any = 0;
    neturname: any = "";
    neturid: any = 0;
    category: any = "";
    remark: any = "";
    appfrom: any = 0;
    chkall:boolean;
    financiallist: any = [];
    private subscribeParameters: any;

    //, private _autoservice:AutoService
    constructor(private setActionButtons: SharedVariableService, private acgroupServies: acgroupadd, private _autoservice: CommonService, private _routeParams: ActivatedRoute) { //Inherit Service
        //applicable From
        this.getApplicableFrom();
    }
    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        $(".groupcode").focus();
        $(".groupcode").removeAttr('disabled', 'disabled');
        setTimeout(function () {
            var date = new Date();
            var CurrentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            //From Date 
            $("#docdate").datepicker({
                dateFormat: "dd/mm/yy",
                //startDate: new Date(),        //Disable Past Date
                autoclose: true,
                setDate: new Date()
            });
            $("#docdate").datepicker('setDate', CurrentDate);
        }, 0);

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.groupid = params['id'];
                this.Editgroup(this.groupid);

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

    //Applicable From Bind 
    getApplicableFrom() {
        this.acgroupServies.acApplicableFrom({
            "flag": ""
        }).subscribe(data => {
            this.financiallist = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Done");
        })
    }

    //Auto Completed Nature
    getAutoCompleteNature(me: any) {
        var that = this;
        this._autoservice.getAutoData({ "type": "nature", "search": that.neturname, "CmpCode": "Mtech", "FY": 5 }).subscribe(data => {
            $(".neturofgr").autocomplete({
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
                    me.neturid = ui.item.value;
                    me.neturname = ui.item.label;
                    me.category = ui.item.category;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    Editgroup(groupid) {
        this.acgroupServies.acGroupView({
            "flag": "",
            "groupid": groupid,
            "neturid": 0,
            "cmpid": 1,
            "fy": 5
        }).subscribe(data => {
            var dataset = data.data;
            this.groupcode = dataset[0].groupcode;
            this.groupName = dataset[0].groupname;
            this.neturname = dataset[0].val;
            this.neturid = dataset[0].natureofg;
            this.appfrom=dataset[0].appfromedit;
            if(this.appfrom==0)
            {
                this.chkall=true;
            }
            this.remark = dataset[0].remark;
            //$(".groupcode").focus();
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ClearControll() {
        this.groupcode = "";
        this.groupName = "";
        this.neturname = "";
        this.neturid = 0;
        this.remark = "";
        this.appfrom="";
        this.chkall=false;
        $(".groupcode").removeAttr('disabled', 'disabled');
        $(".groupcode").focus();
    }

    checkall()
    {
        if(this.chkall==undefined)
        {
           this.chkall=true; 
        }

        if(this.chkall==true)
        {
            this.appfrom="";
        }
    }

    //Return Json Param
    JsonParam() {
        if(this.chkall==true)
        {
            this.appfrom=0;
        }
        var Param = {
            "groupid": this.groupid,
            "groupcode": this.groupcode,
            "groupname": this.groupName,
            "parentgr": this.parentgr == "" ? 0 : this.parentgr,
            "cmpid": 1,
            "fy": 5,
            "applyfrom": this.appfrom,
            "useridcode": "admin",
            "neturid": this.neturid,
            "remark": this.remark,
            "remark1": "remark1",
            "remark2": "remark2",
            "remark3": "remark3"
        }
        return Param;

    }


    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "save") {
            if (this.groupcode == "") {
                alert("Please enter group code");
                $(".groupcode").focus();
                return;

            }
            else if (this.groupcode == "") {
                alert("Please enter group name");
                $(".groupName").focus();
                return;
            }
            else if (this.neturid == 0) {
                alert("Please select nature of group");
                $(".neturofgr").focus();
                return;
            }
            this.acgroupServies.acGroupSave(
                this.JsonParam()
            ).subscribe(result => {
                var dataset = result.data;
                if (dataset[0].funsave_acgroup.maxid === "exists") {
                    alert(dataset[0].funsave_acgroup.msg);
                    this.ClearControll();
                    return;
                }
                if (dataset[0].funsave_acgroup.maxid > 0) {
                    alert(dataset[0].funsave_acgroup.msg);
                    this.ClearControll();
                    return;
                }
                else {
                    alert('Save Error');
                    return;
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
            $(".groupcode").attr('disabled', 'disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".groupName").focus();
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