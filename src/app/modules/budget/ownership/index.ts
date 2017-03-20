import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddOwnershipComp } from './aded/addbdowners.comp';
import { ViewOwnershipComp } from './view/viewbdowners.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, DataListModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';
import { GroupByPipe } from '../../../_pipe/groupby.pipe';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class OwnershipComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: OwnershipComp,
        canActivate: [AuthGuard],
        data: { "module": "bdg" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddOwnershipComp, canActivateChid: [AuthGuard],  data: { "module": "bdg", "submodule":"bdenv", "rights": "add", "urlname": "" }},
                    { path: 'edit/:id', component: AddOwnershipComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdenv", "rights": "edit", "urlname": "/edit" } },
                    { path: 'details/:id', component: AddOwnershipComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdenv", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewOwnershipComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule": "bdenv", "rights": "view", "urlname": "/envelope" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, DataTableModule, DataListModule, CalendarModule, NumTextModule],
    declarations: [
        AddOwnershipComp,
        ViewOwnershipComp,
        OwnershipComp,
        GroupByPipe
    ],
    providers: [AuthGuard]
})

export default class OwnershipModule {
}