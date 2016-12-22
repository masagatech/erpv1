import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DocRepoComp } from '../docrepo/docrepo.comp';
import { AuthGuard } from '../../_service/authguard-service';
import { DRDashboardComp } from '../docrepo/dashboard/dashboard.comp';
import { AddDR } from '../docrepo/aded/adddr.comp';
import { ViewDR } from '../docrepo/view/viewdr.comp';
import { ActionBarModule } from '../../_shared/shared.module';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedComponentModule } from '../../_shared/sharedcomp.module';
import { DataListModule, DataGridModule, PanelModule } from 'primeng/primeng';

const routerConfig = [
    {
        path: '',
        component: DocRepoComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'view', component: ViewDR, canActivateChid: [AuthGuard], },
                    { path: 'add', component: AddDR, canActivateChid: [AuthGuard], },
                    { path: 'edit/:uid', component: AddDR, canActivateChid: [AuthGuard], },
                    { path: '', component: DRDashboardComp, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule,
        SharedComponentModule, DataListModule, DataGridModule, PanelModule],
    declarations: [
        ViewDR,
        AddDR,
        DRDashboardComp,
        DocRepoComp
    ],
    providers: [AuthGuard]
})

export default class DRModule {
}