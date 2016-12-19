import { NgModule, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { AddDebitNote } from './aded/adddebitnote.comp';
import { ViewDebitNote } from './view/viewdebitnote.comp';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { ActionBarModule } from '../../../_shared/shared.module'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataListModule, FileUploadModule } from 'primeng/primeng';

@Component({
    template: '<router-outlet></router-outlet>'
})

export class DebitNoteComp implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}

const routerConfig = [
    {
        path: '',
        component: DebitNoteComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [
                    { path: 'add', component: AddDebitNote, canActivateChid: [AuthGuard], },
                    { path: 'edit/:id', component: AddDebitNote, canActivateChid: [AuthGuard], },
                    { path: '', component: ViewDebitNote, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), CommonModule, FormsModule, SharedComponentModule, DataListModule, FileUploadModule],
    declarations: [
        AddDebitNote,
        ViewDebitNote,
        DebitNoteComp
    ],
    providers: [AuthGuard]
})

export default class DebitNoteModule {
}