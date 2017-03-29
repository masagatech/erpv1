import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddUserRights } from './aded/addur.comp';
import { ViewUserRights } from './view/viewur.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';
import { GroupByPipe } from '../../../_pipe/groupby.pipe';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UserMoreRightsModule } from '../../usercontrol/usermorerights';

import { LazyLoadEvent, DataTableModule, DataListModule, CheckboxModule, PanelModule, DialogModule, AutoCompleteModule } from 'primeng/primeng';

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
        data: { "module": "pset" },
        children: [
            {
                path: '',
                children: [
                    { path: '', component: AddUserRights, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule": "ur", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: AddUserRights, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule": "ur", "rights": "edit", "urlname": "/edit" } },
                    { path: 'view', component: ViewUserRights, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule": "ur", "rights": "view", "urlname": "/userrights" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, DataListModule, CheckboxModule, PanelModule, DialogModule, AutoCompleteModule,
        UserMoreRightsModule],
    declarations: [
        AddUserRights,
        ViewUserRights,
        UserRightsComp,
        GroupByPipe
    ],
    providers: [AuthGuard]
})

export default class UserRightsModule {
}