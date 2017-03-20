import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { acladd } from './add/add.comp';                
import { aclview } from './view/view.comp';             

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent,DataTableModule,CheckboxModule,AutoCompleteModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class AcLedgerComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: AcLedgerComp,
        canActivate: [AuthGuard],
        data: { "module": "coa" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: acladd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "al", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: acladd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "al", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: aclview, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "al", "rights": "view", "urlname": "/acledger" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule,
     FormsModule, CommonModule, CheckboxModule,DataTableModule,AutoCompleteModule],
    declarations: [
        acladd,
        aclview,
        AcLedgerComp
    ],
    providers: [AuthGuard]
})

export default class AcLedgerModule {
}