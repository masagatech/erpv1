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
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddMOM, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: AddMOM, canActivateChid: [AuthGuard], },
                    { path: '', component: ViewMOM, canActivateChid: [AuthGuard], },
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