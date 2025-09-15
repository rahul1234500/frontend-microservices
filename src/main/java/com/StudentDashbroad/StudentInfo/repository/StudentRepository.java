package com.StudentDashbroad.StudentInfo.repository;

import com.StudentDashbroad.StudentInfo.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student , String> {
    List<Student> getStudentByCollegeId(String collegeId);

    Student findByName(String name);
}
