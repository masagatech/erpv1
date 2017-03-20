import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { salesordadd } from './add/add.comp';
import { salesOrdView } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CalendarModule } from '../../usercontrol/calendar';

import { LazyLoadEvent, DataTableModule, AutoCompleteModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class SalesOrdComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: SalesOrdComp,
        canActivate: [AuthGuard],
        data: { "module": "dcm" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: salesordadd, canActivateChid: [AuthGuard], data: { "module": "dcm", "submodule": "sords", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: salesordadd, canActivateChid: [AuthGuard], data: { "module": "dcm", "submodule": "sords", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: salesOrdView, canActivateChid: [AuthGuard], data: { "module": "dcm", "submodule": "sords", "rights": "view", "urlname": "salesordsample" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule,
        CommonModule, CalendarModule, DataTableModule, AutoCompleteModule, NumTextModule],
    declarations: [
        salesordadd,
        salesOrdView,
        SalesOrdComp
    ],
    providers: [AuthGuard]
})

export default class SalesOrdModule {
}