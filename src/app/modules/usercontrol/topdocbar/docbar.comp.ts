import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActionBtnProp } from '../../../../app/_model/action_buttons'
import { GlobalSharedVariableService } from "../../../_service/sharedvariableglobal-service";
import { Subscription } from 'rxjs/Subscription';
@Component({
    selector: '<topdocbar></topdocbar>',
    templateUrl: 'docbar.comp.html'
})



export class DocBarComponent implements OnInit, OnDestroy {

    breadCrumb: any = [];
    subscription: Subscription;
    constructor(private _sharedVariableGlobal: GlobalSharedVariableService) {

    }

    @Input() Input_Actionbuttons: ActionBtnProp[] = [];
    @Input() title: string = "";

    ngOnInit() {

    }
    callnotify(id) {
        // this.setActionButtons.callActionButtonsEvent(id);
    }
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}