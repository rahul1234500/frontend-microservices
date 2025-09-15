/**
 * Student Dashboard - Common JavaScript Functions
 * Shared functionality across all pages
 */

// Configuration
const CONFIG = {
    studentServiceUrl: 'http://localhost:9002',
    collegeServiceUrl: 'http://localhost:9001',
    timeout: 10000
};

// Utility Functions
const Utils = {
    // Show loading state
    showLoading(element) {
        if (element) {
            element.classList.add('loading');
            element.innerHTML = '<span class="spinner"></span> Loading...';
        }
    },

    // Hide loading state
    hideLoading(element, originalText = '') {
        if (element) {
            element.classList.remove('loading');
            if (originalText) {
                element.innerHTML = originalText;
            }
        }
    },

    // Show message to user
    showMessage(message, type = 'info', duration = 3000) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} fade-in`;
        messageDiv.textContent = message;
        
        // Insert at top of main content
        const main = document.querySelector('main') || document.body;
        main.insertBefore(messageDiv, main.firstChild);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                messageDiv.remove();
            }, duration);
        }
        
        return messageDiv;
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate required fields
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ff416c';
                isValid = false;
            } else {
                field.style.borderColor = '#e1e5e9';
            }
        });
        
        return isValid;
    },

    // Clear form
    clearForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.value = '';
            input.style.borderColor = '#e1e5e9';
        });
    }
};

// API Functions
const API = {
    // Generic fetch with error handling
    async request(url, options = {}) {
        const defaultOptions = {
            timeout: CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    // Student API calls
    student: {
        async save(studentData) {
            return API.request(`${CONFIG.studentServiceUrl}/student/`, {
                method: 'POST',
                body: JSON.stringify(studentData)
            });
        },

        async getAll() {
            return API.request(`${CONFIG.studentServiceUrl}/student/api/all`);
        },

        async getByName(name) {
            return API.request(`${CONFIG.studentServiceUrl}/student/name/${encodeURIComponent(name)}`);
        },

        async getByCollegeId(collegeId) {
            return API.request(`${CONFIG.studentServiceUrl}/student/college/${collegeId}`);
        },

        async delete(id) {
            return API.request(`${CONFIG.studentServiceUrl}/student/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // College API calls
    college: {
        async save(collegeData) {
            return API.request(`${CONFIG.collegeServiceUrl}/college/`, {
                method: 'POST',
                body: JSON.stringify(collegeData)
            });
        }
    }
};

