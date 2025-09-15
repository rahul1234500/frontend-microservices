package com.StudentDashbroad.StudentInfo.controller;

import com.StudentDashbroad.StudentInfo.DTO.ReponseTemplateValueObject;
import com.StudentDashbroad.StudentInfo.model.Student;
import com.StudentDashbroad.StudentInfo.service.StudentServices;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/student")
public class StudentController {
    @Autowired
    private StudentServices studentServices;

    // Index page :
    @GetMapping("/")
    public String homePage() {
        return "index";  // index.html
    }
    // save insert data -> /add
    // frontend controller
    @GetMapping("/add")
    public String addStudentForm(Model model) {
        model.addAttribute("student", new Student());
        return "student";  // student.html
    }
    // backend code - save student (API endpoint)
    @PostMapping("/")
    public ResponseEntity<Student> saveStudent(@RequestBody Student students){
        return ResponseEntity.ok(studentServices.saveStudent(students));
    }
    
    // Handle form submission from frontend
    @PostMapping("/save")
    public String saveStudentForm(@ModelAttribute Student student, Model model) {
        studentServices.saveStudent(student);
        model.addAttribute("message", "Student saved successfully!");
        return "student"; // Return to student form with success message
    }

    // get student by Name
    @GetMapping("/name/{name}")
    public ResponseEntity<Student> getStudentByName(@PathVariable("name") String name){
        Student student = studentServices.getStudentByName(name);
        if(student!= null){
            return  ResponseEntity.ok(student);
        } else{
            return  ResponseEntity.notFound().build();
        }
    }
    // get All Student (API endpoint)
    @GetMapping("/api/all")
    public ResponseEntity<List<Student>> getAllStudents(){
        return ResponseEntity.ok(studentServices.getAllStudents());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id){
        studentServices.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/update/{name}")
    public ResponseEntity<Student> updateStudentByName(@PathVariable String name ){
//        return ResponseEntity.ok(studentServices.updateStudentByName(name));
        Student student = studentServices.updateStudentByName(name);
        if(student!= null){
            System.out.println("Student Record Updated with name :" + name );
            return  ResponseEntity.ok(student);
        } else{
            System.out.println("Student Record Not Found");
            return  ResponseEntity.notFound().build();
        }

    }

    // Get All Students by College Id
    @GetMapping("/std/{collegeId}")
    public ResponseEntity<List<ReponseTemplateValueObject>> getStudentsByCollegeId(@PathVariable String collegeId) {
        List<ReponseTemplateValueObject> result = studentServices.getStudentsByCollegeId(collegeId);
        if (result.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }
    
    // Frontend endpoint for students by college
    @GetMapping("/college/{collegeId}")
    public ResponseEntity<List<ReponseTemplateValueObject>> getStudentsByCollegeIdFrontend(@PathVariable String collegeId) {
        List<ReponseTemplateValueObject> result = studentServices.getStudentsByCollegeId(collegeId);
        if (result.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }
    
    // Frontend page for students by college
    @GetMapping("/byCollege/{collegeId}")
    public String getStudentsByCollegePage(@PathVariable String collegeId, Model model) {
        List<ReponseTemplateValueObject> result = studentServices.getStudentsByCollegeId(collegeId);
        model.addAttribute("students", result);
        model.addAttribute("collegeId", collegeId);
        return "studentByCollege";
    }
    
    // Frontend page to view all students
    @GetMapping("/all")
    public String getAllStudentsPage(Model model) {
        List<Student> students = studentServices.getAllStudents();
        model.addAttribute("students", students);
        return "allStudents";
    }
    
    // Alternative endpoint for students by college when college service is not available
    @GetMapping("/byCollegeOnly/{collegeId}")
    public String getStudentsByCollegeIdOnly(@PathVariable String collegeId, Model model) {
        List<Student> students = studentServices.getStudentsByCollegeIdOnly(collegeId);
        model.addAttribute("students", students);
        model.addAttribute("collegeId", collegeId);
        model.addAttribute("collegeServiceAvailable", false);
        return "studentByCollege";
    }
    
    // College form endpoint (when college service is not available)
    @GetMapping("/college/add")
    public String addCollegeForm() {
        return "college";
    }
}
