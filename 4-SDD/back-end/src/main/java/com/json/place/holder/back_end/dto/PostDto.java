package com.json.place.holder.back_end.dto;

public record PostDto(
    Integer userId,
    Integer id,
    String title,
    String body
) {}
