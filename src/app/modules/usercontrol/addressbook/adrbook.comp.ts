import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { AdrBookService } from '../../../_service/addressbook/adrbook-service' //Add Address Book service
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { MessageService, messageType } from '../../../_service/messages/message-service';

declare var $: any;

@Component({
    selector: '<addressbook></addressbook>',
    templateUrl: 'adrbook.comp.html',
    providers: [AdrBookService]
})

export class AddrbookComp implements OnInit, OnDestroy {


    @Input() adrbookid: any = [];
    @Input() adrid:number = 0;
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

    constructor(private _adrbookservice: AdrBookService, private _commonservice: CommonService, private _msg: MessageService) {
        this.getAddress();
        this.filldropdown("Country");
        this.filldropdown("adrtyp");
    }

    filldropdown(group) {
        var that = this;
        this._commonservice.getMOM({ "group": group }).subscribe(data => {
            if (group == "Country") {
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

    AddBook() {
        var that = this;
        that.ClearControll();
        that.adrid = 0;
        setTimeout(function () {
            $(".firstnam").focus();
        }, 500);
    }

    public getAddress() {
        var _this = this;
        console.log(_this.adrid);
        this._adrbookservice.getAdrBook({ "cmpid": 1, "flag": "", "adrid":1 }).subscribe(result => {
            var dataset = result.data;
            if (dataset.length > 0) {
               // _this.addrbooklist=dataset;
                _this.addrbooklist.push({
                    "firstnam": dataset[0].firstnam,
                    "address1": dataset[0].address1,
                    "city": dataset[0].city,
                    "state": dataset[0].state,
                    "pin": dataset[0].pin,
                    "email": dataset[0].email,
                    "mob": dataset[0].mob,
                    "id": dataset[0].id,
                    "isprimary":dataset[0].isprimary
                });
                for (let items of _this.addrbooklist) {
                    _this.adrbookid.push({ "adrid": items.id });
                }
            }
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

    EditAdr(row) {
        var _this = this;
        this._adrbookservice.getAdrBook({
            "cmpid": 1,
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
            "firstnam": that.firstnam,
            "middlenam": that.middlenam,
            "lastnam": that.lastnam,
            "adr1": that.adr1,
            "mob": that.mob == "" ? 0 : that.mob,
            "pin": that.pin,
            "altmob": that.altmob,
            "cmpid": 1,
            "city": that.city,
            "state": that.state,
            "email": that.email,
            "otheremail": that.otheremail,
            "country": that.country == "" ? 0 : that.country,
            "adrtype": that.adrtype == "" ? 0 : that.adrtype,
            "landmrk": that.landmark,
            "chkprimary": that.chkprimary,
            "module": "attr",
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
        if (this.firstnam == "") {
            this._msg.Show(messageType.info, "info", "Please enter first name");
            $(".firstnam").focus();
            return;
        }
        if (this.adr1 == "") {
            this._msg.Show(messageType.info, "info", "Please enter address1");
            $(".addr1").focus();
            return;
        }
        if (this.mob == "") {
            this._msg.Show(messageType.info, "info", "Please enter Primary Mobile No");
            $(".prymob").focus();
            return;
        }
        if (this.email == "") {
            this._msg.Show(messageType.info, "info", "Please enter primary email");
            $(".email").focus();
            return;
        }
        if (this.country == 0) {
            alert("Please select conutry");
            this._msg.Show(messageType.info, "info", "Please select conutry");
            $(".country").focus();
            return;
        }
        var that = this;
        that._adrbookservice.saveAdrBook(
            that.Parameter()
        ).subscribe(result => {
            var dataset = result.data;
            if (dataset[0].funsave_addressbook.maxid > 0) {
                that.adrid = dataset[0].funsave_addressbook.maxid;
                console.log(that.adrid);
                this._msg.Show(messageType.success, "success", "Data save successfully");
                that.ClearControll();
                that.getAddress();
                $('#myModal').modal('hide');
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

