import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { CommonService } from '../../../_service/common/common-service' /* add reference for master of master */
import { MessageService, messageType } from '../../../_service/messages/message-service';
import { UserService } from '../../../_service/user/user-service';
import { LoginUserModel } from '../../../_model/user_model';
import { AutoCompleteModule } from 'primeng/primeng';
import { Subscription } from 'rxjs/Subscription';
// import { SharedVariableService } from "../../../_service/sharedvariable-service";

declare var $: any;

@Component({
    selector: '<attribute></attribute>',
    templateUrl: 'attr.comp.html',
    providers: [CommonService]
})

export class AttributeComp implements OnInit, OnDestroy {
    //Local Veriable 
    attrparam: any = [];
    labelname: string = "Attribute";
    attrtype: string = "multiattr";
    attrlist: any = [];
    attrname: any = "";
    attrid: number = 0;
    Duplicateflag: boolean = false;
    AttributeAutodata: any = [];

    @Input() isdetails: boolean = false;

    //user details
    loginUser: LoginUserModel;
    loginUserName: string;

    constructor(private _commonservice: CommonService,
        private _msg: MessageService, private _userService: UserService) {
        this.loginUser = this._userService.getUser();
    }
    ngOnInit() {
    }

    // Autocompleted Attribute Name
    getAutoCompleteattr(me: any) {
        var that = this;
        this._commonservice.getAutoData({
            "type": that.attrtype,
            "search": that.attrname,
            "cmpid": that.loginUser.cmpid,
            "fy": that.loginUser.fy,
            "filter": that.attrparam.join(),
            "createdby": that.loginUser.login
        }).subscribe(data => {
            $(".attr").autocomplete({
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
                    me.attrid = ui.item.value;
                    me.attrname = ui.item.label;
                }
            });
        }, err => {
            console.log("Error");
        }, () => {
            this.attrid = 0;
        })
    }

    // AttributeAuto(event) {
    //     let query = event.query;
    //     this._commonservice.getAutoDataGET({
    //         "type": this.attrtype,
    //         "search": query,
    //         "cmpid": this.loginUser.cmpid,
    //         "fy": this.loginUser.fy,
    //         "filter": this.attrparam.join(),
    //         "createdby": this.loginUser.login
    //     }).then(data => {
    //         this.AttributeAutodata = data;
    //     });
    // }

    // //Selected Attribute
    // AttributeSelect(event) {
    //     this.attrid = event.value;
    //     this.attrname = event.label;
    // }

    //Add Attribute 
    AttributeAdd() {
        //if ($(".attr").val() != "") {
        if (this.attrid > 0) {
            this.Duplicateflag = true;
            if (this.attrlist.length > 0) {
                for (var i = 0; i < this.attrlist.length; i++) {
                    if (this.attrlist[i].attrname == this.attrname) {
                        this.Duplicateflag = false;
                        break;
                    }
                }
            }
            if (this.Duplicateflag == true) {
                this.attrlist.push({
                    'attrname': this.attrname,
                    'value': this.attrid
                });
                this.attrname = "";
                $(".attr").focus();
            }
            else {
                this._msg.Show(messageType.error, "error", "Duplicate Attribute");
                $(".attr").focus();
                return;
            }

        }
        else {
            this._msg.Show(messageType.error, "error", "Please enter valied attribute name");
            $(".attr").focus();
            return;
        }
        //  }
    }
    //Remove  Attribute 
    Removeattr(row) {
        var index = -1;
        for (var i = 0; i < this.attrlist.length; i++) {
            if (this.attrlist[i].value === row.value) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.log("Wrong Delete Entry");
        }
        this.attrlist.splice(index, 1);
        $(".attr").focus();
    }



    ngOnDestroy() {
    }
}

