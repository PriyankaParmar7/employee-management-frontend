
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  DashboardService,
  Employee,
  EmployeeSearchRequest
} from '../dashboard/dashboard.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {

  employees: Employee[] = [];
  loading = false;
  errorMessage = '';
  searchText = '';
  selectedDepartmentId: number | null = null;
  selectedTeamId: number | null = null;
  selectedDesignationId: number | null = null;
  selectedStatus: string | null = null;


  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    const request: EmployeeSearchRequest = {
      page: 1,
      pageSize: 10,
      search: '',
      status: null,
      departmentId: null,
      teamId: null,
      designationId: null,
      supervisorId: null,
      sortBy: 'name',
      sortDescending: false
    };

    this.dashboardService.searchEmployees(request).subscribe({
      next: (response) => {
        console.log('API response:', response);

        this.employees = response.employees;
        this.loading = false;
        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('Failed to load employees:', error);
        this.errorMessage = 'Unable to load employees.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  searchEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    const request: EmployeeSearchRequest = {
      page: 1,
      pageSize: 10,
      search: this.searchText.trim().toLowerCase(),
      status: null,
      departmentId: null,
      teamId: null,
      designationId: null,
      supervisorId: null,
      sortBy: 'name',
      sortDescending: false
    };

    this.dashboardService.searchEmployees(request).subscribe({
      next: (response) => {
        this.employees = response.employees;
        this.loading = false;
        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('Failed to search employees:', error);
        this.errorMessage = 'Unable to search employees.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
