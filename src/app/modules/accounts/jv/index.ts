import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddJV } from './aded/addjv.comp';
import { ViewJV } from './view/viewjv.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, DataListModule, CheckboxModule, AutoCompleteModule, DialogModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';
import { AuditLogModule } from '../../usercontrol/auditlog';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class JVComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: JVComp,
        canActivate: [AuthGuard],
        data: { "module": "accs" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddJV, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "jv", "rights": "add", "urlname": "/add" } },
                    { path: 'details/:id', component: AddJV, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "jv", "rights": "edit", "urlname": "/edit" } },
                    { path: 'edit/:id', component: AddJV, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "jv", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewJV, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "jv", "rights": "view", "urlname": "/jv" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataTableModule, DataListModule, AutoCompleteModule, DialogModule, CheckboxModule, CalendarModule,
        NumTextModule, AuditLogModule],
    declarations: [
        AddJV,
        ViewJV,
        JVComp
    ],
    providers: [AuthGuard]
})

export default class JVModule {
}