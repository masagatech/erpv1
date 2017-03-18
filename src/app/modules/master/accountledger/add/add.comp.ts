import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../../app/_model/action_buttons'
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../../../_service/common/common-service'
import { accountledger } from "../../../../_service/accountledger/account-service";
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { MessageService, messageType } from '../../../../_service/messages/message-service';
import { AddrbookComp } from "../../../usercontrol/addressbook/adrbook.comp";
import { AttributeComp } from "../../../usercontrol/attribute/attr.comp";
import { LazyLoadEvent, DataTable } from 'primeng/primeng';

import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var commonfun: any;
@Component({
    templateUrl: 'add.comp.html',
    providers: [accountledger, CommonService]

}) export class acladd implements OnInit, OnDestroy {
    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    // local veriable 
    acledid: number = 0;
    acledcode: any = "";
    acledName: any = "";
    parentname: any = "";
    parentid: number = 0;
    remark: any = "";
    ctrlname: any = "";
    ctrlid: number = 0
    isactive: boolean = false;

    //New Auto Completed
    AcledgerAutodata: any = [];
    CtrlAutodata: any = [];
    AccountinfoAutodata: any = [];

    //Address Book
    accode: any = "";
    adrbookid: any = [];
    adrid: number = 0;
    adrcsvid: string = "";
    module: string = "";

    //Controll center 
    Duplicateflag: boolean;
    profflag: boolean = true;
    constflag: boolean = true;

    //Account info
    counter: number = 0;
    acinfoKey: any = "";
    acinfoKeyid: number = 0;
    acvalue: any = "";


    //All Array
    Ctrllist: any = [];
    keyvallist: any = [];

    //File Upload
    uploadedFiles: any = [];
    suppdoc: any = [];

    //User Control
    @ViewChild('addrbook')
    addressBook: AddrbookComp;

    @ViewChild('attribute')
    attribute: AttributeComp;

    private subscribeParameters: any;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    //, private _autoservice:AutoService
    constructor(private _router: Router, private setActionButtons: SharedVariableService,
        private acledgerServies: accountledger,
        private _autoservice: CommonService, private _routeParams: ActivatedRoute, private _userService: UserService,
        private _msg: MessageService) {
        this.loginUser = this._userService.getUser();
        this.module = "acledger";
    }

    loadRBIGrid(event: LazyLoadEvent) {
    }

    //Add Save Edit Delete Button
    ngOnInit() {
        this.actionButton.push(new ActionBtnProp("back", "Back to view", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, true));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));
        this.actionButton.push(new ActionBtnProp("clear", "Refresh", "refresh", true, false));
        this.setActionButtons.setActionButtons(this.actionButton);
        this.setActionButtons.setTitle("Account Ledger");
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));
        $(".accode").removeAttr('disabled', 'disabled');
        $(".accode").focus();
        setTimeout(function () {
            commonfun.addrequire();
        }, 0);

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.acledid = params['id'];
                this.EditAcledgr(this.acledid);

                $('input').attr('disabled', 'disabled');
                $('select').attr('disabled', 'disabled');
                $('textarea').attr('disabled', 'disabled');
                $(".accode").attr('disabled', 'disabled');

            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;
            }
        });
        this.attribute.attrparam = ["custinfo_attr"];

        if (this.acledid == 0) {
            this.getaccountinfo();
        }

    }

    getaccountinfo() {
        try {
            this.acledgerServies.getAccountLedgeracinfo({
                "cmpid": this.loginUser.cmpid
            }).subscribe(result => {
                this.keyvallist = result.data[0].acinfo === null ? [] : result.data[0].acinfo;
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Account Code lose focus 
    Getcode() {
        this.accode = this.acledcode;
        this.addressBook.AddBook(this.acledcode);
        this.adrbookid = [];
    }

    //Account Info Key Auto extender
    AccountinfoAuto(event) {
        try {
            let query = event.query;
            this._autoservice.getAutoDataGET({
                "type": "attribute",
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "filter": "acinfo_attr",
                "search": query
            }).then(data => {
                this.AccountinfoAutodata = data;
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Account Info Key Selected
    AccountinfoSelect(event) {
        this.acinfoKeyid = event.value;
        this.acinfoKey = event.label;
    }

    //AutoCompletd Parent Group
    AcledgerAuto(event) {
        try {
            let query = event.query;
            this._autoservice.getAutoDataGET({
                "type": "nature",
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "search": query
            }).then(data => {
                this.AcledgerAutodata = data;
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Selected Parent Group
    AcledgerSelect(event) {
        this.parentid = event.value;
        this.parentname = event.label;
    }

    //Auto Complete Control Center
    CtrlAuto(event) {
        try {
            let query = event.query;
            this._autoservice.getAutoDataGET({
                "type": "ccauto",
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": this.loginUser.login,
                "search": query
            }).then(data => {
                this.CtrlAutodata = data;
            });
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Selected Complete Control Center
    CtrlSelect(event) {
        this.ctrlid = event.value;
        this.ctrlname = event.label;
    }

    //File Upload Start 
    onUploadStart(e) {
        this.actionButton.find(a => a.id === "save").enabled = false;
    }

    //File Upload Complete 
    onUploadComplete(e) {
        for (var i = 0; i < e.length; i++) {
            this.suppdoc.push({ "id": e[i].id });
        }
        this.actionButton.find(a => a.id === "save").enabled = true;
    }


    //All Tab Click Event
    Attr() {
        setTimeout(function () {
            $(".attr").val("");
            $(".attr").focus();
        }, 0);
    }

    Ctrl() {
        setTimeout(function () {
            $("#ctrlname input").val("");
            $("#ctrlname input").focus();
        }, 0)
    }

    Acinfo() {
        setTimeout(function () {
            $(".key").val("");
            $(".val").val("");
            $(".key input").focus();
        }, 0);
    }

    //Delete Control Center 
    DeleteCtrl(row) {
        var index = -1;
        for (var i = 0; i < this.Ctrllist.length; i++) {
            if (this.Ctrllist[i].id === row.id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.Ctrllist.splice(index, 1);
        $("#ctrlname").focus();
    }

    //Delete Account Info
    DeleteRow(row) {
        var index = -1;
        for (var i = 0; i < this.keyvallist.length; i++) {
            if (this.keyvallist[i].keyid === row.keyid) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.keyvallist.splice(index, 1);
        $("#ctrlname").focus();
    }

    //Add New Controll Center
    AddNewCtrl() {
        try {
            this.acledgerServies.getctrldetail({
                "id": this.ctrlid,
                "cmpid": this.loginUser.cmpid
            }).subscribe(result => {
                if (result.data.length > 0) {
                    this.Duplicateflag = true;
                    for (var i = 0; i < this.Ctrllist.length; i++) {
                        if (this.Ctrllist[i].ctrlname == this.ctrlname) {
                            this.Duplicateflag = false;
                            break;
                        }
                    }
                    if (this.Duplicateflag == true) {
                        this.Ctrllist.push({
                            "ctrlname": result.data[0].ctrlname,
                            "proftcode": result.data[0].proftcode,
                            "costcode": result.data[0].costcode,
                            "profflag": this.profflag,
                            "constflag": this.constflag,
                            "id": result.data[0].autoid
                        });
                        //this.ctrlhide = false;
                        this.ctrlid = 0;
                        this.ctrlname = "";
                        $("#ctrlname input").focus();

                    }
                    else {
                        this._msg.Show(messageType.error, "error", "Duplicate control center");
                        this.ctrlname = "";
                        $("#ctrlname input").focus();
                        return;
                    }
                }
                else {
                    this._msg.Show(messageType.error, "error", "Control name Not found");
                    this.ctrlname = "";
                    $("#ctrlname input").focus();
                    return;
                }

            }, err => {
                console.log("Error")
            }, () => {
                //console.log("completed")
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    AddNewKyeval() {
        try {
            var that = this;
            if (that.acinfoKey == "") {
                that._msg.Show(messageType.error, "error", "Please enter key");
                $(".key").focus()
                return;
            }
            if (that.acvalue == "") {
                that._msg.Show(messageType.error, "error", "Please enter value");
                $(".val").focus()
                return;
            }
            that.Duplicateflag = true;
            if (that.keyvallist.length > 0) {
                for (var i = 0; i < that.keyvallist.length; i++) {
                    if (that.keyvallist[i].acinfoKeyid == that.acinfoKeyid && that.keyvallist[i].value == that.acvalue) {
                        that.Duplicateflag = false;
                        break;
                    }
                }
            }
            if (that.Duplicateflag == true) {
                that.keyvallist.push({
                    'key': that.acinfoKey,
                    'keyid': that.acinfoKeyid,
                    'value': that.acvalue,
                    'counter': that.counter
                });
                that.counter++;
                that.acinfoKey = "";
                that.acvalue = "";
                $(".key").focus();

            }
            else {
                that._msg.Show(messageType.error, "error", "Duplicate key and value");
                $(".key").focus();
                return;
            }
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }
    }

    //Edit Account Group
    EditAcledgr(acid) {
        try {
            var that = this;
            this.acledgerServies.getaccountledger({
                "flag": "edit",
                "acid": acid,
                "cmpid": this.loginUser.cmpid,
                "fy": this.loginUser.fy,
                "createdby": that.loginUser.login
            }).subscribe(data => {
                var dataset = data.data;
                that.acledcode = dataset[0][0].accode;
                that.acledName = dataset[0][0].acname;
                that.parentid = dataset[0][0].parentid;
                that.parentname = dataset[0][0].groupname;
                that.remark = dataset[0][0].remark;
                that.isactive = dataset[0][0].isactive;
                that.attribute.attrlist = dataset[0][0]._attributejson === null ? [] : dataset[0][0]._attributejson;
                that.keyvallist = dataset[0][0]._keyvalue === null ? [] : dataset[0][0]._keyvalue;
                that.Ctrllist = dataset[0][0]._ctrlcenter === null ? [] : dataset[0][0]._ctrlcenter;
                var address = dataset[0][0].adrid === null ? [] : dataset[0][0].adrid;
                if (address.length > 0) {
                    that.adrcsvid = "";
                    for (let items of address) {
                        that.adrcsvid += items.adrid + ',';
                    }
                    that.addressBook.getAddress(that.adrcsvid.slice(0, -1));
                }
            }, err => {
                console.log("Error");
            }, () => {
                // console.log("Complete");
            })
        } catch (e) {
            this._msg.Show(messageType.error, "error", e.message);
        }

    }

    //Clear All Control
    ClearControll() {
        this.acledcode = "";
        this.acledName = "";
        this.parentname = "";
        this.parentid = 0;
        this.remark = "";
        this.attribute.attrlist = [];
        this.Ctrllist = [];
        this.keyvallist = [];
        this.addressBook.ClearArray();
        $(".accode").removeAttr('disabled', 'disabled');
        $(".accode").focus();
    }

    createjsonattr() {
        var attrid = [];
        if (this.attribute.attrlist.length > 0) {
            for (let items of this.attribute.attrlist) {
                attrid.push({ "id": items.value });
            }
            return attrid;
        }
    }

    createjsonacinfo() {
        var keydata = [];
        if (this.keyvallist.length > 0) {
            for (let items of this.keyvallist) {
                if (items.value != "") {
                    keydata.push({
                        "id": items.keyid,
                        "val": items.value
                    });
                }
            }
        }
        return keydata;
    }

    createjsonctrl() {
        var Ctrllistdet = [];
        for (let ctrid of this.Ctrllist) {
            Ctrllistdet.push({
                "id": ctrid.id,
                "profchk": ctrid.profflag,
                "conschk": ctrid.constflag
            });
        }
        return Ctrllistdet;
    }

    //Return Json Param
    JsonParam() {
        var Param = {
            "acid": this.acledid,
            "accode": this.acledcode,
            "acname": this.acledName,
            "parentid": this.parentid,
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "adr": this.adrbookid,
            "attr": this.createjsonattr(),
            "ctrl": this.createjsonctrl(),
            "acinfo": this.createjsonacinfo(),
            "doc": this.suppdoc,
            "createdby": this.loginUser.login,
            "remark": this.remark,
            "isactive": this.isactive,
            "remark1": "remark1",
            "remark2": "remark2",
            "remark3": []
        }
        return Param;
    }

    //Add Top Buttons Add Edit And Save
    actionBarEvt(evt) {
        if (evt === "clear") {
            this.ClearControll();
        }
        if (evt === "back") {
            this._router.navigate(['master/acledger']);
        }
        if (evt === "save") {
            var validateme = commonfun.validate();
            if (!validateme.status) {
                this._msg.Show(messageType.error, "error", validateme.msglist);
                validateme.data[0].input.focus();
                return;
            }
            if (this.adrbookid.length == 0) {
                this._msg.Show(messageType.error, "error", "Please enter contact address");
                return;
            }
            if (this.attribute.attrlist.length === 0) {
                this._msg.Show(messageType.error, "error", "Please enter attribute");
                return;
            }
            if (this.Ctrllist.length === 0) {
                this._msg.Show(messageType.error, "error", "Please enter control center");
                return;
            }
            this.actionButton.find(a => a.id === "save").enabled = false;
            this.acledgerServies.saveAcLedger(
                this.JsonParam()
            ).subscribe(result => {
                try {
                    var dataset = result.data;
                    if (dataset[0].funsave_coa.maxid === "-1") {
                        this._msg.Show(messageType.error, "error", dataset[0].funsave_coa.msg);
                        $(".accode").focus();
                        return;
                    }
                    if (dataset[0].funsave_coa.maxid > 0) {
                        this._msg.Show(messageType.success, "success", dataset[0].funsave_coa.msg);
                        this.ClearControll();
                        if (this.acledid > 0) {
                            this._router.navigate(['master/acledger']);
                        }
                    }
                    else {
                        this._msg.Show(messageType.error, "error", "Service Error");
                    }
                } catch (e) {
                    this._msg.Show(messageType.error, "error", e.message);
                }

            }, err => {
                console.log("Error");
            }, () => {
                'Final'
            });
            this.actionButton.find(a => a.id === "save").enabled = true;

        } else if (evt === "edit") {
            $('input').removeAttr('disabled');
            $('select').removeAttr('disabled');
            $('textarea').removeAttr('disabled');
            $(".accode").attr('disabled', 'disabled');
            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
            $(".acName").focus();
            this.actionButton.find(a => a.id === "save").hide = false;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    ngOnDestroy() {
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.setActionButtons.setTitle("");
    }
}