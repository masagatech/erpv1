import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { CompService } from '../../../../_service/company/comp-service'; /* add reference for cmp view */
import { CommonService } from '../../../../_service/common/common-service' /* add reference for master of master */
import { DynamicFieldsService } from '../../../../_service/dynamicfields/dynfields-service' /* add reference for dynamic fields */
import { Router, ActivatedRoute } from '@angular/router';
import { FileUpload, Growl, Message } from 'primeng/primeng';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { AddrbookComp } from "../../../usercontrol/addressbook/adrbook.comp";
import { DynamicTabModule } from "../../../usercontrol/dynamictab";
import { AddDynamicTabComp } from "../../../usercontrol/adddynamictab";
import { AttributeComp } from "../../../usercontrol/attribute/attr.comp";

declare var $: any;
declare var commonfun: any;

@Component({
    templateUrl: 'addCompany.comp.html',
    providers: [CompService, CommonService, DynamicFieldsService]
})

export class AddCompany implements OnInit, OnDestroy {
    title: any = "";
    module: string = "";

    accode: string = "";
    cmpid: number = 0;
    cmpcode: string = "";
    cmpname: string = "";
    cmpdesc: string = "";
    cmplogo: string = "";
    cmptype: string = "";
    industries: string = "";
    remarks: string = "";

    contactperson: string = "";
    desigid: number = 0;
    @ViewChild('addrbook')
    addressBook: AddrbookComp;
    adrbookid: any = [];
    adrid: number = 0;
    adrcsvid: any = "";
    isactive: boolean = false;

    dateformat: string = "";
    currency: string = "";
    currsym: string = "";
    currsymplace: string = "";
    decimals: string = "";
    decsep: string = "";
    thsep: string = "";
    global: any = [];

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;
    loginUser: LoginUserModel;

    private subscribeParameters: any;

    industriesDT: any = [];
    desigDT: any = [];
    cmptypeDT: any = [];
    countryDT: any = [];
    dateformatDT: any = [];
    currencyDT: any = [];
    currsymDT: any = [];
    currsymplaceDT: any = [];
    decsepDT: any = [];
    decimalsDT: any = [];
    thsepDT: any = [];

    @ViewChild('attribute')
    attribute: AttributeComp;

    // tab panel
    @ViewChild('tabpanel')
    tabpanel: AddDynamicTabComp;
    tabListDT: any = [];
    selectedtab: any = [];
    isedittab: boolean = false;
    atttype: string = "";

    isadd: boolean = false;
    isedit: boolean = false;
    isdetails: boolean = false;

    // Page Pre Render

