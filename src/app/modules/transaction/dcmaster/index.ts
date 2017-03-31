import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { dcADDEdit } from './add/aded.comp';
import { dcview } from './view/adedview.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CalendarModule } from '../../usercontrol/calendar';

import { LazyLoadEvent, DataTableModule, AutoCompleteModule,ChipsModule,DialogModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class dcMasterComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: dcMasterComp,
        canActivate: [AuthGuard],
        data: { "module": "dcm" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: dcADDEdit, canActivateChid: [AuthGuard], data: { "module": "dcm", "submodule": "so", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: dcADDEdit, canActivateChid: [AuthGuard], data: { "module": "dcm", "submodule": "so", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: dcview, canActivateChid: [AuthGuard], data: { "module": "dcm", "submodule": "so", "rights": "view", "urlname": "dcmaster" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule,
        CommonModule, CalendarModule, DataTableModule, AutoCompleteModule, NumTextModule,ChipsModule,DialogModule],
    declarations: [
        dcADDEdit,
        dcview,
        dcMasterComp
    ],
    providers: [AuthGuard]
})

export default class CustomerModule {
}