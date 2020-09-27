import { Component, OnInit, Input, ViewEncapsulation, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { debounceTime } from 'rxjs/operators';
import { get } from 'lodash';

import { StandardResponseInterface } from '@interfaces/http/standardResponse.interface';
import { HttpFilterInterface } from '@http/httpFilter.interface';
import { ProblemDifficulty } from '@enums/problemDifficulty.enum';
import { TemplatePortalDirective } from '@angular/cdk/portal';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DatatableComponent implements OnInit {
  @ViewChild('difficultyCellTemplate', { static: true }) difficultyCellTemplate: TemplateRef<any>;
  @ViewChild('userCellTemplate', { static: true }) userCellTemplate: TemplateRef<any>;
  @ViewChild('actionsCellTemplate', { static: true }) actionsCellTemplate: TemplateRef<any>;

  @Input() dataFunction: ((args: HttpFilterInterface) => StandardResponseInterface<any>);
  @Input() reload: Subject<any> = new Subject<any>();
  @Input() columns: any[] = [];

  @Input() pageSize: number = 25;

  @Input() enableSearching: boolean = true;
  @Input() enableExporting: boolean = true;

  // an object where each key is a template, and its value is a function
  // these functions are used to signify what happens when a CSV is created with the template
  // these will override the defaults provided by the datatable, or create new ones if there isn't one.
  @Input() csvTemplateOverrides: any = {};
  @Input() csvFileName: Function = undefined;

  rows: any[] = [];
  reorderable: boolean = true;
  numResults: number = 0;
  offset: number = 0;

  sortDirection: string = 'desc';
  sort: string = undefined;

  search: string = undefined;
  searchDebouncer: EventEmitter<string> = new EventEmitter<string>();

  ColumnMode = ColumnMode;
  ProblemDifficulty = ProblemDifficulty;

  constructor() {}

  ngAfterViewInit() {
    this.updateColumnDefs();
  }

  ngOnInit() {
    this.reload.subscribe({
      next: () => {
        this.loadData();
      }
    });

    this.searchDebouncer
    .pipe(debounceTime(200)) // Debounce the inputs so we don't constantly hit the API if the user is still typing
    .subscribe(() => {
      this.loadData();
    })

    this.loadData();
  }

  // Returns all of the templates in our system, arranged by key.
  // Each object contains a template identifying the viewchild template to render,
  // as well as possibly other values, like a csv function to use when generating a csv
  getTemplates() {
    return {
      'difficultyCell': {
        template: this.difficultyCellTemplate,
        csv: (difficulty) => difficulty,
      },
      'userCell': {
        template: this.userCellTemplate,
        csv: (user) => user ? `${user.firstName} ${user.lastName} (${user.username})` : undefined,
      },
      'actionsCell': {
        template: this.actionsCellTemplate,
      }
    };
  }

  // Returns a list of CSV formats, potentially modified 
  getCSVFormats() {
    // We build a list of template keys => their CSV function, if available
    let allFormats = {};

    const allTemplates = this.getTemplates();
    Object.keys(allTemplates).forEach((templateKey) => {
      allFormats[templateKey] = allTemplates[templateKey].csv;
    })

    // Now we go through the overrides provided and redefine (or define) any key => functions.
    if(this.csvTemplateOverrides) {
      Object.keys(this.csvTemplateOverrides).forEach((templateKey) => {
        allFormats[templateKey] = this.csvTemplateOverrides[templateKey];
      })
    }

    return allFormats;
  }

  // Generates and downloads a CSV for the datatable
  async handleCSVExport() {
    const csvStringWrap = (str) => {
      const escapedStr = `${str}`.replace(/"/g, '""');
      return `"${escapedStr}"`;
    }

    // We first must generate a listing of all rows in the system + their respective column displays
    const excludedTemplates = ['actionsCell'];

    const csvFormats = this.getCSVFormats();

    // Remove any columns from our mapping in which the cell template should never be printed to CSV
    // the most obvious case here is the actions cell, which should really never be printed.
    const includedColumns = this.columns.filter(({ cellTemplateName }) => !excludedTemplates.includes(cellTemplateName));

    // Now we fetch _every_ row, as the CSV should not just show the local table, but rather all data.
    const allData = await this.dataFunction({
      limit: -1,
    });

    const headers = includedColumns.map(({ name }) => csvStringWrap(name)).join(',');

    const csvRows = allData.data.map((row) => {
      const rowCells = includedColumns.map(({ cellTemplateName, prop }) => {
        const value = get(row, prop);

        console.log(csvFormats[cellTemplateName]);

        return csvFormats[cellTemplateName] ? csvFormats[cellTemplateName](value, row) : value;
      })

      // Join all cells within the row w/ a comma, as they're already escaped
      return rowCells.join(',');
    })

    const csv = [headers, ...csvRows].join('\r\n');
    this.downloadFile(csv);
  }

  // Adapted from https://stackoverflow.com/questions/51806464/how-to-create-and-download-text-json-file-with-dynamic-content-using-angular-2
  downloadFile(contents) {
    const element = document.createElement('a');
    const fileType = 'text/csv';
    const fileName = this.csvFileName ? this.csvFileName() : `csv_export.csv`;

    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(contents)}`);
    element.setAttribute('download', fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

  handleSort(sort) {
    const sorts = sort ? sort.sorts : undefined;
    if(!sorts || !sorts.length) return;

    this.sort = sorts[0].prop;
    this.sortDirection = sorts[0].dir;

    this.loadData();
  }

  handleSearchTextUpdated(text) {
    this.searchDebouncer.next(this.search);
  }

  handlePageChange(page) {
    this.offset = page.offset;
    this.loadData();
  }

  updateColumnDefs() {
    if(!this.columns) return;
  
    const allTemplates = this.getTemplates();

    this.columns.forEach((column) => {
      // Sets cell template to the defined one in our map if it is in the map, or uses the already set one otherwise.
      if(!column.cellTemplateName) column.cellTemplateName = column.cellTemplate;
      column.cellTemplate = get(allTemplates[column.cellTemplate], 'template') || column.cellTemplate;
    })
  }

  async loadData() {
    // First, we update columns to have correct data
    this.updateColumnDefs();

    const { data, metadata } = await this.dataFunction({
      limit: this.pageSize,
      offset: this.offset,
      sort: this.sort,
      sortDirection: this.sortDirection,
      search: this.search,
    });
    
    console.log({ data, metadata })

    this.rows = data;
    this.numResults = metadata.total || 0;
  }

}