import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { AdrBookService } from '../../../_service/addressbook/adrbook-service' //Add Address Book service
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';

declare var $: any;

@Component({
    selector: '<addressbook></addressbook>',
    templateUrl: 'adrbook.comp.html',
    providers: [AdrBookService]
})

export class AddrbookComp implements OnInit, OnDestroy {
    @Input() adrbookid: any = [];
    @Input() adrid: number = 0;
    @Input() module: string = "";
    @Input() accode: string = "";
    mod: string = "";
    adr1: any = "";
    mob: any = 0;
    pin: any = "";
    altmob: any = "";
    email: any = "";
    otheremail: any = "";
    city: any = "";
    state: any = "";
    country: any = 0;
    adrtype: any = 0;
    adrtypelist: any = [];
    landmark: any = "";
    remark: any = "";
    firstnam: any = "";
    middlenam: any = "";
    lastnam: any = "";
    addrbooklist: any = [];
    countryDT: any[];
    chkprimary: boolean = false;
    chkpri: boolean = false;
    editmodeflag: boolean = false;
    //user details
    loginUser: LoginUserModel;
    loginUserName: string;
    codefalg: boolean = false;

    constructor(private _adrbookservice: AdrBookService, private _commonservice: CommonService,
        private _msg: MessageService, private _userService: UserService) {
        // this.getAddress();
        this.loginUser = this._userService.getUser();
        this.filldropdown("country");
        this.filldropdown("adrtype");

    }

    filldropdown(group) {
        var that = this;
        this._commonservice.getMOM({ "group": group }).subscribe(data => {
            if (group == "country") {
                that.countryDT = data.data;
            }
            else {
                that.adrtypelist = data.data;
            }
        }, err => {
            console.log("Error");
        }, () => {
            console.log("Complete");
        })
    }

    Addbookclick() {
        this.ClearControll();
        setTimeout(function () {
            $(".firstnam").focus();
        }, 500);
    }

    AddBook(code) {
        var that = this;
        if (code != "") {
            that.adrid = 0;
            that.codefalg = true;
            that.accode = code;
        }
    }

