import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActionBtnProp,Evt } from '../../../_model/action_buttons'
import { SharedVariableService } from "../../../_service/sharedvariable-service";


import { Subscription } from 'rxjs/Subscription';
@Component({
    selector: '<topdocbar></topdocbar>',
    templateUrl: 'docbar.comp.html'
})



export class DocBarComponent implements OnInit, OnDestroy {

    breadCrumb: any = [];
    subscription: Subscription;
    constructor(private _sharedVariable: SharedVariableService) {

    }

    @Input() Input_Actionbuttons: ActionBtnProp[] = [];
    @Input() title: string = "";

    ngOnInit() {

    }
    callnotify(id, $evt) {
        this._sharedVariable.callActionButtonsEvent(id);
        this._sharedVariable.callActionButtonsEvent_extra(id, $evt);
        
    }
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}