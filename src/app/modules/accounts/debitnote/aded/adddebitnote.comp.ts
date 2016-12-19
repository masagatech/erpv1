import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { DNService } from '../../../../_service/debitnote/dn-service' /* add reference for view employee */
import { CommonService } from '../../../../_service/common/common-service' /* add reference for view employee */
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'adddebitnote.comp.html',
    providers: [DNService, CommonService]
})

export class AddDebitNote implements OnInit, OnDestroy {
    viewCustomerDT: any[] = [];
    duplicateacid: Boolean = true;

    dnid: number = 0;
    dnacid: number = 0;
    dnacname: string = "";
    dndate: any = "";
    dramt: any = "";
    narration: string = "";

    dnRowData: any = [];
    viewDNData: any = [];

    newdnid: any = 0;
    newacid: any = 0;
    newacname: string = "";
    newdramt: any = "";
    newcramt: any = "";

    counter: any;
    title: any;

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router, private _dnservice: DNService, private _commonservice: CommonService) {

    }

    isDuplicateacid() {
        for (var i = 0; i < this.dnRowData.length; i++) {
            var field = this.dnRowData[i];

            if (field.acid == this.newacid) {
                alert("Duplicate Account not Allowed");
                this.newacid = "";
                this.newacname = "";
                return true;
            }
        }

        return false;
    }

    private NewRowAdd() {
        if (this.newacname == "" || this.newacname == null) {
            alert("Please Enter Account NAme");
            return;
        }

        if (this.newcramt == "" || this.newcramt == null) {
            alert("Please Enter Credit");
            return;
        }

        //Duplicate items Check
        this.duplicateacid = this.isDuplicateacid();

        //Add New Row
        if (this.duplicateacid == false) {
            this.dnRowData.push({
                'counter': this.counter,
                'acid': this.newacid,
                'acname': this.newacname,
                'cramt': this.newcramt
            });

            this.counter++;
            this.newacid = "";
            this.newacname = "";
            this.newcramt = "";
        }
    }

    getAutoComplete(me: any, arg: number) {
        var that = this;

        this._commonservice.getAutoData({ "type": "customer", "search": arg == 1 ? me.acname : arg == 2 ? me.dnacname : me.newacname }).subscribe(data => {
            $(arg == 1 ? ".accname" : arg == 2 ? ".dnaccname" : ".accname").autocomplete({
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
                    if (arg === 1) {
                        me.acname = ui.item.label;
                        me.acid = ui.item.value;
                    } else if (arg === 2) {
                        me.dnacname = ui.item.label;
                        me.dnacid = ui.item.value;
                    } else {
                        me.newacname = ui.item.label;
                        me.newacid = ui.item.value;
                    }
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getDNDataByID(pdnid: number) {
        this._dnservice.getDebitNote({ "flag": "edit", "dnid": pdnid }).subscribe(data => {
            this.viewDNData = JSON.parse(data.data);

            this.dnid = this.viewDNData[0].DNAutoID;
            this.dnacid = this.viewDNData[0].acid;
            this.dnacname = this.viewDNData[0].acname;
            this.dndate = this.viewDNData[0].DocDate;
            this.narration = this.viewDNData[0].Narration;

            this.getDNDetailsByID(pdnid);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getDNDetailsByID(pdnid: number) {
        this._dnservice.getDebitNote({ "flag": "details", "dnid": pdnid }).subscribe(data => {
            this.dnRowData = data.data;
            console.log(this.dnRowData);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    saveDNData() {
        var jsondt = [];
        var dnid = 0;

        debugger;

        for (var i = 0; i < this.dnRowData.length; i++) {
            var field = this.dnRowData[i];

            jsondt = [{
                "dnid": field.dnid == undefined ? 0 : field.dnid,
                "fyid": "7",
                "cmpid": "2",
                "docdate": "" + this.dndate + "",
                "acid": + field.acid,
                "dramt": "0",
                "cramt": field.cramt
            }];
        }

        console.log(jsondt);

        var saveDN = {
            "dnid": this.dnid,
            "fyid": "7",
            "cmpid": "2",
            "docdate": this.dndate,
            "acid": this.dnacid,
            "dramt": this.dramt,
            "narration": this.narration,
            "createdby": "1:vivek",
            "updatedby": "1:vivek",
            "dndetails": jsondt
        }

        this.duplicateacid = this.isDuplicateacid();
        console.log(this.duplicateacid);

        if (this.duplicateacid == false) {
            this._dnservice.saveDebitNote(saveDN).subscribe(data => {
                var dataResult = data.data;
                debugger;
                console.log(dataResult);

                if (dataResult[0].funsave_debitnote.msgid != "-1") {
                    alert(dataResult[0].msg);
                    this._router.navigate(['/accounts/debitnote']);
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
    }

    ngOnInit() {
        console.log('ngOnInit');

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['ID'] !== undefined) {
                this.title = "Add Debit Note";
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.dnid = params['ID'];
                this.getDNDataByID(this.dnid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.title = "Edit Debit Note";
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
            this.saveDNData();
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