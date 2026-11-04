import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CreateEmployeeModalComponent],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {

  // -------------------------------------------------------
  // Data arrays
  // -------------------------------------------------------
  employees: Employee[] = [];
  departments: Department[] = [];
  teams: Team[] = [];
  designations: Designation[] = [];

  // -------------------------------------------------------
  // UI state
  // -------------------------------------------------------
  loading = false;
  errorMessage = '';
  searchText = '';

  selectedDepartmentId: number | null = null;
  selectedTeamId: number | null = null;
  selectedDesignationId: number | null = null;
  selectedStatus: string | null = null;

  isCreateEmployeeModalOpen = false;

  // -------------------------------------------------------
  // Constructor
  // -------------------------------------------------------
  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  // -------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------
  ngOnInit(): void {
    this.loadDepartments();
    this.loadTeams();
    this.loadDesignations();
    this.searchEmployees();
  }

  // -------------------------------------------------------
  // Load filter dropdowns
  // -------------------------------------------------------

  loadDepartments(): void {
    this.dashboardService.getDepartments().subscribe({
      next: (response) => {
        this.departments = response;
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error('Failed to load departments:', err);
        this.errorMessage = 'Unable to load departments.';
        this.cdr.markForCheck();
      }
    });
  }

  loadTeams(): void {
    this.dashboardService.getTeams().subscribe({
      next: (response) => {
        this.teams = response.filter(team => team.isActive);
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error('Failed to load teams:', err);
        this.teams = [];
        this.cdr.markForCheck();
      }
    });
  }

  loadTeamsByDepartment(departmentId: number): void {
    this.teams = [];
    this.dashboardService.getTeamsByDepartment(departmentId).subscribe({
      next: (response) => {
        this.teams = response.filter(team => team.isActive);
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error('Failed to load department teams:', err);
        this.teams = [];
        this.cdr.markForCheck();
      }
    });
  }

  loadDesignations(): void {
    this.dashboardService.getDesignations().subscribe({
      next: (response) => {
        this.designations = response.filter(d => d.isActive);
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error('Failed to load designations:', err);
        this.errorMessage = 'Unable to load designations.';
        this.cdr.markForCheck();
      }
    });
  }

  // -------------------------------------------------------
  // Filter handlers
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // Main search / fetch
  // -------------------------------------------------------

  searchEmployees(): void {
    this.loading = true;
    this.errorMessage = '';

    const request: EmployeeSearchRequest = {
      page: 1,
      pageSize: 50,
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
      error: (err: unknown) => {
        console.error('Failed to search employees:', err);
        this.errorMessage = 'Unable to load employees.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // -------------------------------------------------------
  // Modal handlers
  // -------------------------------------------------------

  openCreateModal(): void {
    this.isCreateEmployeeModalOpen = true;
    this.cdr.markForCheck();
  }

  onEmployeeCreated(): void {
    this.isCreateEmployeeModalOpen = false;
    this.searchEmployees();
  }

  onModalClose(): void {
    this.isCreateEmployeeModalOpen = false;
    this.cdr.markForCheck();
  }

  // -------------------------------------------------------
  // Action: View Employee
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // Action: Edit Employee (placeholder — modal coming soon)
  // -------------------------------------------------------

  onEdit(employee: Employee): void {
    alert(`Edit feature for ${employee.name} (ID: ${employee.id}) — coming soon!`);
  }

  // -------------------------------------------------------
  // Action: Toggle Active / Inactive status
  // -------------------------------------------------------

  toggleStatus(employee: Employee): void {
    const newStatus = !employee.isActive;
    const label = newStatus ? 'activate' : 'deactivate';

    const confirmed = confirm(
      `Are you sure you want to ${label} ${employee.name}?`
    );
    if (!confirmed) return;

    this.dashboardService.updateEmployeeStatus(employee.id, newStatus).subscribe({
      next: () => {
        employee.isActive = newStatus;
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error('Failed to update employee status:', err);
        alert('Failed to update employee status. Please try again.');
      }
    });
  }

  // -------------------------------------------------------
  // Action: Delete Employee
  // -------------------------------------------------------

  onDelete(employee: Employee): void {
    const confirmed = confirm(
      `Are you sure you want to permanently delete ${employee.name}?\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    this.dashboardService.deleteEmployee(employee.id).subscribe({
      next: () => {
        // Remove from local list immediately (no reload needed)
        this.employees = this.employees.filter(e => e.id !== employee.id);
        this.cdr.markForCheck();
        alert(`${employee.name} has been deleted successfully.`);
      },
      error: (err: unknown) => {
        console.error('Failed to delete employee:', err);
        alert('Failed to delete employee. The employee may not exist or you may not have permission.');
      }
    });
  }
}
