import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddCompany } from './aded/addcompany.comp';
import { ViewCompany } from './view/viewcompany.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataListModule, FileUploadModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class CompanyComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: CompanyComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddCompany, canActivateChid: [AuthGuard], },
                    { path: 'edit/:cmpid', component: AddCompany, canActivateChid: [AuthGuard], },
                    { path: '', component: ViewCompany, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, DataListModule, FileUploadModule],
    declarations: [
        AddCompany,
        ViewCompany,
        CompanyComp
    ],
    providers: [AuthGuard]
})

export default class CompanyModule {
}