import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddUserRights } from './aded/addur.comp';
import { ViewUserRights } from './view/viewur.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DataListModule, PanelModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class UserRightsComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: UserRightsComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddUserRights, canActivateChid: [AuthGuard], },
                    { path: 'edit/:uid', component: AddUserRights, canActivateChid: [AuthGuard], },
                    { path: '', component: ViewUserRights, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, DataListModule, PanelModule],
    declarations: [
        AddUserRights,
        ViewUserRights,
        UserRightsComp
    ],
    providers: [AuthGuard]
})

export default class UserRightsModule {
}