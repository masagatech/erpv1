import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddOwnershipComp } from './aded/addbdowners.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

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
                    { path: '', component: AddOwnershipComp, canActivateChid: [AuthGuard],  data: { "module": "bdg", "submodule":"bdenv", "rights": "add", "urlname": "" }},
                    { path: 'edit/:id', component: AddOwnershipComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdenv", "rights": "edit", "urlname": "/edit" } },
                    { path: 'details/:id', component: AddOwnershipComp, canActivateChid: [AuthGuard], data: { "module": "bdg", "submodule":"bdenv", "rights": "edit", "urlname": "/edit" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, DataTableModule, CalendarModule, NumTextModule],
    declarations: [
        AddOwnershipComp,
        OwnershipComp
    ],
    providers: [AuthGuard]
})

export default class OwnershipModule {
}