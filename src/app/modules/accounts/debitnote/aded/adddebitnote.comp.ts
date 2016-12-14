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

export class DebitNoteAddEdit implements OnInit, OnDestroy {
    viewCustomerDT: any[] = [];
    duplicateAccCode: Boolean = true;

    DNAutoID: any;
    dnAccCode: any;
    dnAccName: any;
    dnDate: any;
    dnNarration: any;
    DebitAmount: any;

    dnRowData: any[] = [];
    viewDNData: any[] = [];

    newDNDAutoID: any;
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

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router, private _dnservice: DNService, private _commonservice: CommonService) {

    }

    isDuplicateAccCode() {
        for (var i = 0; i < this.dnRowData.length; i++) {
            var field = this.dnRowData[i];

            if (field.AccCode == this.newAccCode) {
                alert("Duplicate Account not Allowed");
                this.newAccCode = "";
                this.newAccName = "";
                return true;
            }
        }

        return false;
    }

    private NewRowAdd() {
        if (this.newAccName == "" || this.newAccName == null) {
            alert("Please Enter Account NAme");
            return;
        }

        if (this.newCrAmt == "" || this.newCrAmt == null) {
            alert("Please Enter Credit");
            return;
        }

        //Duplicate items Check
        this.duplicateAccCode = this.isDuplicateAccCode();

        //Add New Row
        if (this.duplicateAccCode == false) {
            this.dnRowData.push({
                'counter': this.counter,
                'AccCode': this.newAccCode,
                'AccName': this.newAccName,
                'CreditAmount': this.newCrAmt
            });

            this.counter++;
            this.newAccCode = "";
            this.newAccName = "";
            this.newCrAmt = "";
        }
    }

    getAutoComplete(me: any, arg: number) {
        this._commonservice.getAutoData({ "Type": "CustName", "Key": arg == 1 ? me.AccName : arg == 2 ? me.dnAccName : me.newAccName }).subscribe(data => {
            $(function () {
                this.viewCustomerDT = JSON.parse(data.data);

                var finalData = $.map(this.viewCustomerDT, function (item) {
                    return {
                        label: item.Name,
                        value: item.ID
                    }
                });

                $(arg == 1 ? ".accname" : arg == 2 ? ".dnaccname" : ".accname").autocomplete({
                    source: finalData,
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
                        } else if (arg === 2) {
                            me.dnAccName = ui.item.label;
                            me.dnAccCode = ui.item.value;
                        } else {
                            me.newAccName = ui.item.label;
                            me.newAccCode = ui.item.value;
                        }
                    }
                });
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getDNDataByID(DNAutoID: number) {
        this._dnservice.viewDebitNote({ "FilterType": "Edit", "DNAutoID": DNAutoID }).subscribe(data => {
            this.viewDNData = JSON.parse(data.data);

            this.DNAutoID = this.viewDNData[0].DNAutoID;
            this.dnAccCode = this.viewDNData[0].AccCode;
            this.dnAccName = this.viewDNData[0].AccName;
            this.dnDate = this.viewDNData[0].DocDate;
            this.dnNarration = this.viewDNData[0].Narration;

            this.getDNDetailsByID(DNAutoID);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    getDNDetailsByID(DNAutoID: number) {
        this._dnservice.viewDebitNote({ "FilterType": "Details", "DNAutoID": DNAutoID }).subscribe(data => {
            this.dnRowData = JSON.parse(data.data);
            console.log(this.dnRowData);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    saveDNData() {
        var xmldt = "<r>";

        for (var i = 0; i < this.dnRowData.length; i++) {
            var field = this.dnRowData[i];
            xmldt += "<i>";

            if (field.DNAutoID == undefined) {
                xmldt += "<DNAutoID>0</DNAutoID>";
            }
            else {
                xmldt += "<DNAutoID>" + field.DNAutoID + "</DNAutoID>";
            }

            xmldt += "<FY>5</FY>";
            xmldt += "<DD>" + this.dnDate + "</DD>";
            xmldt += "<AC>" + field.CustomerCode + "</AC>";
            xmldt += "<CA>" + field.CreditAmount + "</CA>";
            xmldt += "<R1></R1>";
            xmldt += "<R2></R2>";
            xmldt += "<R3></R3>";
            xmldt += "</i>";
        }

        xmldt += "</r>";
        console.log(xmldt);

        var saveDN = {
            "DNAutoID": this.DNAutoID,
            "FY": "5",
            "DocDate": this.dnDate,
            "AccountCode": this.dnAccCode,
            "DebitAmount": this.DebitAmount,
            "Narration": this.dnNarration,
            "CreatedBy": "vivek",
            "UpdatedBy": "vivek",
            "Remark1": "",
            "Remark2": "",
            "Remark3": "",
            "DebitNoteDetails": xmldt
        }

        this.duplicateAccCode = this.isDuplicateAccCode();
        console.log(this.duplicateAccCode);

        if (this.duplicateAccCode == false) {
            this._dnservice.saveDebitNote(saveDN).subscribe(data => {
                var dataResult = JSON.parse(data.data);
                debugger;
                console.log(dataResult);

                if (dataResult[0].Doc != "-1") {
                    alert(dataResult[0].Status + ', Doc : ' + dataResult[0].Doc);
                    this._router.navigate(['/accounts/viewdebitnote']);
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
        this.title = "Add dn";
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

                this.DNAutoID = params['ID'];
                this.getDNDataByID(this.DNAutoID);

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