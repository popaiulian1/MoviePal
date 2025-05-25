package com.moviepal_api.DTOs;

import com.moviepal_api.Models.Cinema;
import com.moviepal_api.Models.CinemaEntry;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CinemaEntryDetailsDto {
    private CinemaEntry entry;
    private Cinema cinema;
}