import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedVariableService } from "../../../../_service/sharedvariable-service";
import { ActionBtnProp } from '../../../../_model/action_buttons';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../../../../_service/user/user-service';
import { LoginUserModel } from '../../../../_model/user_model';
import { CommonService } from '../../../../_service/common/common-service' /* add reference for MOM */
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, messageType } from '../../../../_service/messages/message-service';

declare var $: any;

@Component({
    templateUrl: 'addmom.comp.html',
    providers: [CommonService]
})

export class AddMOM implements OnInit, OnDestroy {
    title: any;
    validSuccess: Boolean = true;
    loginUser: LoginUserModel;

    momid: number = 0;
    groupdt: any = [];
    group: string = "";
    key: string = "";
    val: string = "";

    actionButton: ActionBtnProp[] = [];
    subscr_actionbarevt: Subscription;

    private subscribeParameters: any;

    constructor(private _routeParams: ActivatedRoute, private _router: Router, private setActionButtons: SharedVariableService,
        private _commonservice: CommonService, private _userService: UserService, private _message: MessageService) {
        this.loginUser = this._userService.getUser();
        this.getMOMGroup();
    }

    ngOnInit() {
        this.setActionButtons.setTitle("Master of Master");

        this.actionButton.push(new ActionBtnProp("back", "Back", "long-arrow-left", true, false));
        this.actionButton.push(new ActionBtnProp("save", "Save", "save", true, false));
        this.actionButton.push(new ActionBtnProp("edit", "Edit", "edit", true, false));
        this.actionButton.push(new ActionBtnProp("delete", "Delete", "trash", true, false));

        this.setActionButtons.setActionButtons(this.actionButton);
        this.subscr_actionbarevt = this.setActionButtons.setActionButtonsEvent$.subscribe(evt => this.actionBarEvt(evt));

        this.subscribeParameters = this._routeParams.params.subscribe(params => {
            if (params['id'] !== undefined) {
                this.actionButton.find(a => a.id === "save").hide = true;
                this.actionButton.find(a => a.id === "edit").hide = false;

                this.momid = params['id'];
                this.getMOMByID(this.momid);

                $('#Group').prop('disabled', true);
                $('#Key').prop('disabled', true);
                $('#Val').prop('disabled', true);
            }
            else {
                this.actionButton.find(a => a.id === "save").hide = false;
                this.actionButton.find(a => a.id === "edit").hide = true;

                setTimeout(function () {
                    $("#Group").focus();
                }, 0);

                $('#Group').prop('disabled', false);
                $('#Key').prop('disabled', false);
                $('#Val').prop('disabled', false);
            }
        });
    }

    actionBarEvt(evt) {
        if (evt === "save") {
            this.saveMOMDetails();
        } else if (evt === "edit") {
            $('#Group').attr('disabled', 'disabled');
            $('#Key').attr('disabled', 'disabled');
            $('#Val').removeAttr('disabled');

            setTimeout(function () {
                $("#Val").focus();
            }, 0);

            this.actionButton.find(a => a.id === "save").hide = false;
            this.actionButton.find(a => a.id === "edit").hide = true;
        } else if (evt === "delete") {
            alert("delete called");
        }
    }

    getMOMGroup() {
        var that = this;

        that._commonservice.getMOM({ "flag": "group" }).subscribe(data => {
            that.groupdt = data.data;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    saveMOMDetails() {
        var that = this;

        var saveMOM = {
            "id": that.momid,
            "group": that.group,
            "key": that.key,
            "val": that.val,
            "uidcode": that.loginUser.login
        }

        if (that.validSuccess) {
            that._commonservice.saveMOM(saveMOM).subscribe(data => {
                try {
                    var dataResult = data.data;

                    if (dataResult[0].funsave_mom.doc == "1") {
                        that._message.Show(messageType.success, 'Confirmed', dataResult[0].funsave_mom.msg.toString());
                        that._router.navigate(['/setting/masterofmaster']);
                    }
                    else if (dataResult[0].funsave_mom.doc == "-1") {
                        that._message.Show(messageType.info, 'Info', dataResult[0].funsave_mom.msg.toString());
                    }
                    else {
                        that._message.Show(messageType.error, 'Error', dataResult[0].funsave_mom.msg.toString());
                    }
                }
                catch (e) {
                    that._message.Show(messageType.error, 'Error', e.message);
                }
            }, err => {
                that._message.Show(messageType.error, 'Error', err);
            }, () => {
                // console.log("Complete");
            });
        }
    }

    // get mom by id

    getMOMByID(pmomid: number) {
        this._commonservice.getMOM({ "flag": "id", "id": pmomid }).subscribe(data => {
            var dataresult = data.data;

            this.momid = dataresult[0].id;
            this.group = dataresult[0].group;
            this.key = dataresult[0].key;
            this.val = dataresult[0].val;
        }, err => {
            console.log("Error");
        }, () => {
            // console.log("Complete");
        })
    }

    ngOnDestroy() {
        console.log('ngOnDestroy');
        this.actionButton = [];
        this.subscr_actionbarevt.unsubscribe();
        this.subscribeParameters.unsubscribe();
    }
}