    public getAddress(_adrid: string) {
        var _this = this;
        this._adrbookservice.getAdrBook({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "flag": "",
            "adrid": _adrid
        }).subscribe(result => {
            var dataset = result.data;
            if (dataset.length > 0) {
                //_this.addrbooklist = dataset;
                var vid = _this.addrbooklist.filter(item => item.id);
                if (_this.addrbooklist.length > 0) {
                    for (let items of vid) {
                        if (items.id == _adrid) {
                            _this.editmodeflag = true;
                        }
                    }
                    if (_this.editmodeflag == false) {
                        _this.addrbooklist.push({
                            "firstnam": dataset[0].firstnam,
                            "address1": dataset[0].address1,
                            "city": dataset[0].city,
                            "state": dataset[0].state,
                            "pin": dataset[0].pin,
                            "email": dataset[0].email,
                            "mob": dataset[0].mob,
                            "id": dataset[0].id,
                            "isprimary": dataset[0].isprimary
                        });
                    }
                }
                else {
                    for (let items of dataset) {
                        _this.addrbooklist.push({
                            "firstnam": items.firstnam,
                            "address1": items.address1,
                            "city": items.city,
                            "state": items.state,
                            "pin": items.pin,
                            "email": items.email,
                            "mob": items.mob,
                            "id": items.id,
                            "isprimary": items.isprimary
                        });
                    }
                }
                for (var i = 0; i <= _this.addrbooklist.length - 1; i++) {
                    _this.adrbookid.push(_this.addrbooklist[i].id,",");
                }
            }
             return JSON.stringify(_this.adrbookid).replace('[', '{').replace(']', '}');
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ClearControll() {
        var that = this;
        that.adr1 = "";
        that.mob = "";
        that.pin = "";
        that.altmob = "";
        that.city = "";
        that.email = "";
        that.otheremail = "";
        that.state = "";
        that.country = "";
        that.adrtype = "";
        that.landmark = "";
        that.remark = "";
        that.firstnam = "";
        that.middlenam = "";
        that.lastnam = "";
        that.mod = "";
    }

    public ClearArray() {
        this.addrbooklist = [];
        this.adrbookid = [];
    }

    EditAdr(row) {
        var _this = this;
        this._adrbookservice.getAdrBook({
            "cmpid": this.loginUser.cmpid,
            "fy": this.loginUser.fy,
            "createdby": this.loginUser.login,
            "adrid": row.id,
            "flag": "edit"
        }).subscribe(result => {
            var dataset = result.data;
            _this.firstnam = dataset[0].firstnam;
            _this.middlenam = dataset[0].middlenam;
            _this.lastnam = dataset[0].lastnam;
            _this.adrid = dataset[0].id;
            _this.adr1 = dataset[0].address1;
            _this.mob = dataset[0].mob;
            _this.altmob = dataset[0].othermob;
            _this.email = dataset[0].email;
            _this.otheremail = dataset[0].otheremail;
            _this.pin = dataset[0].pincode;
            _this.city = dataset[0].city;
            _this.state = dataset[0].state;
            _this.country = dataset[0].country;
            _this.adrtype = dataset[0].adrtype;
            _this.chkprimary = dataset[0].isprimary;
            _this.landmark = dataset[0].landmark;
            _this.chkpri = dataset[0].isprimary;
            setTimeout(function () {
                $(".firstnam").focus();
            }, 500);
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })


    }

    Parameter() {
        var that = this;
        var Param = {
            "adrid": that.adrid,
            "firstnam": that.firstnam.trim(),
            "middlenam": that.middlenam.trim(),
            "lastnam": that.lastnam.trim(),
            "adr1": that.adr1.trim(),
            "mob": that.mob.trim() == "" ? 0 : that.mob.trim(),
            "pin": that.pin.trim(),
            "altmob": that.altmob.trim(),
            "cmpid": this.loginUser.cmpid,
            "city": that.city.trim(),
            "state": that.state.trim(),
            "email": that.email.trim(),
            "otheremail": that.otheremail.trim(),
            "country": that.country == "" ? 0 : that.country,
            "adrtype": that.adrtype == "" ? 0 : that.adrtype,
            "landmrk": that.landmark.trim(),
            "chkprimary": that.chkprimary,
            "module": that.module,
            "accode": that.accode,
            "entity": 1,
            "createdby": "admin",
            "remark": that.remark,
            "remark1": "",
            "remark2": "",
            "remark3": ""
        }

        return Param;
    }

    SaveAdr() {
        var that = this;
        if ($(".firstnam").val().trim() == "") {
            that._msg.Show(messageType.error, "error", "First *");
            $(".firstnam").val("");
            $(".firstnam").focus();
            return;
        }
        if ($(".addr1").val().trim() == "") {
            that._msg.Show(messageType.error, "error", "Address *");
            $(".addr1").val("");
            $(".addr1").focus();
            return;
        }
        if ($(".prymob").val().trim() == "") {
            that._msg.Show(messageType.error, "error", "Primary Mobile *");
            $(".prymob").val("");
            $(".prymob").focus();
            return;
        }
        that._adrbookservice.saveAdrBook(
            that.Parameter()
        ).subscribe(result => {
            var dataset = result.data;
            if (dataset[0].funsave_addressbook.maxid > 0) {
                var adridmaxid = dataset[0].funsave_addressbook.maxid;
                //that._msg.Show(messageType.success, "success", "Data save successfully");
                $('#myModal').modal('hide');
                that.getAddress(adridmaxid);
                var vid = that.addrbooklist.filter(item => item.id);
                for (let items of vid) {
                    if (items.id == that.adrid) {
                        items.firstnam = that.firstnam + " " + that.lastnam;
                        items.adr1 = that.adr1;
                        items.city = that.city;
                        items.state = that.state;
                        items.pin = that.pin;
                        items.email = that.email;
                        items.mob = that.mob;
                        items.isprimary = that.chkprimary;
                        break;
                    }
                }
                that.ClearControll();
            }
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnInit() {

        setTimeout(function () {

        }, 1);
    }

    ngOnDestroy() {
    }
}

