import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddPDC } from './aded/addpdc.comp';
import { ViewPDC } from './view/viewpdc.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataListModule, FileUploadModule, CalendarModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class PDCComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: PDCComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddPDC, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: AddPDC, canActivateChid: [AuthGuard], },
                    { path: '', component: ViewPDC, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule,
        DataListModule, FileUploadModule, CalendarModule],
    declarations: [
        AddPDC,
        ViewPDC,
        PDCComp
    ],
    providers: [AuthGuard]
})

export default class pdcModule {
}