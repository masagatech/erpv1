import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { JVService } from '../../../../_service/jv/jv-service'; /* add reference for view employee */
import { CommonService } from '../../../../_service/common/common-service'; /* add reference for customer */
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'jv.comp.html',
    providers: [JVService, CommonService]
})

export class JVAddEdit implements OnInit, OnDestroy {
    viewCustomerDT: any[];

    jvMasterAutoID: any;
    jvDate: any;
    jvNarration: any;

    jvRowData: any[] = [];
    viewJVData: any[];

    newJVDAutoID: any;
    newAccCode: any;
    newAccName: any;
    newDrAmt: any;
    newCrAmt: any;
    newNarration: any;

    counter: any;
    title: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router, private _jvservice: JVService, private _commonservice: CommonService) {
        this.jvDate = Date.now();
    }

    private NewRowAdd() {
        this.jvRowData.push({
            'counter': this.counter,
            'AccCode': this.newAccCode,
            'AccName': this.newAccName,
            'DebitAmount': this.newDrAmt,
            'CreditAmount': this.newCrAmt,
            'Details_Narration': this.newNarration
        });

        this.counter++;
        this.newAccCode = "";
        this.newAccName = "";
        this.newDrAmt = "";
        this.newCrAmt = "";
        this.newNarration = "";
    }

    getAutoComplete(me: any, arg: number) {
        this._commonservice.getAutoCompleteData({ "Type": "CustName", "Key": arg == 0 ? me.newAccName : me.AccName }).subscribe(data => {
            $(".accname").autocomplete({
                source: JSON.parse(data.data),
                width: 300,
                max: 20,
                delay: 100,
                minLength: 0,
                autoFocus: true,
                cacheLength: 1,
                scroll: true,
                highlight: false,
                select: function (event, ui) {
                    this.AccCode = ui.item.value;

                    if (arg === 1) {
                        me.AccName = ui.item.label;
                        me.AccCode = ui.item.value;
                    } else {
                        me.newAccName = ui.item.label;
                        me.newAccCode = ui.item.value;
                    }
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    setDrAmt(me: any, arg: number) {
        if (arg === 1) {
            if (me.CreditAmount > 0) {
                me.DebitAmount = 0;
            }
        }
        else {
            if (me.newCrAmt > 0) {
                me.newDrAmt = 0;
            }
        }
    }

    setCrAmt(me: any, arg: number) {
        if (arg === 1) {
            if (me.DebitAmount > 0) {
                me.CreditAmount = 0;
            }
        }
        else {
            if (me.newDrAmt > 0) {
                me.newCrAmt = 0;
            }
        }
    }

    getJVDataById(JVMAutoID: number) {
        this._jvservice.viewJVDetails({ "FilterType": "Edit", "JVMasterAutoID": JVMAutoID }).subscribe(data => {
            this.viewJVData = JSON.parse(data.data);

            this.jvMasterAutoID = this.viewJVData[0].JVMasterAutoID;
            this.jvDate = this.viewJVData[0].DocDate;
            this.jvNarration = this.viewJVData[0].Narration;

            this.getJVDetailsByJVID(JVMAutoID);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getJVDetailsByJVID(JVMAutoID: number) {
        this._jvservice.viewJVDetails({ "FilterType": "Details", "JVMasterAutoID": JVMAutoID }).subscribe(data => {
            this.jvRowData = JSON.parse(data.data);
            console.log(this.jvRowData);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    saveJVData() {
        var xmldt = "<r>";

        for (var i = 0; i < this.jvRowData.length; i++) {
            var field = this.jvRowData[i];
            xmldt += "<i>";

            if (field.JVDetailsAutoID == undefined) {
                xmldt += "<JVDAutoID>0</JVDAutoID>";
            }
            else {
                xmldt += "<JVDAutoID>" + field.JVDetailsAutoID + "</JVDAutoID>";
            }

            xmldt += "<ACC>" + field.AccCode + "</ACC>";
            xmldt += "<ACN>" + field.AccName + "</ACN>";
            xmldt += "<D>" + field.DebitAmount + "</D>";
            xmldt += "<C>" + field.CreditAmount + "</C>";
            xmldt += "<N>" + field.Details_Narration + "</N>";
            xmldt += "<R1></R1>";
            xmldt += "<R2></R2>";
            xmldt += "<R3></R3>";
            xmldt += "</i>";
        }

        xmldt += "</r>";
        console.log(xmldt);

        var saveJV = {
            "JVMasterAutoID": this.jvMasterAutoID,
            "FY": "5",
            "DocDate": this.jvDate,
            "Narration": this.jvNarration,
            "CompCode": "MSG",
            "CreatedBy": "vivek",
            "UpdatedBy": "vivek",
            "Remark1": "",
            "Remark2": "",
            "Remark3": "",
            "JVDetails": xmldt
        }

        this._jvservice.saveJVDetails(saveJV).subscribe(data => {
            var dataResult = JSON.parse(data.data);
            debugger;
            console.log(dataResult);

            if (dataResult[0].Doc != "-1") {
                alert(dataResult[0].Status + ', Doc : ' + dataResult[0].Doc);
                this._router.navigate(['/accounts/viewjv']);
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
        this.title = "Add JV";
        console.log('ngOnInit');

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['ID'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.jvMasterAutoID = params['ID'];
                this.getJVDataById(this.jvMasterAutoID);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveJVData();
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');

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