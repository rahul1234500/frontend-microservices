package com.StudentDashbroad.StudentInfo.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "students") // mongodb collection
@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Student {
    @Id
    private String id ;
    private String name ;
    private String address ;
    private String age ;
    private String collegeId;
}
