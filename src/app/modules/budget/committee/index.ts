import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddCommitteeComp } from './aded/addbdcmt.comp';
import { ViewCommitteeComp } from './view/viewbdcmt.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, DataListModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class CommitteeComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: CommitteeComp,
        canActivate: [AuthGuard],
        data: { "module": "bdg" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddCommitteeComp, canActivateChid: [AuthGuard],  data: { "module": "bdg", "submodule":"bdcmt", "rights": "add", "urlname": "" }},
                    { path: 'edit/:id', component: AddCommitteeComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdcmt", "rights": "edit", "urlname": "/edit" } },
                    { path: 'details/:id', component: AddCommitteeComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdcmt", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewCommitteeComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdcmt", "rights": "view", "urlname": "/committee" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
     DataTableModule, DataListModule, CalendarModule, NumTextModule],
    declarations: [
        AddCommitteeComp,
        ViewCommitteeComp,
        CommitteeComp
    ],
    providers: [AuthGuard]
})

export default class CommitteeModule {
}