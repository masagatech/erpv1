import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddJV } from './aded/addjv.comp';
import { ViewJV } from './view/viewjv.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataListModule, FileUploadModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class JVComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: JVComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddJV, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: AddJV, canActivateChid: [AuthGuard], },
                    { path: '', component: ViewJV, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, DataListModule, FileUploadModule],
    declarations: [
        AddJV,
        ViewJV,
        JVComp
    ],
    providers: [AuthGuard]
})

export default class JVModule {
}