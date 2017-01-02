import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

 import { pendingdc } from '../pendingDC/pendingdc.comp';    

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
    template: '<router-outlet></router-outlet>'
})
export class PendingdcComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: PendingdcComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'pendingdc', component: pendingdc, canActivateChid: [AuthGuard], },
                    { path: '', component: pendingdc, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
    declarations: [
        pendingdc,
        PendingdcComp
    ],
    providers: [AuthGuard]
})

export default class PendingdcModule {
}