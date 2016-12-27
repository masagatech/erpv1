import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { hierview } from './hieview.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class hierComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: hierComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [

                    { path: 'hieview', component: hierview, canActivateChid: [AuthGuard], },
                    { path: '', component: hierview, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule],
    declarations: [
        hierview,
        hierComp
    ],
    providers: [AuthGuard]
})

export default class hierModule {
}