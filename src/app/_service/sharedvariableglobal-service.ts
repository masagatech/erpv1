import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GlobalSharedVariableService {
    constructor() {

    }
    private breadCrumbSource = new Subject<string>();
    public TitleEventEvent$ = this.breadCrumbSource.asObservable();
    // public setBreadCrumbEvent$ = this.breadCrumbEventSource.asObservable();

    //bread crumbs
    setbreadCrumb(title: string) {
        this.breadCrumbSource.next(title);
    }

    // callBreadCrumbChangeEvent(evt: string) {
    //     this.breadCrumbEventSource.next(evt);
    // }

}