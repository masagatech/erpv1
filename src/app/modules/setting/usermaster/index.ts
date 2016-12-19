import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddUser } from './aded/adduser.comp';
import { ViewUser } from './view/viewuser.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class UserMasterComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: UserMasterComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddUser, canActivateChid: [AuthGuard], },
                    { path: 'edit/:uid', component: AddUser, canActivateChid: [AuthGuard], },
                    { path: '', component: ViewUser, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule],
    declarations: [
        AddUser,
        ViewUser,
        UserMasterComp
    ],
    providers: [AuthGuard]
})

export default class UserModule {
}