// Student Management Functions
const StudentManager = {
    // Save student via API
    async saveStudent(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        // Validate form
        if (!Utils.validateForm(form)) {
            Utils.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Show loading
        Utils.showLoading(submitBtn);

        try {
            // Get form data
            const studentData = {
                name: form.querySelector('#apiName, [name="name"]')?.value || form.querySelector('input[name*="name"]')?.value,
                address: form.querySelector('#apiAddress, [name="address"]')?.value || form.querySelector('input[name*="address"]')?.value,
                age: form.querySelector('#apiAge, [name="age"]')?.value || form.querySelector('input[name*="age"]')?.value,
                collegeId: form.querySelector('#apiCollegeId, [name="collegeId"]')?.value || form.querySelector('input[name*="collegeId"]')?.value
            };

            // Save student
            const result = await API.student.save(studentData);
            
            Utils.showMessage(`✅ Student "${result.name}" added successfully!`, 'success');
            Utils.clearForm(form);
            
        } catch (error) {
            Utils.showMessage('❌ Error adding student: ' + error.message, 'error');
        } finally {
            Utils.hideLoading(submitBtn, originalBtnText);
        }
    },

    // Delete student
    async deleteStudent(studentId, studentName = '') {
        if (!confirm(`Are you sure you want to delete ${studentName ? `student "${studentName}"` : 'this student'}?`)) {
            return;
        }

        try {
            await API.student.delete(studentId);
            Utils.showMessage('✅ Student deleted successfully!', 'success');
            
            // Reload page or remove from table
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            Utils.showMessage('❌ Error deleting student: ' + error.message, 'error');
        }
    },

    // View student details
    async viewStudent(studentName) {
        try {
            const student = await API.student.getByName(studentName);
            const details = `
                Student Details:
                ID: ${student.id}
                Name: ${student.name}
                Address: ${student.address}
                Age: ${student.age}
                College ID: ${student.collegeId}
            `;
            alert(details);
        } catch (error) {
            Utils.showMessage('❌ Error fetching student details: ' + error.message, 'error');
        }
    },

    // Fetch students by college
    async fetchStudentsByCollege(collegeId, targetTableId = 'studentTable') {
        const table = document.getElementById(targetTableId);
        const tbody = table?.querySelector('tbody');
        
        if (!table || !tbody) {
            Utils.showMessage('❌ Table not found', 'error');
            return;
        }

        // Show loading
        tbody.innerHTML = '<tr><td colspan="5" class="text-center"><span class="spinner"></span> Loading students...</td></tr>';
        table.style.display = 'table';

        try {
            const students = await API.student.getByCollegeId(collegeId);
            
            tbody.innerHTML = '';

            if (students && students.length > 0) {
                students.forEach(item => {
                    const row = `
                        <tr class="fade-in">
                            <td>${item.student.id}</td>
                            <td>${item.student.name}</td>
                            <td>${item.student.address}</td>
                            <td>${item.student.age}</td>
                            <td>${item.student.collegeId}</td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
                Utils.showMessage(`✅ Found ${students.length} student(s)`, 'success');
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No students found for this college</td></tr>';
                Utils.showMessage('⚠️ No students found for this college!', 'warning');
            }
            
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading students</td></tr>';
            Utils.showMessage('❌ Error fetching students: ' + error.message, 'error');
        }
    }
};

// College Management Functions
const CollegeManager = {
    // Save college via API
    async saveCollege(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        // Validate form
        if (!Utils.validateForm(form)) {
            Utils.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Show loading
        Utils.showLoading(submitBtn);

        try {
            // Get form data
            const collegeData = {
                collegeName: form.querySelector('#collegeName')?.value,
                address: form.querySelector('#address')?.value,
                university: form.querySelector('#university')?.value
            };

            // Save college
            const result = await API.college.save(collegeData);
            
            Utils.showMessage(`✅ College "${result.collegeName}" added successfully!`, 'success');
            Utils.clearForm(form);
            
        } catch (error) {
            Utils.showMessage('❌ Error adding college: ' + error.message, 'error');
        } finally {
            Utils.hideLoading(submitBtn, originalBtnText);
        }
    }
};

// UI Helper Functions
const UI = {
    // Toggle element visibility
    toggle(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    },

    // Show element
    show(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
            element.classList.add('fade-in');
        }
    },

    // Hide element
    hide(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    },

    // Scroll to top
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Refresh page data
    refreshData() {
        window.location.reload();
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            Utils.showMessage('✅ Copied to clipboard!', 'success');
        } catch (error) {
            Utils.showMessage('❌ Failed to copy to clipboard', 'error');
        }
    }
};

// Global Functions (for backward compatibility and inline onclick handlers)
window.showApiForm = function() {
    UI.show('apiForm');
};

window.fetchStudents = function() {
    const collegeId = document.getElementById('collegeId')?.value;
    if (!collegeId) {
        Utils.showMessage('Please enter a college ID', 'warning');
        return;
    }
    window.location.href = `/student/byCollege/${collegeId}`;
};

window.fetchStudentsApi = function() {
    const collegeId = document.getElementById('collegeId')?.value;
    if (!collegeId) {
        Utils.showMessage('Please enter a college ID', 'warning');
        return;
    }
    StudentManager.fetchStudentsByCollege(collegeId);
};

window.deleteStudent = function(studentId) {
    StudentManager.deleteStudent(studentId);
};

window.viewStudent = function(studentName) {
    StudentManager.viewStudent(studentName);
};

window.refreshData = function() {
    UI.refreshData();
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Student Dashboard initialized');
    
    // Add fade-in animation to main content
    const main = document.querySelector('main');
    if (main) {
        main.classList.add('fade-in');
    }
    
    // Set up form event listeners
    const studentApiForm = document.getElementById('apiStudentForm');
    if (studentApiForm) {
        studentApiForm.addEventListener('submit', StudentManager.saveStudent);
    }
    
    const collegeForm = document.getElementById('collegeForm');
    if (collegeForm) {
        collegeForm.addEventListener('submit', CollegeManager.saveCollege);
    }
    
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + R to refresh data
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            UI.refreshData();
        }
        
        // Escape to close any open modals or forms
        if (e.key === 'Escape') {
            const apiForm = document.getElementById('apiForm');
            if (apiForm && apiForm.style.display !== 'none') {
                UI.hide('apiForm');
            }
        }
    });
    
    // Auto-hide messages after 5 seconds
    setTimeout(() => {
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            if (!message.querySelector('.spinner')) {
                message.style.opacity = '0';
                setTimeout(() => message.remove(), 300);
            }
        });
    }, 5000);
});

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        API,
        StudentManager,
        CollegeManager,
        UI,
        CONFIG
    };
}
