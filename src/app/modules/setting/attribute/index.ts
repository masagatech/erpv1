import { NgModule, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../../../_service/authguard-service';
import { SharedComponentModule } from '../../../_shared/sharedcomp.module';
import { attrview } from './attview.comp';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    template: '<router-outlet></router-outlet>'
})
export class AttributeComp {
    constructor() {
    }
}

const routerConfig = [
    {
        path: '',
        component: AttributeComp,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                children: [

                    { path: 'attview', component: attrview, canActivateChid: [AuthGuard], },
                    { path: '', component: attrview, canActivateChid: [AuthGuard], },
                ]
            }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routerConfig), FormsModule, CommonModule],
    declarations: [
        attrview,
        AttributeComp
    ],
    providers: [AuthGuard]
})

export default class AttributeModule {
}