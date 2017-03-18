import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { grnoutwordAdd } from './add/add.comp';
import { grnoutwordView } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CalendarModule } from '../../usercontrol/calendar';

import { LazyLoadEvent, DataTableModule, AutoCompleteModule,RadioButtonModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class grnoutwordComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: grnoutwordComp,
        canActivate: [AuthGuard],
        data: { "module": "waresub" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: grnoutwordAdd, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "gro", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: grnoutwordAdd, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "gro", "rights": "add", "urlname": "/edit" } },
                    { path: '', component: grnoutwordView, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "gro", "rights": "add", "urlname": "/grnoutword" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule,
        FormsModule, CommonModule, DataTableModule, CalendarModule,RadioButtonModule,AutoCompleteModule, NumTextModule],
    declarations: [
        grnoutwordAdd,
        grnoutwordView,
        grnoutwordComp
    ],
    providers: [AuthGuard]
})

export default class grnoutwordModule {
}