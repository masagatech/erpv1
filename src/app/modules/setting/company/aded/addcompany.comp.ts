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
import { DynamicTabModule } from "../../../usercontrol/dynamictab";
import { AddDynamicTabComp } from "../../../usercontrol/adddynamictab";

declare var $: any;

@Component({
    templateUrl: 'addCompany.comp.html',
    providers: [CompService, CommonService, DynamicFieldsService]
})

export class AddCompany implements OnInit, OnDestroy {
    title: any = "";

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
    mobileno: string = "";
    altmobileno: string = "";
    emailid: string = "";
    altemailid: string = "";
    country: string = "";
    state: string = "";
    city: string = "";
    pincode: string = "";
    address: string = "";
    isactive: boolean = false;

    dateformat: string = "";
    currency: string = "";
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
    settingsDT: any = [];

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
        this.loginUser = this._userService.getUser();

        this.fillDropDownList();
        this.atttype = "Company Attribute";

        this.isadd = _router.url.indexOf("add") > -1;
        this.isedit = _router.url.indexOf("edit") > -1;
        this.isdetails = _router.url.indexOf("details") > -1;
    }

    // Page Load

    ngOnInit() {
        this.setActionButtons.setTitle("Company");

        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.title = "Edit Company Details";

                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.cmpid = params['id'];
                this.getCompanyById(this.cmpid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
            }
            else {
                this.title = "Add Company Details";

                setTimeout(function () {
                    $("#cmpcode").focus();
                }, 0);

                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                $('input').removeAttr('disabled');
                $('select').removeAttr('disabled');
                $('textarea').removeAttr('disabled');
            }
        });
    }

    // add, edit, delete button

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveCompanyData();
        } else if (evt === "edit") {
            setTimeout(function () {
                $("#cmpcode").focus();
            }, 0);

            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');

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

            // BIND Country TO DROPDOWN
            this.countryDT = d.filter(a => a.stype === "country");

            // BIND Date Format TO DROPDOWN
            this.dateformatDT = d.filter(a => a.stype === "dateformat");

            // BIND Date Format TO DROPDOWN
            this.currencyDT = d.filter(a => a.stype === "currency");
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    // Fill Settings Grid

    fillSettingsGrid() {
        this._compservice.getCompany({ "flag": "settings", "stype": this.currency }).subscribe(data => {
            this.settingsDT = data.data;
            //this.settingsDT[0].key = this.settingsDT[0].ctrlflds[0].key;
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
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
        var settings: any = [];
        var stype: string = "";
        var skey: string = "";
        var jsonval: string = "";

        //monthpriceDT.push(JSON.parse("{" + jsonval.substring(0, jsonval.length - 1) + "}"));

        for (var i = 0; i < that.settingsDT.length; i++) {
            for (var j = 0; j < that.settingsDT[i].ctrlflds.length; j++) {
                stype = that.settingsDT[i].ctrlflds[j].stype;
                skey = that.settingsDT[i].ctrlflds[j].key;

                jsonval += '"' + stype.trim() + '":  "' + skey + '",';
            }
        }

        settings.push(JSON.parse("{" + jsonval.substring(0, jsonval.length - 1) + "}"));

        that.global.push({ "dateformat": that.dateformat, "currency": that.currency, "settings": settings });

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
            "emailid": that.emailid,
            "altemailid": that.altemailid,
            "mobileno": that.mobileno,
            "altmobileno": that.altmobileno,
            "address": that.address,
            "country": that.country,
            "state": that.state,
            "city": that.city,
            "pincode": that.pincode,
            "uidcode": that.loginUser.login,
            "isactive": that.isactive,
            "dynamicfields": that.tabListDT,
            "global": that.global
        }

        that._compservice.saveCompany(savecmp).subscribe(data => {
            var dataResult = data.data;
            console.log(dataResult);

            if (dataResult[0].funsave_company.msgid != "-1") {
                var msg = dataResult[0].funsave_company.msg;
                var parentid = dataResult[0].funsave_company.keyid;

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

    getCompanyById(pcmpid: any) {
        var that = this;

        that._compservice.getCompany({ "flag": "id", "cmpid": pcmpid }).subscribe(data => {
            var company = data.data[0]._cmpdata;
            var dynFields = data.data[0]._dynfields === null ? [] : data.data[0]._dynfields;
            var globalFields = data.data[0]._global === null ? [] : data.data[0]._global;

            console.log(company);

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
            that.emailid = company[0].emailid;
            that.altemailid = company[0].altemailid;
            that.mobileno = company[0].mobileno;
            that.altmobileno = company[0].altmobileno;
            that.address = company[0].address;
            that.country = company[0].country;
            that.state = company[0].state;
            that.city = company[0].city;
            that.pincode = company[0].pincode;
            that.isactive = company[0].isactive;
            that.tabListDT = dynFields;

            that.dateformat = globalFields[0].dateformat;
            that.currency = globalFields[0].currency;

            console.log(globalFields);
            that.fillSettingsGrid();

            // for (var i = 0; i < globalFields.length; i++) {
            //     for (var j = 0; j < globalFields[i].settings.length; j++) {
            //         globalFields[i].key = globalFields[i].settings[j].currencySymbol;

            //         // stype = that.settingsDT[i].ctrlflds[j].stype;
            //         // skey = that.settingsDT[i].ctrlflds[j].key;
            //     }
            // }

            
            //that.settingsDT = globalFields[0].settings;
        }, err => {
            console.log("Error");
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