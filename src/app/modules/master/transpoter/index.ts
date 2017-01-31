import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { transadd } from './add/add.comp';
import { transview } from './view/view.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LazyLoadEvent, DataTableModule, CheckboxModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class TranspoterComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: TranspoterComp,
        canActivate: [AuthGuard],
        data: { "module": "coa" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: transadd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "tm", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: transadd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "tm", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: transview, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "tm", "rights": "view", "urlname": "/transpoter" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule, DataTableModule, CheckboxModule],
    declarations: [
        transadd,
        transview,
        TranspoterComp
    ],
    providers: [AuthGuard]
})

export default class TranspoterModule {
}