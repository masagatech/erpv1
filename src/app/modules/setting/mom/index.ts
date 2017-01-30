import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddMOM } from './aded/addmom.comp';
import { ViewMOM } from './view/viewmom.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'
import { GroupByPipe } from '../../../_pipe/groupby.pipe';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/primeng';

import { LazyLoadEvent, DataTableModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class MOMComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: MOMComp,
        canActivate: [AuthGuard],
        data: { "module": "pset" },
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddMOM, canActivateChid: [AuthGuard],  data: { "module": "pset", "submodule":"mom", "rights": "add", "urlname": "/add" }},
                    { path: 'edit/:id', component: AddMOM, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule":"mom", "rights": "edit", "urlname": "/edit" } },
                    { path: '', component: ViewMOM, canActivateChid: [AuthGuard], data: { "module": "pset", "submodule":"mom", "rights": "view", "urlname": "/masterofmaster" } },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, DataTableModule, FileUploadModule],
    declarations: [
        AddMOM,
        ViewMOM,
        MOMComp,
        GroupByPipe
    ],
    providers: [AuthGuard]
})

export default class MOMModule {
}