import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  DashboardService,
  Employee,
  EmployeeSearchRequest,
  Department,
  Team,
  Designation
} from '../dashboard/dashboard.service';
import { CreateEmployeeModalComponent } from './create-employee-modal/create-employee-modal';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateEmployeeModalComponent],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {

  employees: Employee[] = [];
  departments: Department[] = [];
  teams: Team[] = [];
  designations: Designation[] = [];

  loading = false;
  errorMessage = '';
  searchText = '';

  selectedDepartmentId: number | null = null;
  selectedTeamId: number | null = null;
  selectedDesignationId: number | null = null;
  selectedStatus: string | null = null;

  isCreateEmployeeModalOpen = false;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadTeams();
    this.searchEmployees();
    this.loadDesignations();
  }

  // Load department options
  loadDepartments(): void {
    this.dashboardService.getDepartments().subscribe({
      next: (response) => {
        this.departments = response;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load departments:', error);
        this.errorMessage = 'Unable to load departments.';
        this.cdr.markForCheck();
      }
    });
  }

  // Load all active teams
  loadTeams(): void {
    this.dashboardService.getTeams().subscribe({
      next: (response) => {
        this.teams = response.filter(team => team.isActive);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load teams:', error);
        this.teams = [];
        this.cdr.markForCheck();
      }
    });
  }

  // Load teams belonging to a selected department
  loadTeamsByDepartment(departmentId: number): void {
    this.teams = [];

    this.dashboardService.getTeamsByDepartment(departmentId).subscribe({
      next: (response) => {
        this.teams = response.filter(team => team.isActive);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load department teams:', error);
        this.teams = [];
        this.cdr.markForCheck();
      }
    });
  }

  // Handle department selection
  onDepartmentChange(departmentId: number | null): void {
    this.selectedDepartmentId = departmentId;
    this.selectedTeamId = null;

    if (departmentId !== null) {
      this.loadTeamsByDepartment(departmentId);
    } else {
      this.loadTeams();
    }

    this.searchEmployees();
  }

  loadEmployees(): void {
    this.searchEmployees();
  }

  loadDesignations(): void {
    this.dashboardService.getDesignations().subscribe({
      next: (response) => {
        this.designations = response.filter(
          designation => designation.isActive
        );
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load designations:', error);
        this.errorMessage = 'Unable to load designations.';
        this.cdr.markForCheck();
      }
    });
  }

  // Search using all selected criteria
  searchEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    const request: EmployeeSearchRequest = {
      page: 1,
      pageSize: 10,
      search: this.searchText.trim(),
      status: this.selectedStatus,
      departmentId: this.selectedDepartmentId,
      teamId: this.selectedTeamId,
      designationId: this.selectedDesignationId,
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

  // Modal open / close handlers
  onEmployeeCreated(): void {
    this.isCreateEmployeeModalOpen = false;
    this.searchEmployees();
  }

  // Action 1: View Employee Details
  onView(employee: Employee): void {
    alert(
      `Employee Details:\n` +
      `Name: ${employee.name}\n` +
      `Email: ${employee.email}\n` +
      `Department: ${employee.department || 'N/A'}\n` +
      `Team: ${employee.team || 'N/A'}\n` +
      `Designation: ${employee.designation || 'N/A'}\n` +
      `Supervisor: ${employee.supervisor || 'None'}\n` +
      `Status: ${employee.isActive ? 'Active' : 'Inactive'}`
    );
  }

  // Action 2: Edit Employee
  onEdit(employee: Employee): void {
    alert(`Edit feature for ${employee.name} (ID: ${employee.id}) will be opened!`);
  }

  // Action 3: Toggle Status (Active <-> Inactive)
  toggleStatus(employee: Employee): void {
    const newStatus = !employee.isActive;

    this.dashboardService.updateEmployeeStatus(employee.id, newStatus).subscribe({
      next: () => {
        employee.isActive = newStatus;
        this.cdr.markForCheck();
      },
      error: (error : unknown) => {
        console.error('Failed to update employee status:', error);
        alert('Failed to update employee status.');
      }
    });
  }

  // Action 4: Delete Employee
  onDelete(employee: Employee): void {
    const confirmed = confirm(`Are you sure you want to delete ${employee.name}?`);
    if (!confirmed) return;

    this.dashboardService.deleteEmployee(employee.id).subscribe({
      next: () => {
        this.employees = this.employees.filter(e => e.id !== employee.id);
        this.cdr.markForCheck();
      },
      error: (error : unknown) => {
        console.error('Failed to delete employee:', error);
        alert('Failed to delete employee.');
      }
    });
  }
}