import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { grnInwordAdd } from './add/add.comp';
import { grnInwordView } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LazyLoadEvent, DataTableModule, AutoCompleteModule, RadioButtonModule } from 'primeng/primeng';
import { NumTextModule } from '../../usercontrol/numtext';

import { _currencyPipe } from '../../../_pipe/currency.pipe';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class grninwordComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: grninwordComp,
        canActivate: [AuthGuard],
        data: { "module": "waresub" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: grnInwordAdd, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "gri", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: grnInwordAdd, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "gri", "rights": "add", "urlname": "/edit" } },
                    { path: '', component: grnInwordView, canActivateChid: [AuthGuard], data: { "module": "waresub", "submodule": "gri", "rights": "add", "urlname": "/grninword" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule,
        FormsModule, CommonModule, DataTableModule, RadioButtonModule, AutoCompleteModule, NumTextModule],
    declarations: [
        grnInwordAdd,
        grnInwordView,
        grninwordComp,
        _currencyPipe
    ],
    providers: [AuthGuard],
    
})

export default class grninwordModule {
}