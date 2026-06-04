package com.GAKOM_ECOTACNA.ECOTACNA.dto;

import com.GAKOM_ECOTACNA.ECOTACNA.model.CompanyType;
import com.GAKOM_ECOTACNA.ECOTACNA.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotNull(message = "El RUC es obligatorio")
    @Pattern(regexp = "\\d{11}", message = "El RUC debe constar de 11 dígitos numéricos")
    private String ruc;

    @NotNull(message = "El email corporativo es obligatorio")
    @Email(message = "El formato de email es inválido")
    @Size(max = 150)
    private String email;

    @NotNull(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 50, message = "La contraseña debe tener entre 6 y 50 caracteres")
    private String password;

    @NotNull(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String firstName;

    @NotNull(message = "El apellido es obligatorio")
    @Size(max = 100)
    private String lastName;

    @NotNull(message = "El rol de la empresa es obligatorio")
    private Role role;
}
