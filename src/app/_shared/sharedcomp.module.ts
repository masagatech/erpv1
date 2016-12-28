import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FileUploadComponent } from '../modules/usercontrol/fileupload/fileupload.comp';
import { SubMenuComponent } from '../modules/usercontrol/submenu/submenu.comp';
import { AutoCompleteComponent } from '../modules/usercontrol/autocomplete/autocomplete.comp';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileUploadModule, GrowlModule, DialogModule } from 'primeng/primeng';

@NgModule({
    imports: [RouterModule, FormsModule, CommonModule, FileUploadModule, GrowlModule, DialogModule],
    declarations: [FileUploadComponent, SubMenuComponent, AutoCompleteComponent],
    exports: [FileUploadComponent, SubMenuComponent, AutoCompleteComponent]
})

export class SharedComponentModule { }
