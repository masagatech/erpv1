import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddFY } from './aded/addfy.comp';
import { ViewFY } from './view/viewfy.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/primeng';
import { CalendarModule } from '../../usercontrol/calendar';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class FYComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: FYComp,
        canActivate: [AuthGuard],
        data: { "module": "pset" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddFY, canActivateChid: [AuthGuard],  data: { "module": "pset", "submodule":"fy", "rights": "add", "urlname": "/add" }},
                    { path: 'edit/:id', component: AddFY, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule":"fy", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewFY, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule":"fy", "rights": "view", "urlname": "/fy" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, CheckboxModule, CalendarModule],
    declarations: [
        AddFY,
        ViewFY,
        FYComp
    ],
    providers: [AuthGuard]
})

export default class FYModule {
}