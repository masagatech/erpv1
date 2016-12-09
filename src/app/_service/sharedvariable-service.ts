import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ActionBtnProp } from '../../app/_model/action_buttons'
import { LoginUser } from '../../app/_model/user_model'

@Injectable()
export class SharedVariableService {

    constructor() {

    }
    
    // Observable string sources
    private actionButtonSource = new Subject<ActionBtnProp[]>();
    private actionButtonEventSource = new Subject<string>();

    // Observable string streams
    public setActionButtons$ = this.actionButtonSource.asObservable();
    public setActionButtonsEvent$ = this.actionButtonEventSource.asObservable();

    setActionButtons(actionButtons: ActionBtnProp[]) {
        this.actionButtonSource.next(actionButtons);
    }

    callActionButtonsEvent(evt: string) {
        this.actionButtonEventSource.next(evt);
    }
}