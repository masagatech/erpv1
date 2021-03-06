import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddPDC } from './aded/addpdc.comp';
import { ViewPDC } from './view/viewpdc.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataListModule, AutoCompleteModule, DataTableModule, CheckboxModule, ScheduleModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class PDCComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: PDCComp,
        canActivate: [AuthGuard],
        data: { "module": "accs" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddPDC, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "pdc", "rights": "add", "urlname": "/add" } },
                    { path: 'details/:id', component: AddPDC, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "pdc", "rights": "edit", "urlname": "/edit" } },
                    { path: 'edit/:id', component: AddPDC, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "pdc", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewPDC, canActivateChid: [AuthGuard], data: { "module": "accs", "submodule": "pdc", "rights": "view", "urlname": "/pdc" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataListModule, AutoCompleteModule, DataTableModule, CheckboxModule, ScheduleModule, CalendarModule, NumTextModule],
    declarations: [
        AddPDC,
        ViewPDC,
        PDCComp
    ],
    providers: [AuthGuard]
})

export default class pdcModule {
}