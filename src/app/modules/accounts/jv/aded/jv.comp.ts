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

    jvmid: any;
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

    // add jv details

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

    // account details

    getAutoComplete(me: any, arg: number) {
        this._commonservice.getAutoData({ "Type": "CustName", "Key": arg == 0 ? me.newAccName : me.AccName }).subscribe(data => {
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

    // set total debit amount

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

    // set total credit amount

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

    // get jv master by id

    getJVDataById(pjvmid: number) {
        this._jvservice.viewJVDetails({ "flag": "edit", "jvmid": pjvmid }).subscribe(data => {
            this.viewJVData = data.data;

            this.jvmid = this.viewJVData[0].JVMasterAutoID;
            this.jvDate = this.viewJVData[0].DocDate;
            this.jvNarration = this.viewJVData[0].Narration;

            this.getJVDetailsByJVID(pjvmid);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // get jv details by id

    getJVDetailsByJVID(pjvmid: number) {
        this._jvservice.viewJVDetails({ "flag": "details", "jvmid": pjvmid }).subscribe(data => {
            this.jvRowData = data.data;
            console.log(this.jvRowData);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // save jv

    saveJVData() {
        var saveJV = {
            "jvmid": this.jvmid,
            "fyid": "5",
            "docdate": this.jvDate,
            "narration": this.jvNarration,
            "createdby": "vivek",
            "updatedby": "vivek",
            "JVDetails": this.jvRowData
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

                this.jvmid = params['ID'];
                this.getJVDataById(this.jvmid);

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