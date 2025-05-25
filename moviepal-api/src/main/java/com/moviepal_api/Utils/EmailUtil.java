package com.moviepal_api.Utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class EmailUtil {
    public static boolean checkIfEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        Pattern pattern = Pattern.compile(emailRegex);
        if (email == null) return false;
        Matcher matcher = pattern.matcher(email);
        return matcher.matches();
    }
}
