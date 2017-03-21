import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddUser } from './aded/adduser.comp';
import { ViewUser } from './view/viewuser.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, CheckboxModule } from 'primeng/primeng';

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
        data: { "module": "pset" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddUser, canActivateChid: [AuthGuard],  data: { "module": "pset", "submodule":"um", "rights": "add", "urlname": "/add" }},
                    { path: 'details/:id', component: AddUser, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule":"um", "rights": "edit", "urlname": "/edit" } },
                    { path: 'edit/:id', component: AddUser, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule":"um", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewUser, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule":"um", "rights": "view", "urlname": "/usermaster" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, DataTableModule, CheckboxModule],
    declarations: [
        AddUser,
        ViewUser,
        UserMasterComp
    ],
    providers: [AuthGuard]
})

export default class UserModule {
}