    constructor(private setActionButtons: SharedVariableService, private _routeParams: ActivatedRoute, private _router: Router,
        private _compservice: CompService, private _userService: UserService, private _msg: MessageService) {
        this.module = "Company";
        this.loginUser = this._userService.getUser();

        this.fillDropDownList();
        this.atttype = "Company Attribute";

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    // Page Load

    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.setActionButtons.setTitle("Edit Company");

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.cmpid = params['id'];
                this.getCompanyById(this.cmpid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.setActionButtons.setTitle("Add Company");

                this.currsymplace = "s";
                this.decimals = "2";
                this.decsep = ".";
                this.thsep = ",";
                $("#cmpcode").focus();

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
                this.fillDropDownByCurrency(this.currency);
            }
        });

        this.attribute.attrparam = ["compinfo_attr"];
    }

    // add, edit, delete button

    createattrjson() {
        var attrid = [];
        if (this.attribute.attrlist.length > 0) {
            for (let items of this.attribute.attrlist) {
                attrid.push({ "id": items.value });
            }
            return attrid;
        }
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            var validateme = commonfun.validate();

            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }

            this.saveCompanyData();
        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $("#cmpcode").focus();
            this.addressBook.AddBook(this.cmpcode);

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        } else if (evt === "back") {
            this._router.navigate(['/setting/company']);
        }
    }

    // Fill Industries, Designation, CompanyType, Country Drop Down

    fillDropDownList() {
        this._compservice.getCompany({ "flag": "dropdown" }).subscribe(data => {
            var d = data.data;

            // BIND Industries TO DROPDOWN
            this.industriesDT = d.filter(a => a.stype === "industries");

            // BIND Designation TO DROPDOWN
            this.desigDT = d.filter(a => a.stype === "desig");

            // BIND Company Type TO DROPDOWN
            this.cmptypeDT = d.filter(a => a.stype === "cmptype");

            // BIND Date Format TO DROPDOWN
            this.dateformatDT = d.filter(a => a.stype === "dateformat");

            // BIND Currency TO DROPDOWN
            this.currencyDT = d.filter(a => a.stype === "currency");
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    fillDropDownByCurrency(pcurrency) {
        this._compservice.getCompany({ "flag": "dropdownbycurrency", "ptype": pcurrency }).subscribe(data => {
            var d = data.data;

            // BIND Currency Symbol Placement TO DROPDOWN
            this.currsymplaceDT = d.filter(a => a.stype === "currsymplace");
            this.currsymplace = "0";

            // BIND Decimals TO DROPDOWN
            this.decimalsDT = d.filter(a => a.stype === "decimals");
            this.decimals = "0";

            // BIND Decimal Separator TO DROPDOWN
            this.decsepDT = d.filter(a => a.stype === "decsep");
            this.decsep = "0";

            // BIND Thousand Separator TO DROPDOWN
            this.thsepDT = d.filter(a => a.stype === "thsep");
            this.thsep = "0";
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    setThSep() {
        if (this.decsep === ".") {
            this.thsep = ",";
        } else {
            this.thsep = ".";
        }
    }

    setDecSep() {
        if (this.thsep === ".") {
            this.decsep = ",";
        } else {
            this.decsep = ".";
        }
    }

    //Attribute Tab Click Event

    Attr() {
        setTimeout(function () {
            $(".attr").val("");
            $(".attr").focus();
        }, 0);
    }

    // Tab Panel

    openTabPopup() {
        this.tabpanel.openTabPopup();
    }

    editTabPopup(tab) {
        this.tabpanel.editTabPopup(tab);
    }

    DeleteTabs(tab) {
        this.tabpanel.DeleteTabs(tab);
    }

    // Save Company

    saveCompanyData() {
        var that = this;

        that.global.push({
            "dateformat": that.dateformat, "currency": that.currency, "currsym": that.currsym, "currsymplace": that.currsymplace,
            "decimals": that.decimals, "decsep": that.decsep, "thsep": that.thsep
        });

        var savecmp = {
            "cmpid": that.cmpid,
            "cmpcode": that.cmpcode,
            "cmpname": that.cmpname,
            "cmpdesc": that.cmpdesc,
            "remarks": that.remarks,
            "industries": that.industries,
            "cmptype": that.cmptype,
            "cmplogo": that.cmplogo,
            "contactperson": that.contactperson,
            "desigid": that.desigid,
            "address": that.adrbookid,
            "uidcode": that.loginUser.login,
            "isactive": that.isactive,
            "dynamicfields": that.tabListDT,
            "attr": that.createattrjson(),
            "global": that.global
        }

        that._compservice.saveCompany(savecmp).subscribe(data => {
            var dataResult = data.data;

            if (dataResult[0].funsave_company.msgid != "-1") {
                var msg = dataResult[0].funsave_company.msg;

                that._msg.Show(messageType.success, "Success", msg);
                that._router.navigate(['/setting/company']);
            }
            else {
                that._msg.Show(messageType.error, "Error", msg);
            }
        }, err => {
            that._msg.Show(messageType.error, "Error", err);
            console.log(err);
        }, () => {
            // console.log("Complete");
        });
    }

    // Get Company

    //Get Code Blur Event
    EnableAddress() {
        this.accode = this.cmpcode;
        this.addressBook.AddBook(this.cmpcode);
        this.adrbookid = [];
    }

    getCompanyById(pcmpid: any) {
        var that = this;

        that._compservice.getCompany({ "flag": "id", "cmpid": pcmpid }).subscribe(data => {
            var company = data.data[0]._cmpdata;
            //debugger;

            var dynFields = data.data[0]._dynfields === null ? [] : data.data[0]._dynfields;
            var attrfields = data.data[0]._attributejson === null ? [] : data.data[0]._attributejson;
            var globfields = data.data[0]._global === null ? [] : data.data[0]._global;

            that.cmpid = company[0].cmpid;
            that.cmpcode = company[0].cmpcode;
            that.cmpname = company[0].cmpname;
            that.cmpdesc = company[0].cmpdesc;
            that.remarks = company[0].remarks;
            that.cmptype = company[0].cmptype;
            that.industries = company[0].industries;
            that.cmplogo = company[0].cmplogo;

            that.contactperson = company[0].contactperson;
            that.desigid = company[0].desigid;

            that.adrcsvid = "";
            var addressdt = company[0].address === null ? [] : company[0].address;

            for (let items of addressdt) {
                that.adrcsvid += items.adrid + ',';
            }

            that.addressBook.getAddress(that.adrcsvid.slice(0, -1));

            that.attribute.attrlist = attrfields;
            that.isactive = company[0].isactive;
            that.tabListDT = dynFields;

            that.dateformat = globfields[0].dateformat;
            that.currency = globfields[0].currency;
            that.fillDropDownByCurrency(that.currency);
            that.currsym = globfields[0].currsym;
            that.currsymplace = globfields[0].currsymplace;
            that.decimals = globfields[0].decimals;
            that.decsep = globfields[0].decsep;
            that.thsep = globfields[0].thsep;
        }, err => {
            console.log(err);
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.subscribeParameters.unsubscribe();
    }
}