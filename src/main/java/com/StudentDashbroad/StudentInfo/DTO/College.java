package com.StudentDashbroad.StudentInfo.DTO;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class College {
    private Long id ;
    private String collegeName;
    private String address;
    private String university;
}
