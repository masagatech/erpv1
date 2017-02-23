import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';

import { acadd } from './add/add.comp';                
import { acview } from './view/view.comp';             

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class AcGrouptComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: AcGrouptComp,
        canActivate: [AuthGuard],
        data: { "module": "coa" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: acadd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "ag", "rights": "add", "urlname": "/add" } },
                    { path: 'edit/:id', component: acadd, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "ag", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: acview, canActivateChid: [AuthGuard], data: { "module": "coa", "submodule": "ag", "rights": "view", "urlname": "/acgroup" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), SharedComponentModule, FormsModule, CommonModule, CheckboxModule],
    declarations: [
        acadd,
        acview,
        AcGrouptComp
    ],
    providers: [AuthGuard]
})

export default class AcGrouptModule {
}