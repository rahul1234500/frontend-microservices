package com.StudentDashbroad.StudentInfo.DTO;

import com.StudentDashbroad.StudentInfo.model.Student;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReponseTemplateValueObject {
    private Student student;
    private College college;
}
