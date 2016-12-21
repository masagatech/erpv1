import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for customer */
import { PDCService } from '../../../../_service/pdc/pdc-service' /* add reference for emp */
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
    templateUrl: 'addpdc.comp.html',
    providers: [CommonService, PDCService]
})

export class AddPDC implements OnInit, OnDestroy {
    title: string = "";

    pdcid: number = 0;
    acid: number = 0;
    acname: string = "";
    amount: any = "";
    bankname: string = "";
    chequeno: string = "";
    chequedate: any = "";
    pdctype: string = "";
    narration: string = "";

    pdctypedt: any = [];

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    private subscribeParameters: any;

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _commonservice: CommonService, private _pdcservice: PDCService) {
        this.getPDCType();
    }

    getButtonValue() {
        $("#divpdctype button").click(function () {
            $(this).addClass('active').siblings().removeClass('active');

            var diltertype = $(this).attr("data-state");
            alert(diltertype);
        });
    }

    getPDCType() {
        this._commonservice.getMOM({ "group": "PDC Type" }).subscribe(data => {
            this.pdctypedt = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    getCustAuto(me: any) {
        var that = this;

        that._commonservice.getAutoData({ "type": "customer", "search": that.acname }).subscribe(data => {
            $(".acname").autocomplete({
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
                    me.acid = ui.item.value;
                    me.acname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    // save pdc

    savePDCData() {
        var savepdc = {
            "pdcid": this.pdcid,
            "cmpid": "2",
            "fyid": "7",
            "acid": this.acid,
            "amount": this.amount,
            "bankname": this.bankname,
            "chequeno": this.chequeno,
            "chequedate": this.chequedate,
            "pdctype": this.pdctype,
            "narration": this.narration,
            "createdby": "1:vivek",
            "updatedby": "1:vivek"
        }

        this._pdcservice.savePDCDetails(savepdc).subscribe(data => {
            var dataResult = data.data;
            debugger;
            console.log(dataResult);

            if (dataResult[0].funsave_pdc.msgid != "-1") {
                alert(dataResult[0].funsave_pdc.msg);
                this._router.navigate(['/accounts/pdc']);
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

    getPDCById(id) {
        var that = this;

        that._pdcservice.getPDCDetails({ "flag": "id", "pdcid": id }).subscribe(data => {
            var pdcdata = data.data;

            that.pdcid = pdcdata[0].pdcid;
            that.pdctype = pdcdata[0].pdctype;
            that.acid = pdcdata[0].acid;
            that.acname = pdcdata[0].acname;
            that.chequedate = pdcdata[0].chequedate;
            that.amount = pdcdata[0].amount;
            that.bankname = pdcdata[0].bankname;
            that.chequeno = pdcdata[0].chequeno;
            that.narration = pdcdata[0].narration;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.title = "Edit Post Dated Cheque";

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.pdcid = params['id'];
                this.getPDCById(this.pdcid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.title = "Add Post Dated Cheque";

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
            this.savePDCData();
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
        this.subscribeParameters.unsubscribe();
    }
}