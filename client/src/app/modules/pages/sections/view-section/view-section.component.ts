import { Component } from '@angular/core';
import { Section } from '@dynrec/common';
import { LoadedArg } from '../../../../decorators/input.decorator';
import { SectionService } from '../../../../services/section.service';

@Component({
    selector: 'app-view-section',
    templateUrl: './view-section.component.html',
    styleUrls: ['./view-section.component.scss'],
})
export class ViewSectionComponent {
    @LoadedArg(SectionService, Section, 'sectionID')
    section: Section;
}
