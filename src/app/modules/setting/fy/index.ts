import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddFY } from './aded/addfy.comp';
import { ViewFY } from './view/viewfy.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class FYComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: FYComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddFY, canActivateChid: [AuthGuard], },
                    { path: 'edit/:fyid', component: AddFY, canActivateChid: [AuthGuard], },
                    { path: '', component: ViewFY, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule],
    declarations: [
        AddFY,
        ViewFY,
        FYComp
    ],
    providers: [AuthGuard]
})

export default class FYModule {
}