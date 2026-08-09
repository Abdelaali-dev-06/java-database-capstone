package com.project.back_end.models;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ElementCollection;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Entity
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    @Size(min=3,max=50)
    private String name;
    @NotNull
    @Size(min = 3 , max = 50)
    private String speciality;
    @Email
    @NotNull
    private String email;
    @NotNull
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 6)
    private String password;
    @Pattern(regexp = "^[0-9]{10}$")
    private String phone;
    @ElementCollection
    private List<String> availableTimes;

    public Doctor(String name, String speciality, String email, String password, String phone, List<String> availableTimes) {
        this.name = name;
        this.speciality = speciality;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.availableTimes = availableTimes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpeciality() {
        return speciality;
    }

    public void setSpeciality(String speciality) {
        this.speciality = speciality;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<String> getAvailableTimes() {
        return availableTimes;
    }

    public void setAvailableTimes(List<String> availableTimes) {
        this.availableTimes = availableTimes;
    }

}

