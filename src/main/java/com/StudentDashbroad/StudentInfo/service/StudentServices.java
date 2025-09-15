package com.StudentDashbroad.StudentInfo.service;

import com.StudentDashbroad.StudentInfo.DTO.College;
import com.StudentDashbroad.StudentInfo.model.Student;
import com.StudentDashbroad.StudentInfo.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import com.StudentDashbroad.StudentInfo.DTO.ReponseTemplateValueObject;

import java.util.ArrayList;
import java.util.List;


@Service
public class StudentServices {
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private RestTemplate restTemplate;
    // Save student
    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }


    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public void deleteStudent(String id) {
        studentRepository.deleteById(id);
    }

    public Student getStudentByName(String name) {
        return studentRepository.findByName(name);
    }

    public Student updateStudentByName(String name) {
        return  studentRepository.findByName(name);
    }

    //     college services :
    //     1 . ✔️get Student by College Id this data came from college service database
    //     2 . get add college
    //     3 . get find by college by college id

public List<ReponseTemplateValueObject> getStudentsByCollegeId(String collegeId) {
    // MongoDB se sab students lo
    List<Student> students = studentRepository.getStudentByCollegeId(collegeId);
    // Har student ke liye college fetch karo
    List<ReponseTemplateValueObject> responseList = new ArrayList<>();
    
    for (Student student : students) {
        College college = null;
        try {
            // Try to fetch college information from college service
            college = restTemplate.getForObject(
                    "http://localhost:9001/college/" + student.getCollegeId(),
                    College.class);
        } catch (ResourceAccessException e) {
            // College service is not available, create a placeholder college
            System.out.println("College service not available, using placeholder for college ID: " + student.getCollegeId());
            college = createPlaceholderCollege(student.getCollegeId());
        } catch (Exception e) {
            // Any other error, create a placeholder college
            System.out.println("Error fetching college information for ID: " + student.getCollegeId() + ", Error: " + e.getMessage());
            college = createPlaceholderCollege(student.getCollegeId());
        }
        
        ReponseTemplateValueObject vo = new ReponseTemplateValueObject();
        vo.setStudent(student);
        vo.setCollege(college);
        responseList.add(vo);
    }
    return responseList;
}

// Helper method to create a placeholder college when college service is not available
private College createPlaceholderCollege(String collegeId) {
    College placeholderCollege = new College();
    try {
        placeholderCollege.setId(Long.parseLong(collegeId));
    } catch (NumberFormatException e) {
        placeholderCollege.setId(0L); // Default ID if collegeId is not a valid number
    }
    placeholderCollege.setCollegeName("College Service Unavailable");
    placeholderCollege.setAddress("Service not running");
    placeholderCollege.setUniversity("Unknown");
    return placeholderCollege;
}

// Method to get students by college ID without fetching college details (when college service is not available)
public List<Student> getStudentsByCollegeIdOnly(String collegeId) {
    return studentRepository.getStudentByCollegeId(collegeId);
}

}
